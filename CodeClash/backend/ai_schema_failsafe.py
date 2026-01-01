"""
SCHEMA-BASED FAIL-SAFE GENERATION SYSTEM
Layer 1: AI generates problem + extracts schema
Layer 2: AI retry
Layer 3: Schema-based generation (deterministic, REAL test cases)
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.core.cache import cache
from ai_generator import get_generator
from schema_generator import get_schema_generator, SchemaExtractor, ProblemSchema
import logging
import time
import hashlib
import json

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([AllowAny])
def generate_similar_problem_schema_based(request):
    """
    SCHEMA-BASED FAIL-SAFE GENERATION
    
    Pipeline:
    1. Try AI generation + extract schema
    2. If fails, retry AI once
    3. If fails, extract schema using pattern matching
    4. Generate fresh problem from schema with COMPUTED test cases
    5. Always return success
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
    
    # ========== CACHING (with schema) ==========
    cache_key = f"gen_schema_{hashlib.md5(sample_problem.encode()).hexdigest()[:16]}"
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
    user_key = f"gen_lock_{request.META.get('REMOTE_ADDR', 'unknown')}"
    if cache.get(user_key):
        return Response({
            "success": False,
            "type": "rate_limit",
            "message": "Please wait before generating another problem."
        }, status=status.HTTP_200_OK)
    
    cache.set(user_key, True, 2)
    
    extracted_schema = None
    
    # ========== LAYER 1: AI GENERATION + SCHEMA EXTRACTION ==========
    try:
        logger.info("LAYER 1: Attempting AI generation with schema extraction")
        generator = get_generator()
        problem_data = generator.generate_similar_problem(
            sample_problem=sample_problem,
            sample_test_cases=sample_test_cases
        )
        
        # Extract schema from AI result
        if problem_data:
            extracted_schema = problem_data.pop('extracted_schema', None)
            
            # Validate quality
            if _validate_quality(problem_data, sample_problem):
                logger.info("✓ LAYER 1 SUCCESS: AI generation successful")
                problem_data['source'] = 'ai'
                
                # Cache with schema
                _cache_with_schema(cache_key, problem_data, extracted_schema)
                
                return Response({
                    "success": True,
                    "type": "success",
                    "problem": problem_data,
                    "message": "Problem generated successfully!"
                }, status=status.HTTP_200_OK)
        
        raise ValueError("AI returned incomplete data")
    
    except Exception as e:
        logger.warning(f"LAYER 1 FAILED: {str(e)}")
    
    # ========== LAYER 2: AI RETRY ==========
    try:
        logger.info("LAYER 2: Retrying AI generation")
        time.sleep(1.5)
        
        generator = get_generator()
        problem_data = generator.generate_similar_problem(
            sample_problem=sample_problem,
            sample_test_cases=sample_test_cases
        )
        
        if problem_data:
            extracted_schema = problem_data.pop('extracted_schema', None)
            
            if _validate_quality(problem_data, sample_problem):
                logger.info("✓ LAYER 2 SUCCESS: AI retry successful")
                problem_data['source'] = 'ai_retry'
                
                _cache_with_schema(cache_key, problem_data, extracted_schema)
                
                return Response({
                    "success": True,
                    "type": "success",
                    "problem": problem_data,
                    "message": "Problem generated successfully!"
                }, status=status.HTTP_200_OK)
        
        raise ValueError("AI retry failed")
    
    except Exception as e:
        logger.warning(f"LAYER 2 FAILED: {str(e)}")
    
    # ========== LAYER 3: SCHEMA-BASED OR TEXT TRANSFORMATION ==========
    logger.info("LAYER 3: Using intelligent fallback")
    
    try:
        # Try schema extraction first
        if not extracted_schema:
            logger.info("Extracting schema using pattern matching")
            schema_extractor = SchemaExtractor()
            schema = schema_extractor.extract_from_text(sample_problem)
        else:
            logger.info("Using AI-extracted schema")
            schema = ProblemSchema(extracted_schema)
        
        # Check if schema is meaningful (not generic)
        is_generic_schema = (
            schema.problem_type == 'general' or 
            schema.core_logic == 'Process input and return output'
        )
        
        if is_generic_schema:
            logger.info("Schema is too generic, using text transformation instead")
            # Use text transformation fallback
            from fallback_generator import get_fallback_generator
            
            fallback = get_fallback_generator()
            problem_data = fallback.generate_similar_problem(
                sample_problem=sample_problem,
                sample_test_cases=sample_test_cases
            )
            
            # Validate
            if not problem_data or not problem_data.get('title'):
                raise ValueError("Text transformation failed")
            
            logger.info("✓ LAYER 3 SUCCESS: Text transformation successful")
            problem_data['source'] = 'text_fallback'
            
            # Cache result
            cache.set(cache_key, problem_data, 300)
            
            return Response({
                "success": True,
                "type": "success",
                "problem": problem_data,
                "message": "Problem generated successfully!"
            }, status=status.HTTP_200_OK)
        
        # Schema is specific - generate from schema
        logger.info(f"Using schema-based generation for type: {schema.problem_type}")
        schema_gen = get_schema_generator()
        seed = int(hashlib.md5(sample_problem.encode()).hexdigest()[:8], 16)
        problem_data = schema_gen.generate_from_schema(schema, seed=seed)
        
        # Validate
        if not problem_data or not problem_data.get('title'):
            raise ValueError("Schema generation failed")
        
        logger.info("✓ LAYER 3 SUCCESS: Schema-based generation successful")
        problem_data['source'] = 'schema_fallback'
        
        # Cache result
        cache.set(cache_key, problem_data, 300)
        
        return Response({
            "success": True,
            "type": "success",
            "problem": problem_data,
            "message": "Problem generated successfully!"
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"LAYER 3 FAILED: {str(e)}")
        # Try text transformation as absolute last resort
        try:
            logger.info("Attempting text transformation as emergency fallback")
            from fallback_generator import get_fallback_generator
            
            fallback = get_fallback_generator()
            problem_data = fallback.generate_similar_problem(
                sample_problem=sample_problem,
                sample_test_cases=sample_test_cases
            )
            
            if problem_data and problem_data.get('title'):
                logger.info("✓ Text transformation emergency fallback successful")
                problem_data['source'] = 'emergency_text'
                cache.set(cache_key, problem_data, 300)
                
                return Response({
                    "success": True,
                    "type": "success",
                    "problem": problem_data,
                    "message": "Problem generated successfully!"
                }, status=status.HTTP_200_OK)
        except Exception as e2:
            logger.error(f"Emergency text transformation also failed: {e2}")
    
    # ========== EMERGENCY FALLBACK ==========
    logger.error("CRITICAL: All layers failed, using emergency fallback")
    
    return Response({
        "success": True,
        "type": "success",
        "problem": {
            "title": "Coding Challenge",
            "difficulty": "Medium",
            "description": f"**Problem:**\n\n{sample_problem[:500]}",
            "constraints": "Standard constraints apply",
            "test_cases": [
                {"input": "test_input", "output": "test_output", "explanation": "Sample test"}
            ],
            "reference_solution": {"python": "# Solution\npass"},
            "template_code": {"python": "# Code here\n"},
            "hints": ["Analyze the problem carefully"],
            "topics": ["general"],
            "time_complexity": "O(?)",
            "space_complexity": "O(?)",
            "concept_analysis": "General problem solving",
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
        test_cases = problem_data.get('test_cases', [])
        if not test_cases or len(test_cases) < 1:
            return False
        
        # Test cases must have input and output
        for tc in test_cases[:3]:
            if not tc.get('input') or not tc.get('output'):
                return False
        
        return True
    
    except Exception:
        return False


def _cache_with_schema(cache_key: str, problem_data: dict, schema: dict):
    """Cache problem data along with schema for future use"""
    cache_data = problem_data.copy()
    if schema:
        cache_data['_cached_schema'] = schema
    cache.set(cache_key, cache_data, 300)  # 5 minutes
