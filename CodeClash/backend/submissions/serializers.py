from rest_framework import serializers
from .models import Submission
from problems.serializers import ProblemListSerializer

class SubmissionSerializer(serializers.ModelSerializer):
    problem = ProblemListSerializer(read_only=True)
    
    class Meta:
        model = Submission
        fields = ['id', 'user', 'problem', 'code', 'language', 'verdict', 'runtime_ms', 'memory_kb', 'stdout', 'error', 'created_at']
        read_only_fields = ['id', 'user', 'verdict', 'runtime_ms', 'memory_kb', 'stdout', 'error', 'created_at']

class CreateSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = ['problem', 'code', 'language']
