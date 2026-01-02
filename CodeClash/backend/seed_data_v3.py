"""
Updated seed script with CP-friendly format (Size -> Array -> Target)
"""
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from problems.models import Problem, TestCase
from django.contrib.auth import get_user_model

User = get_user_model()

def seed_database():
    print("🌱 Re-seeding database with CP-friendly I/O...")
    
    # Clear and recreate
    Problem.objects.all().delete()
    
    # Reference Solution (Python)
    two_sum_reference = {
        "python": '''import sys

def solve():
    try:
        line1 = sys.stdin.readline()
        if not line1: return
        n = int(line1.strip())
        
        line2 = sys.stdin.readline()
        if not line2: return
        nums = list(map(int, line2.strip().split()))
        
        line3 = sys.stdin.readline()
        if not line3: return
        target = int(line3.strip())
        
        lookup = {}
        for i, num in enumerate(nums):
            complement = target - num
            if complement in lookup:
                print(f"[{lookup[complement]}, {i}]")
                return
            lookup[num] = i
        print("[]")
    except Exception:
        return

if __name__ == "__main__":
    solve()
'''
    }
    
    # User Templates
    two_sum_templates = {
        "python": '''import sys

# Read input
# Format:
# N (size)
# a1 a2 ... an (array)
# Target

def solve():
    # TODO: Write your code here
    try:
        line = sys.stdin.readline()
        if not line: return
        n = int(line.strip())
        
        nums = list(map(int, sys.stdin.readline().split()))
        target = int(sys.stdin.readline())
        
        # Your logic here...
        pass
        
    except Exception:
        pass

if __name__ == "__main__":
    solve()
''',
        "cpp": '''#include <iostream>
#include <vector>
#include <unordered_map>

using namespace std;

int main() {
    // Read N
    int n;
    if (!(cin >> n)) return 0;
    
    // Read Array
    vector<int> nums(n);
    for (int i = 0; i < n; i++) {
        cin >> nums[i];
    }

    // Read Target
    int target;
    cin >> target;

    // TODO: Write your solution here
    // Print output as [index1, index2]
    
    return 0;
}
'''
    }
    
    # Create Problem
    first_problem = Problem.objects.create(
        title="Two Sum",
        slug="two-sum",
        description="""### Problem Statement

Given an array of integers `nums` and an integer `target`, return **indices of the two numbers** such that they add up to `target`.

### Input Format
1. An integer `n` (size of array).
2. `n` space-separated integers representing `nums`.
3. An integer `target`.

### Output Format
- Print the result as a list: `[index1, index2]`

### Example 1:
```
Input:
4
2 7 11 15
9

Output:
[0, 1]
```

### Example 2:
```
Input:
3
3 2 4
6

Output:
[1, 2]
```
""",
        difficulty="Easy",
        input_format="N (size)\nArray elements\nTarget",
        output_format="[index1, index2]",
        constraints="2 <= N <= 10^4",
        template_code=two_sum_templates,
        reference_solution=two_sum_reference,
        time_limit_ms=2000,
        memory_limit_mb=256
    )
    
    # CP-Friendly Test Cases (N \n Array \n Target)
    test_cases = [
        {
            "input": "4\n2 7 11 15\n9",
            "output": "[0, 1]",
            "hidden": False,
            "order": 1
        },
        {
            "input": "3\n3 2 4\n6",
            "output": "[1, 2]",
            "hidden": False,
            "order": 2
        },
        {
            "input": "2\n3 3\n6",
            "output": "[0, 1]",
            "hidden": False,
            "order": 3
        },
        {
            "input": "5\n-1 -2 -3 -4 -5\n-8",
            "output": "[2, 4]",
            "hidden": True,
            "order": 4
        },
        {
            "input": "4\n0 4 3 0\n0",
            "output": "[0, 3]",
            "hidden": True,
            "order": 5
        }
    ]
    
    for tc in test_cases:
        TestCase.objects.create(
            problem=first_problem,
            input_data=tc["input"],
            expected_output=tc["output"],
            is_hidden=tc["hidden"],
            order=tc["order"]
        )
    
    print(f"✅ Updated problem: {first_problem.title}")
    print(f"   - Input Format: N \\n Array \\n Target")
    print(f"   - {len(test_cases)} test cases")
    print("\\n🎉 Database updated successfully!")
    print("\\n🚀 Refresh the frontend page to see the new template code")

if __name__ == "__main__":
    seed_database()
