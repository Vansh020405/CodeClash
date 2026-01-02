"""
API Views for AI Problem Normalization and Management
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.response import Response
from problems.models import Problem, TestCase
from problems.serializers import ProblemDetailSerializer
from ai_generator import get_generator

@api_view(['POST'])
@permission_classes([AllowAny])
def normalize_problem(request):
    """
    Normalize a student-submitted problem into a compiler-ready format.
    
    POST /api/ai/normalize/
    {
        "title": "Problem Title",
        "description": "Raw description...",
        "sample_input": "...",
        "sample_output": "...",
        "constraints": "O(N) time",
        "extra_test_cases": [{"input": "...", "output": "..."}, ...]
    }
    """
    title = request.data.get('title')
    description = request.data.get('description')
    sample_input = request.data.get('sample_input', '')
    sample_output = request.data.get('sample_output', '')
    input_format = request.data.get('input_format', '')
    output_format = request.data.get('output_format', '')
    constraints = request.data.get('constraints', '')
    extra_test_cases = request.data.get('extra_test_cases', [])
    
    if not title or not description:
        return Response(
            {"error": "Title and Description are required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        generator = get_generator()
        normalized_problem = generator.normalize_problem(
            title=title,
            description=description,
            sample_input=sample_input,
            sample_output=sample_output,
            input_format_str=input_format,
            output_format_str=output_format,
            constraints_input=constraints,
            extra_test_cases=extra_test_cases
        )
        
        return Response({
            "success": True,
            "problem": normalized_problem
        })
        
    except ValueError as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        # Log the error in a real app
        print(f"Normalization failed: {e}")
        return Response(
            {"error": "Internal AI Processing Error. Please check your input and try again."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def save_generated_problem(request):
    """
    Save normalized problem to database
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
        slug = title.lower().replace(' ', '-').replace("'", "").replace('"', '').strip('-')
        
        # Check if slug exists
        base_slug = slug
        counter = 1
        while Problem.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        # Extract test cases
        test_cases_data = problem_data.pop('test_cases', [])
        reference_solution = problem_data.pop('reference_solution', {})
        
        # Create problem
        problem = Problem.objects.create(
            title=title,
            slug=slug,
            difficulty=problem_data.get('difficulty', 'Medium'),
            description=problem_data.get('description', ''),
            input_format=problem_data.get('input_format', ''),
            output_format=problem_data.get('output_format', ''),
            constraints=problem_data.get('constraints', ''),
            reference_solution=reference_solution,
            template_code={
                'python': '# Write your solution here\n',
                'cpp': '// Write your solution here\n',
                'java': '// Write your solution here\n'
            },
            time_limit_ms=2000,
            memory_limit_mb=256,
            created_by=user_email,
            is_ai_generated=True,
            # Store logic metadata if model supports it, otherwise ignore
        )
        
        # Create test cases
        # Sort so sample is first if possible, but the list from generator usually has sample first
        # Create test cases
        # Sort so sample is first if possible, but the list from generator usually has sample first
        for idx, tc_data in enumerate(test_cases_data):
            # Determine visibility
            explanation = tc_data.get('explanation', '')
            is_user_provided = explanation == "User provided test case"
            is_sample = idx == 0
            
            # Allow user-provided cases and the first sample to be public
            is_hidden = not (is_sample or is_user_provided)

            TestCase.objects.create(
                problem=problem,
                input_data=tc_data.get('input', ''),
                expected_output=tc_data.get('output', ''),
                explanation=explanation, # Save the explanation!
                is_hidden=is_hidden, 
                order=idx
            )
        
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

@api_view(['GET'])
@permission_classes([IsAdminUser])
def generator_status(request):
    """Check AI status"""
    try:
        import os
        has_api_key = bool(os.environ.get('GEMINI_API_KEY'))
        return Response({
            "configured": has_api_key,
            "message": "AI Generator (Normalizer) is ready"
        })
    except Exception as e:
        return Response({"configured": False, "error": str(e)})
