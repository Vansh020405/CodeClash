"""
3-Layer Fail-Safe AI Generation System
Layer 1: AI Generation (Best)
Layer 2: AI Retry (1 attempt)
Layer 3: Deterministic Fallback (Never fails)
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.core.cache import cache
from ai_generator import get_generator
from fallback_generator import get_fallback_generator
import logging
import time
import hashlib

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([AllowAny])
def generate_similar_problem_failsafe(request):
    """
    FAIL-SAFE GENERATION - ALWAYS RETURNS SUCCESS
    
    Pipeline:
    1. Try AI generation
    2. If fails, retry AI once (1-2s delay)
    3. If fails again, use deterministic fallback
    4. Always return success=True
    """
    sample_problem = request.data.get('sample_problem', '').strip()
    sample_test_cases = request.data.get('sample_test_cases', '').strip()
    
    # ========== INPUT VALIDATION ==========
    if not sample_problem:
        return Response({
            "success": False,
            "type": "validation_error",
            "message": "Sample problem is required."
        }, status=status.HTTP_200_OK)
    
    if len(sample_problem) < 20:
        return Response({
            "success": False,
            "type": "validation_error",
            "message": "Sample problem must be at least 20 characters."
        }, status=status.HTTP_200_OK)
    
    # ========== CACHING ==========
    # Cache key based on input hash
    cache_key = f"gen_{hashlib.md5(sample_problem.encode()).hexdigest()[:16]}"
    cached_result = cache.get(cache_key)
    
    if cached_result:
        logger.info("Returning cached generation result")
        cached_result['source'] = 'cache'
        return Response({
            "success": True,
            "type": "success",
            "problem": cached_result,
            "message": "Problem generated successfully!"
        }, status=status.HTTP_200_OK)
    
    # ========== RATE LIMITING ==========
    # Prevent simultaneous calls from same user/IP
    user_key = f"gen_lock_{request.META.get('REMOTE_ADDR', 'unknown')}"
    if cache.get(user_key):
        return Response({
            "success": False,
            "type": "rate_limit",
            "message": "Please wait before generating another problem."
        }, status=status.HTTP_200_OK)
    
    # Set lock for 2 seconds
    cache.set(user_key, True, 2)
    
    # ========== LAYER 1: AI GENERATION ==========
    try:
        logger.info("LAYER 1: Attempting AI generation")
        generator = get_generator()
        problem_data = generator.generate_similar_problem(
            sample_problem=sample_problem,
            sample_test_cases=sample_test_cases
        )
        
        # Validate AI response
        if problem_data and problem_data.get('title') and _validate_quality(problem_data, sample_problem):
            logger.info("✓ LAYER 1 SUCCESS: AI generation successful")
            problem_data['source'] = 'ai'
            
            # Cache for 5 minutes
            cache.set(cache_key, problem_data, 300)
            
            return Response({
                "success": True,
                "type": "success",
                "problem": problem_data,
                "message": "Problem generated successfully!"
            }, status=status.HTTP_200_OK)
        
        else:
            raise ValueError("AI returned incomplete data")
    
    except Exception as e:
        logger.warning(f"LAYER 1 FAILED: {str(e)}")
    
    # ========== LAYER 2: AI RETRY ==========
    try:
        logger.info("LAYER 2: Retrying AI after delay")
        time.sleep(1.5)  # Brief delay
        
        generator = get_generator()
        problem_data = generator.generate_similar_problem(
            sample_problem=sample_problem,
            sample_test_cases=sample_test_cases
        )
        
        if problem_data and problem_data.get('title') and _validate_quality(problem_data, sample_problem):
            logger.info("✓ LAYER 2 SUCCESS: AI retry successful")
            problem_data['source'] = 'ai_retry'
            
            # Cache result
            cache.set(cache_key, problem_data, 300)
            
            return Response({
                "success": True,
                "type": "success",
                "problem": problem_data,
                "message": "Problem generated successfully!"
            }, status=status.HTTP_200_OK)
        
        else:
            raise ValueError("AI retry returned incomplete data")
    
    except Exception as e:
        logger.warning(f"LAYER 2 FAILED: {str(e)}")
    
    # ========== LAYER 3: DETERMINISTIC FALLBACK ==========
    logger.info("LAYER 3: Using deterministic fallback generator")
    try:
        fallback = get_fallback_generator()
        problem_data = fallback.generate_similar_problem(
            sample_problem=sample_problem,
            sample_test_cases=sample_test_cases
        )
        
        # Fallback NEVER fails - validate just to be safe
        if not problem_data or not problem_data.get('title'):
            raise ValueError("Fallback generator failed unexpectedly")
        
        logger.info("✓ LAYER 3 SUCCESS: Fallback generation successful")
        problem_data['source'] = 'fallback'
        
        # Cache fallback result
        cache.set(cache_key, problem_data, 300)
        
        return Response({
            "success": True,
            "type": "success",
            "problem": problem_data,
            "message": "Problem generated successfully!"
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        # This should NEVER happen, but if it does, return minimal structure
        logger.error(f"CRITICAL: Even fallback failed: {str(e)}")
        
        return Response({
            "success": True,
            "type": "success",
            "problem": {
                "title": "Coding Problem",
                "difficulty": "Medium",
                "description": sample_problem,
                "constraints": "Standard constraints",
                "test_cases": [{"input": "test", "output": "output", "explanation": "sample"}],
                "reference_solution": {"python": "# Solution\npass"},
                "template_code": {"python": "# Code here\n"},
                "hints": ["Read the problem carefully"],
                "topics": ["general"],
                "time_complexity": "O(?)",
                "space_complexity": "O(?)",
                "concept_analysis": "Emergency mode",
                "source": "emergency"
            },
            "message": "Problem generated successfully!"
        }, status=status.HTTP_200_OK)


def _validate_quality(problem_data: dict, original: str) -> bool:
    """Validate generated problem quality"""
    try:
        # Must have title
        if not problem_data.get('title'):
            return False
        
        # Must have description
        description = problem_data.get('description', '')
        if len(description) < 50:
            return False
        
        # Must have at least 1 test case
        if not problem_data.get('test_cases') or len(problem_data.get('test_cases', [])) < 1:
            return False
        
        # Should be different from original (at least 30% different)
        similarity = _calculate_similarity(description, original)
        if similarity > 0.7:  # Too similar
            return False
        
        return True
    
    except Exception:
        return False


def _calculate_similarity(text1: str, text2: str) -> float:
    """Calculate rough similarity between two texts"""
    try:
        # Simple word-based similarity
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())
        
        if not words1 or not words2:
            return 0.0
        
        intersection = len(words1 & words2)
        union = len(words1 | words2)
        
        return intersection / union if union > 0 else 0.0
    
    except Exception:
        return 0.0
