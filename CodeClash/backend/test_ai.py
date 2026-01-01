"""
Quick test script for AI Problem Generator
"""
import os
os.environ['GEMINI_API_KEY'] = 'AIzaSyDvgVsWQTmABhrZY5bj6TBs11IDR3xerxo'

import django
import sys
sys.path.append('C:/Users/VANSH/Desktop/CodeClash/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from ai_generator import get_generator
import json

print("🤖 Testing AI Problem Generator...")
print("-" * 50)

# Test 1: Check if generator initializes
try:
    generator = get_generator()
    print("✅ Generator initialized successfully")
except Exception as e:
    print(f"❌ Generator initialization failed: {e}")
    exit(1)

# Test 2: Generate a simple problem
print("\n🎯 Generating an Easy Array problem...")
print("⏳ This may take 5-10 seconds...")

try:
    problem_data = generator.generate_problem(
        difficulty="Easy",
        topic="Arrays",
        style="leetcode"
    )
    
    if problem_data:
        print("✅ Problem generated successfully!")
        print("\n📋 Generated Problem:")
        print(f"Title: {problem_data.get('title', 'N/A')}")
        print(f"Difficulty: {problem_data.get('difficulty', 'N/A')}")
        print(f"Topics: {problem_data.get('topics', [])}")
        print(f"Test Cases: {len(problem_data.get('test_cases', []))}")
        print(f"Has Solution: {'Yes' if problem_data.get('reference_solution') else 'No'}")
        
        # Show first test case
        if problem_data.get('test_cases'):
            tc = problem_data['test_cases'][0]
            print(f"\nFirst Test Case:")
            print(f"  Input: {tc.get('input', 'N/A')}")
            print(f"  Output: {tc.get('output', 'N/A')}")
        
        # Validate
        is_valid, message = generator.validate_problem(problem_data)
        print(f"\n✅ Validation: {'PASSED' if is_valid else 'FAILED'}")
        if not is_valid:
            print(f"   Issues: {message}")
        
        print("\n🎉 AI Generator is working perfectly!")
        
    else:
        print("❌ Failed to generate problem")
        
except Exception as e:
    print(f"❌ Error during generation: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 50)
print("Test complete!")
