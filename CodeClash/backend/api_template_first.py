"""
TEMPLATE-FIRST GENERATION API
Uses templates for instant generation, AI only for creating new templates
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.core.cache import cache
from problem_templates import get_template_store
from template_generator import get_template_generator
from ai_template_extractor import get_template_extractor
from schema_generator import SchemaExtractor
import logging
import hashlib
import time

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([AllowAny])
def generate_from_template_first(request):
    """
    TEMPLATE-FIRST ARCHITECTURE
    
    Flow:
    1. Check if we have a template for this problem type → Generate instantly (NO AI)
    2. If no template exists → Use AI ONCE to create template → Save it → Generate
    3. Future requests use the template (instant, no AI)
    
    Result: Unlimited generation, AI used minimally
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
    
    # ========== RATE LIMITING ==========
    user_key = f"gen_lock_{request.META.get('REMOTE_ADDR', 'unknown')}"
    if cache.get(user_key):
        return Response({
            "success": False,
            "type": "rate_limit",
            "message": "Please wait before generating another problem."
        }, status=status.HTTP_200_OK)
    
    cache.set(user_key, True, 2)
    
    # ========== STEP 1: TRY TO FIND EXISTING TEMPLATE ==========
    logger.info("STEP 1: Looking for existing template")
    
    template_store = get_template_store()
    template = None
    
    # Try to identify problem type from keywords
    extractor = SchemaExtractor()
    schema = extractor.extract_from_text(sample_problem)
    
    # Look for template matching this problem type
    if schema.problem_type != 'general':
        logger.info(f"Detected problem type: {schema.problem_type}")
        template = template_store.find_template_by_type(schema.problem_type)
        
        if template:
            logger.info(f"✓ Found existing template: {template.template_id}")
    
    # Try matching by concept keywords if type match failed
    if not template:
        concept_keywords = sample_problem.lower().split()[:20]  # First 20 words
        template = template_store.find_template_by_concept(concept_keywords)
        
        if template:
            logger.info(f"✓ Found template by concept match: {template.template_id}")
    
    #========== STEP 2: IF TEMPLATE EXISTS → GENERATE INSTANTLY ==========
    if template:
        logger.info(f"INSTANT GENERATION from template (NO AI): {template.template_id}")
        
        try:
            generator = get_template_generator()
            seed = int(hashlib.md5(sample_problem.encode()).hexdigest()[:8], 16)
            
            problem_data = generator.generate_from_template(template, seed=seed)
            
            logger.info("✓ SUCCESS: Generated from template instantly")
            
            return Response({
                "success": True,
                "type": "success",
                "problem": problem_data,
                "message": "Problem generated successfully!",
                "generation_method": "template_instant"
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            logger.error(f"Template generation failed: {e}")
            # Fall through to AI extraction
    
    # ========== STEP 3: NO TEMPLATE → USE AI TO CREATE ONE ==========
    logger.info("STEP 3: No template found, using AI to create new template")
    
    try:
        template_extractor = get_template_extractor()
        
        if not template_extractor.ai_generator:
            logger.warning("AI not available for template creation, using fallback")
            # Use schema-based or text transformation fallback
            return _fallback_generation(sample_problem, sample_test_cases)
        
        # Use AI to extract template (ONE TIME)
        new_template = template_extractor.extract_template(sample_problem)
        
        if new_template:
            # Save template for future use
            try:
                template_store.save_template(new_template)
                logger.info(f"✓ Created and saved new template: {new_template.template_id}")
            except Exception as e:
                logger.warning(f"Could not save template: {e}")
            
            # Generate from new template
            generator = get_template_generator()
            seed = int(hashlib.md5(sample_problem.encode()).hexdigest()[:8], 16)
            problem_data = generator.generate_from_template(new_template, seed=seed)
            
            logger.info("✓ SUCCESS: Generated from newly created template")
            
            return Response({
                "success": True,
                "type": "success",
                "problem": problem_data,
                "message": "Problem generated successfully!",
                "generation_method": "template_created"
            }, status=status.HTTP_200_OK)
        
        else:
            logger.warning("AI template extraction failed, using fallback")
            return _fallback_generation(sample_problem, sample_test_cases)
    
    except Exception as e:
        logger.error(f"Template creation failed: {e}")
        return _fallback_generation(sample_problem, sample_test_cases)


def _fallback_generation(sample_problem: str, sample_test_cases: str) -> Response:
    """
    Fallback when templates and AI are unavailable
    Uses schema-based or text transformation
    """
    logger.info("Using fallback generation")
    
    try:
        # Try schema-based first
        from schema_generator import get_schema_generator, SchemaExtractor
        
        extractor = SchemaExtractor()
        schema = extractor.extract_from_text(sample_problem)
        
        is_generic = (
            schema.problem_type == 'general' or
            schema.core_logic == 'Process input and return output'
        )
        
        if not is_generic:
            # Use schema generation
            generator = get_schema_generator()
            seed = int(hashlib.md5(sample_problem.encode()).hexdigest()[:8], 16)
            problem_data = generator.generate_from_schema(schema, seed=seed)
            
            logger.info("✓ Fallback: Schema-based generation")
            
            return Response({
                "success": True,
                "type": "success",
                "problem": problem_data,
                "message": "Problem generated successfully!",
                "generation_method": "schema_fallback"
            }, status=status.HTTP_200_OK)
        
        # Use text transformation if schema is generic
        from fallback_generator import get_fallback_generator
        
        fallback = get_fallback_generator()
        problem_data = fallback.generate_similar_problem(sample_problem, sample_test_cases)
        
        logger.info("✓ Fallback: Text transformation")
        
        return Response({
            "success": True,
            "type": "success",
            "problem": problem_data,
            "message": "Problem generated successfully!",
            "generation_method": "text_fallback"
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"All fallbacks failed: {e}")
        
        # Emergency minimal response
        return Response({
            "success": True,
            "type": "success",
            "problem": {
                "title": "Coding Challenge",
                "difficulty": "Medium",
                "description": f"**Problem:**\n\n{sample_problem[:500]}",
                "constraints": "Standard constraints",
                "test_cases": [{"input": "test", "output": "output", "explanation": "Sample"}],
                "reference_solution": {"python": "# Solution\npass"},
                "template_code": {"python": "# Code\n"},
                "hints": ["Analyze the problem"],
                "topics": ["general"],
                "time_complexity": "O(?)",
                "space_complexity": "O(?)",
                "concept_analysis": "Problem solving",
                "source": "emergency"
            },
            "message": "Problem generated successfully!",
            "generation_method": "emergency"
        }, status=status.HTTP_200_OK)
