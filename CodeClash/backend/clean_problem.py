
import os
import django
import re

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from problems.models import Problem

def clean_input(text):
    # Remove // comments
    lines = text.split('\n')
    cleaned_lines = []
    for line in lines:
        # Split by // and take first part
        code_part = line.split('//')[0].strip()
        if code_part:
            cleaned_lines.append(code_part)
    return '\n'.join(cleaned_lines)

try:
    # Get the most recently created problem
    p = Problem.objects.order_by('-created_at').first()
    if not p:
        print("No problems found.")
    else:
        print(f"Cleaning Problem: {p.title}")
        
        # Clean Test Cases
        for idx, tc in enumerate(p.test_cases.all().order_by('id')): # User ID to keep insertion order if order is 0
             original_input = tc.input_data
             cleaned = clean_input(original_input)
             
             # Also update order
             tc.order = idx
             tc.input_data = cleaned
             tc.save()
             
             print(f"cleaned Case {idx}")
             if original_input != cleaned:
                 print(f"  Removed Comments from Case {idx}")

except Exception as e:
    print(e)
