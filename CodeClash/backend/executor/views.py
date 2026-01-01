from rest_framework import views, permissions, status
from rest_framework.response import Response
from .judge import Judge
from .sandbox import DockerSandbox
from problems.models import Problem
from submissions.models import Submission
import logging

logger = logging.getLogger(__name__)


class JudgeSubmissionView(views.APIView):
    """
    Core Judge API Endpoint
    
    POST /api/judge/submit
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        # Extract and validate input
        problem_id = request.data.get('problem_id')
        language = request.data.get('language')
        code = request.data.get('code')
        mode = request.data.get('mode', 'run')
        
        # Validation
        if not all([problem_id, language, code]):
            return Response(
                {"error": "Missing required fields: problem_id, language, code"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if language not in ['python', 'cpp', 'c', 'java']:
            return Response(
                {"error": f"Unsupported language: {language}. Supported: python, cpp, c, java"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if mode not in ['run', 'submit']:
            return Response(
                {"error": "Mode must be 'run' or 'submit'"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Execute judgment
        try:
            judge = Judge()
            result = judge.judge_submission(
                problem_id=problem_id,
                code=code,
                language=language,
                mode=mode
            )
            
            # Save submission if in submit mode
            if mode == 'submit' and request.user.is_authenticated:
                Submission.objects.create(
                    user=request.user,
                    problem_id=problem_id,
                    code=code,
                    language=language,
                    verdict=result['verdict'],
                    runtime_ms=result.get('runtime_ms', 0),
                    memory_kb=result.get('memory_kb', 0)
                )
            
            logger.info(f"Judgment completed: {result['verdict']} for problem {problem_id}")
            return Response(result, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Judge error: {str(e)}", exc_info=True)
            return Response(
                {
                    "verdict": "ERROR",
                    "error": "Internal system error during judgment",
                    "test_cases": []
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class RunCodeView(views.APIView):
    """
    Legacy/Simple code execution endpoint (no test cases)
    For quick testing without a problem context
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        code = request.data.get('code')
        language = request.data.get('language', 'python')
        test_input = request.data.get('input', '')
        
        if not code:
            return Response(
                {"error": "Code is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        sandbox = DockerSandbox()
        result = sandbox.execute(
            code=code,
            language=language,
            test_input=test_input
        )
        
        return Response(result)


class ValidateReferenceView(views.APIView):
    """
    Admin endpoint to validate reference solutions
    """
    permission_classes = [permissions.AllowAny]  # TODO: Restrict to admin only
    
    def post(self, request):
        problem_id = request.data.get('problem_id')
        language = request.data.get('language', 'python')
        
        if not problem_id:
            return Response(
                {"error": "problem_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            problem = Problem.objects.get(id=problem_id)
        except Problem.DoesNotExist:
            return Response(
                {"error": "Problem not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        judge = Judge()
        is_valid, message = judge.validate_reference_solution(problem, language)
        
        return Response({
            "valid": is_valid,
            "message": message,
            "problem": problem.title
        })
