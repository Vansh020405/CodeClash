
import os
import django
import json

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from problems.models import Problem

try:
    p = Problem.objects.get(slug="two-sum")
    print(f"Problem: {p.title}")
    # print(f"Template Python: {p.template_code['python']}")
    # print(f"Template CPP: {p.template_code['cpp']}")
    
    print("\nTest Cases:")
    for tc in p.test_cases.all():
        print(f"--- Case {tc.order} ---")
        print(f"Input repr: {repr(tc.input_data)}")
        print(f"Expected: {tc.expected_output}")

except Exception as e:
    print(e)
