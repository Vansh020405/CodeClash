"""
Additional AI View for generating similar problems with robust error handling
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from ai_generator import get_generator
import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([AllowAny])
def generate_similar_problem_view(request):
    """
    Generate similar problem with structured error types.
    """
    sample_problem = request.data.get('sample_problem', '').strip()
    sample_test_cases = request.data.get('sample_test_cases', '').strip()
    
    # CASE A: Validation Error
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
            "message": "Sample problem is too short (min 20 chars)."
        }, status=status.HTTP_200_OK)
    
    try:
        generator = get_generator()
        problem_data = generator.generate_similar_problem(
            sample_problem=sample_problem,
            sample_test_cases=sample_test_cases
        )
        
        # Validate AI Response Integrity
        if not problem_data or not problem_data.get('title'):
            raise ValueError("Incomplete data received from AI")

        # CASE C: Success
        return Response({
            "success": True,
            "type": "success",
            "problem": problem_data,
            "message": "Problem generated successfully!"
        }, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"AI Generation Failed: {str(e)}")
        error_str = str(e)
        
        if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
            return Response({
                "success": False,
                "type": "quota_exceeded",
                "message": "AI Usage Limit Reached. Please try again later.",
                "debug_error": error_str
            }, status=status.HTTP_200_OK)  # Keep 200 OK so frontend handles JSON gracefully unless axios logic updated

        # CASE B: AI Unavailable (Trigger for Frontend Retry)
        return Response({
            "success": False,
            "type": "ai_unavailable",
            "message": "AI service temporarily unavailable or rate-limited.",
            "debug_error": error_str
        }, status=status.HTTP_200_OK)
