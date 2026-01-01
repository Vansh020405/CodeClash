"""
Seed script for CodeClash database with proper reference solutions
Run with: python seed_data_v2.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from problems.models import Problem, TestCase
from django.contrib.auth import get_user_model

User = get_user_model()

def seed_database():
    print("🌱 Seeding database with enhanced judging data...")
    
    # Create admin user if doesn't exist
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser('admin', 'admin@codeclash.com', 'admin')
        print("✅ Created admin user (username: admin, password: admin)")
    
    # Clear existing problems
    Problem.objects.all().delete()
    print("🗑️  Cleared existing problems")
    
    # ============================================================
    # PROBLEM 1: Two Sum
    # ============================================================
    
    # Reference Solution (Source of Truth)
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
''',
        "cpp": '''#include <iostream>
#include <vector>
#include <unordered_map>
#include <sstream>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> seen;
    for (int i = 0; i < nums.size(); i++) {
        int complement = target - nums[i];
        if (seen.count(complement)) {
            return {seen[complement], i};
        }
        seen[nums[i]] = i;
    }
    return {};
}

int main() {
    // Read input
    string line;
    getline(cin, line);
    
    // Parse nums array
    vector<int> nums;
    stringstream ss(line.substr(1, line.size() - 2));
    int num;
    char comma;
    while (ss >> num) {
        nums.push_back(num);
        ss >> comma;
    }
    
    // Read target
    int target;
    cin >> target;
    
    // Execute solution
    vector<int> result = twoSum(nums, target);
    
    // Output
    cout << "[" << result[0] << ", " << result[1] << "]" << endl;
    
    return 0;
}
'''
    }
    
    # User Template Code (What students see)
    two_sum_template = {
        "python": '''class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        """
        Given an array of integers nums and a target,
        return indices of two numbers that sum to target.
        """
        # Your code here
        pass
''',
        "cpp": '''#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Your code here
        
    }
};
''',
        "java": '''import java.util.*;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
        
    }
}
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
""",
        difficulty="Easy",
        template_code=two_sum_template,
        reference_solution=two_sum_reference,
        time_limit_ms=2000,
        memory_limit_mb=256
    )
    
    # Test Cases with Expected Outputs
    test_cases = [
        {
            "input": "[2, 7, 11, 15]\n9",
            "output": "[0, 1]",
            "hidden": False,
            "order": 1
        },
        {
            "input": "[3, 2, 4]\n6",
            "output": "[1, 2]",
            "hidden": False,
            "order": 2
        },
        {
            "input": "[3, 3]\n6",
            "output": "[0, 1]",
            "hidden": False,
            "order": 3
        },
        {
            "input": "[-1, -2, -3, -4, -5]\n-8",
            "output": "[2, 4]",
            "hidden": True,
            "order": 4
        },
        {
            "input": "[0, 4, 3, 0]\n0",
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
    
    print(f"✅ Created problem: {two_sum.title}")
    print(f"   - {len(test_cases)} test cases (3 public, 2 hidden)")
    print(f"   - Languages: {', '.join(two_sum_reference.keys())}")
    
    print("\n🎉 Database seeded successfully!")
    print("\n📊 Summary:")
    print(f"   Total Problems: {Problem.objects.count()}")
    print(f"   Total Test Cases: {TestCase.objects.count()}")
    print("\n🔑 Admin Credentials:")
    print("   Username: admin")
    print("   Password: admin")
    print("\n🚀 Next Steps:")
    print("   1. Start backend: cd backend && python manage.py runserver")
    print("   2. Test judge: POST /api/judge/submit")
    print("   3. Validate reference: POST /api/executor/validate/")

if __name__ == "__main__":
    seed_database()
