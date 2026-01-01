from django.db import models
from django.conf import settings
from problems.models import Problem
from uuid import uuid4

class Submission(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='submissions', on_delete=models.CASCADE)
    problem = models.ForeignKey(Problem, related_name='submissions', on_delete=models.CASCADE)
    code = models.TextField()
    language = models.CharField(max_length=50) # python, cpp, java
    verdict = models.CharField(max_length=50) # Accepted, Wrong Answer, etc.
    
    # Optional detailed outputs for debugging (not strictly required by basic list, but good for detail view)
    stdout = models.TextField(blank=True, null=True)
    error = models.TextField(blank=True, null=True)
    
    runtime_ms = models.IntegerField(null=True) # In milliseconds
    memory_kb = models.IntegerField(null=True) # In KB
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.problem.title} - {self.verdict}"
