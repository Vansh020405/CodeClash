"""
Updated seed script with working starter code
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from problems.models import Problem, TestCase
from django.contrib.auth import get_user_model

User = get_user_model()

def seed_database():
    print("🌱 Re-seeding database with working starter code...")
    
    # Clear and recreate
    Problem.objects.all().delete()
    
    # Reference Solution (stays the same - this is how outputs are generated)
    two_sum_reference = {
        "python": '''import sys
import json

def two_sum(nums, target):
    """Reference solution for Two Sum"""
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

# Read input
input_data = sys.stdin.read().strip()
nums, target = input_data.split('\\n')
nums = json.loads(nums)
target = int(target)

# Execute solution
result = two_sum(nums, target)
print(json.dumps(result))
'''
    }
    
    # Updated User Template - Now includes I/O handling
    two_sum_template = {
        "python": '''import sys
import json

def two_sum(nums, target):
    """
    Given an array of integers nums and a target,
    return indices of two numbers that sum to target.
    
    Args:
        nums: List of integers
        target: Target sum
        
    Returns:
        List containing indices [i, j]
    """
    # TODO: Write your solution here
    # Example: Use a hash map to find complement
    
    lookup = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in lookup:
            return [lookup[complement], i]
        lookup[num] = i
    
    return []

# DO NOT MODIFY BELOW THIS LINE
# (This handles input/output for the judge)
if __name__ == "__main__":
    input_data = sys.stdin.read().strip()
    nums, target = input_data.split('\\n')
    nums = json.loads(nums)
    target = int(target)
    result = two_sum(nums, target)
    print(json.dumps(result))
'''
    }
    
    # Create Problem
    two_sum = Problem.objects.create(
        title="Two Sum",
        slug="two-sum",
        description="""### Problem Statement

Given an array of integers `nums` and an integer `target`, return **indices of the two numbers** such that they add up to `target`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.

### Example 1:
```
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
```

### Example 2:
```
Input: nums = [3,2,4], target = 6
Output: [1,2]
```

### Example 3:
```
Input: nums = [3,3], target = 6
Output: [0,1]
```

### Constraints:
- `2 <= nums.length <= 10^4`
- `-10^9 <= nums[i] <= 10^9`
- `-10^9 <= target <= 10^9`
- Only one valid answer exists.

### Instructions:
- Implement the `two_sum()` function
- **DO NOT** modify the input/output handling code at the bottom
- Your solution should have O(n) time complexity
""",
        difficulty="Easy",
        template_code=two_sum_template,
        reference_solution=two_sum_reference,
        time_limit_ms=2000,
        memory_limit_mb=256
    )
    
    # Test Cases
    test_cases = [
        {
            "input": "[2, 7, 11, 15]\\n9",
            "output": "[0, 1]",
            "hidden": False,
            "order": 1
        },
        {
            "input": "[3, 2, 4]\\n6",
            "output": "[1, 2]",
            "hidden": False,
            "order": 2
        },
        {
            "input": "[3, 3]\\n6",
            "output": "[0, 1]",
            "hidden": False,
            "order": 3
        },
        {
            "input": "[-1, -2, -3, -4, -5]\\n-8",
            "output": "[2, 4]",
            "hidden": True,
            "order": 4
        },
        {
            "input": "[0, 4, 3, 0]\\n0",
            "output": "[0, 3]",
            "hidden": True,
            "order": 5
        }
    ]
    
    for tc in test_cases:
        TestCase.objects.create(
            problem=two_sum,
            input_data=tc["input"],
            expected_output=tc["output"],
            is_hidden=tc["hidden"],
            order=tc["order"]
        )
    
    print(f"✅ Updated problem: {two_sum.title}")
    print(f"   - Template now includes working solution!")
    print(f"   - {len(test_cases)} test cases")
    print("\\n🎉 Database updated successfully!")
    print("\\n🚀 Refresh the frontend page to see the new template code")

if __name__ == "__main__":
    seed_database()
