
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from problems.models import Problem, TestCase

User = get_user_model()

def seed():
    # 1. Create Superuser
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser('admin', 'admin@codeclash.com', 'admin')
        print("✅ Superuser created (admin/admin)")
    else:
        print("ℹ️ Superuser already exists")

    # 2. Create Two Sum Problem
    if not Problem.objects.filter(slug='two-sum').exists():
        p = Problem.objects.create(
            title="Two Sum",
            slug="two-sum",
            difficulty="Easy",
            description="""
### Problem Statement
Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.
You may assume that each input would have exactly one solution, and you may not use the same element twice.

**Example 1:**
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
            """,
            template_code={
                "python": "class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        pass",
                "cpp": "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};",
                "java": "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}"
            },
            driver_code={
                "python": """
if __name__ == "__main__":
    s = Solution()
    # Read input from stdin or file provided by runner
    # Execute s.twoSum(...)
    # Print result to stdout
                """
            }
        )
        
        # 3. Add Test Cases
        TestCase.objects.create(
            problem=p,
            input_data='[2,7,11,15]\n9',
            expected_output='[0,1]',
            is_hidden=False
        )
        TestCase.objects.create(
            problem=p,
            input_data='[3,2,4]\n6',
            expected_output='[1,2]',
            is_hidden=False
        )
        TestCase.objects.create(
            problem=p,
            input_data='[3,3]\n6',
            expected_output='[0,1]',
            is_hidden=True
        )
        print("✅ Problem 'Two Sum' created with test cases")
    else:
        print("ℹ️ Problem 'Two Sum' already exists")

if __name__ == '__main__':
    seed()
