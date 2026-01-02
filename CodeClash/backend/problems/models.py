from django.db import models
from uuid import uuid4

class Problem(models.Model):
    DIFFICULTY_CHOICES = [
        ('Easy', 'Easy'),
        ('Medium', 'Medium'),
        ('Hard', 'Hard'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES)
    
    input_format = models.TextField(blank=True, default="")
    output_format = models.TextField(blank=True, default="")
    constraints = models.TextField(blank=True, default="")
    
    # Code templates for supported languages (starter code shown to users)
    template_code = models.JSONField(default=dict) 
    
    # ⭐ REFERENCE SOLUTION (CRITICAL FOR JUDGE ENGINE)
    # This is the single source of truth for generating expected outputs
    # Format: {"python": "solution code", "cpp": "solution code", ...}
    reference_solution = models.JSONField(default=dict, help_text="Trusted solution used to generate expected outputs")
    
    # Driver code to wrap user solutions (if needed)
    driver_code = models.JSONField(default=dict, blank=True)
    
    # Execution constraints
    time_limit_ms = models.IntegerField(default=2000, help_text="Time limit in milliseconds")
    memory_limit_mb = models.IntegerField(default=256, help_text="Memory limit in MB")
    
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.CharField(max_length=255, blank=True, null=True, help_text="Email or ID of the creator")
    is_ai_generated = models.BooleanField(default=False, help_text="Flag to identify problems created by AI")

    def __str__(self):
        return self.title

class TestCase(models.Model):
    problem = models.ForeignKey(Problem, related_name='test_cases', on_delete=models.CASCADE)
    input_data = models.TextField(help_text="Raw input data for the test case")
    expected_output = models.TextField(help_text="Expected output (generated from reference solution)")
    is_hidden = models.BooleanField(default=False, help_text="Hidden test cases only used in Submit mode")
    order = models.IntegerField(default=0, help_text="Execution order")
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"TestCase #{self.order} for {self.problem.title} (Hidden: {self.is_hidden})"
