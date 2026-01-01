"""
API Views for AI Problem Generation
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.response import Response
from django.conf import settings
from problems.models import Problem, TestCase
from problems.serializers import ProblemDetailSerializer
from ai_generator import get_generator
import uuid


@api_view(['POST'])
def generate_problem(request):
    """
    Generate a new problem using AI
    
    POST /api/ai/generate/
    {
        "difficulty": "Medium",
        "topic": "Arrays",  # optional
        "style": "leetcode"  # optional
    }
    """
    difficulty = request.data.get('difficulty', 'Medium')
    topic = request.data.get('topic', None)
    style = request.data.get('style', 'leetcode')
    
    # Validate difficulty
    if difficulty not in ['Easy', 'Medium', 'Hard']:
        return Response(
            {"error": "Invalid difficulty. Must be Easy, Medium, or Hard"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Generate problem
        generator = get_generator()
        problem_data = generator.generate_problem(
            difficulty=difficulty,
            topic=topic,
            style=style
        )
        
        if not problem_data:
            return Response(
                {"error": "Failed to generate problem. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Validate problem
        is_valid, message = generator.validate_problem(problem_data)
        if not is_valid:
            return Response(
                {"error": f"Generated problem has issues: {message}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Return generated problem (don't save yet - let admin review)
        return Response({
            "success": True,
            "problem": problem_data,
            "message": "Problem generated successfully. Review and save if it looks good."
        })
        
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def save_generated_problem(request):
    """
    Save AI-generated problem to database
    
    POST /api/ai/save/
    {
        "problem_data": { ... },
        "user_email": "user@example.com"  # Optional user email
    }
    """
    problem_data = request.data.get('problem_data')
    user_email = request.data.get('user_email', None)
    
    if not problem_data:
        return Response(
            {"error": "No problem data provided"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Create slug from title
        title = problem_data.get('title', 'Generated Problem')
        slug = title.lower().replace(' ', '-').replace("'", "")
        
        # Check if slug exists
        base_slug = slug
        counter = 1
        while Problem.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        # Extract test cases
        test_cases_data = problem_data.pop('test_cases', [])
        reference_solution = problem_data.pop('reference_solution', {})
        
        # Append constraints to description since there is no constraints field
        description = problem_data.get('description', '')
        constraints = problem_data.get('constraints', '')
        if constraints:
             # Check if description already has constraints to avoid logic duplication if simple append
             description += f"\n\n**Constraints:**\n{constraints}"

        # Create problem
        problem = Problem.objects.create(
            title=title,
            slug=slug,
            difficulty=problem_data.get('difficulty', 'Medium'),
            description=description,
            # constraints field removed
            reference_solution=reference_solution,
            template_code=problem_data.get('template_code', {
                'python': '# Write your solution here\n',
                'cpp': '// Write your solution here\n',
                'c': '// Write your solution here\n',
                'java': '// Write your solution here\n'
            }),
            time_limit_ms=2000,
            memory_limit_mb=256,
            created_by=user_email,
            is_ai_generated=True
        )
        
        # Create test cases
        for idx, tc_data in enumerate(test_cases_data):
            TestCase.objects.create(
                problem=problem,
                input_data=tc_data.get('input', ''),
                expected_output=tc_data.get('output', ''),
                is_hidden=(idx >= 3),  # First 3 are public, rest are hidden
            )
        
        # Serialize and return
        serializer = ProblemDetailSerializer(problem)
        
        return Response({
            "success": True,
            "problem": serializer.data,
            "message": f"Problem '{title}' saved successfully!"
        })
        
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAdminUser])
def generate_test_cases(request):
    """
    Generate additional test cases for existing problem
    
    POST /api/ai/generate-tests/
    {
        "problem_id": "uuid",
        "num_cases": 5
    }
    """
    problem_id = request.data.get('problem_id')
    num_cases = request.data.get('num_cases', 5)
    
    try:
        problem = Problem.objects.get(id=problem_id)
        
        generator = get_generator()
        new_test_cases = generator.generate_test_cases_only(
            problem_description=problem.description,
            num_cases=num_cases
        )
        
        return Response({
            "success": True,
            "test_cases": new_test_cases
        })
        
    except Problem.DoesNotExist:
        return Response(
            {"error": "Problem not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAdminUser])
def generator_status(request):
    """Check if AI generator is configured and ready"""
    try:
        import os
        has_api_key = bool(os.environ.get('GEMINI_API_KEY'))
        
        return Response({
            "configured": has_api_key,
            "message": "AI Generator is ready" if has_api_key else "GEMINI_API_KEY not set in environment",
            "model": "gemini-pro"
        })
    except Exception as e:
        return Response({
            "configured": False,
            "error": str(e)
        })
