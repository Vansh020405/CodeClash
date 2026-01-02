from rest_framework import serializers
from .models import Problem, TestCase

class TestCaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestCase
        fields = ['input_data', 'expected_output', 'is_hidden']

class ProblemListSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()

    class Meta:
        model = Problem
        fields = ['id', 'title', 'slug', 'difficulty', 'created_at', 'status', 'created_by', 'is_ai_generated']

    def get_status(self, obj):
        user = self.context.get('request').user
        if not user or not user.is_authenticated:
            return "Unsolved"
        
        try:
            # Check if user has solved it
            # Note: Ideally this should be optimized with annotations in the view
            if obj.submissions.filter(user=user, verdict="Accepted").exists():
                return "Solved"
            if obj.submissions.filter(user=user).exists():
                return "Attempted"
        except AttributeError:
            # submissions relationship doesn't exist yet
            pass
        return "Unsolved"

class ProblemDetailSerializer(serializers.ModelSerializer):
    test_cases = serializers.SerializerMethodField()

    class Meta:
        model = Problem
        fields = ['id', 'title', 'slug', 'description', 'input_format', 'output_format', 'constraints', 'difficulty', 'template_code', 'test_cases', 'created_at']

    def get_test_cases(self, obj):
        # Only return public test cases to the frontend
        public_test_cases = obj.test_cases.filter(is_hidden=False)
        return TestCaseSerializer(public_test_cases, many=True).data
