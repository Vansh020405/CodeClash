
import os
import django
import json

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from problems.models import Problem

try:
    problems = Problem.objects.all()
    print(f"Total Problems: {problems.count()}")
    for p in problems:
        print(f"ID: {p.id}")
        print(f"Title: {p.title}")
        print(f"Slug: {p.slug}")
        print("-" * 20)

except Exception as e:
    print(e)
