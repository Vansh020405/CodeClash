from django.core.management.base import BaseCommand
from problems.models import Problem, TestCase
import json

class Command(BaseCommand):
    help = 'Seeds the database with 5 standard coding problems'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding problems...')

        problems_data = [
            {
                "title": "Palindrome Number",
                "slug": "palindrome-number",
                "difficulty": "Easy",
                "description": """
**Description:**

Given an integer `x`, return `true` if `x` is a **palindrome**, and `false` otherwise.

An integer is a palindrome when it reads the same forward and backward.
For example, `121` is a palindrome while `123` is not.

**Example 1:**
```
Input: x = 121
Output: true
```

**Example 2:**
```
Input: x = -121
Output: false
Explanation: From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome.
```
""",
                "template_code": {
                    "python": "def isPalindrome(x: int) -> bool:\n    # Write your code here\n    pass",
                    "cpp": "class Solution {\npublic:\n    bool isPalindrome(int x) {\n        // Write your code here\n        return false;\n    }\n};",
                    "java": "class Solution {\n    public boolean isPalindrome(int x) {\n        // Write your code here\n        return false;\n    }\n}"
                },
                "test_cases": [
                    {"input": "121", "output": "true", "hidden": False},
                    {"input": "-121", "output": "false", "hidden": False},
                    {"input": "10", "output": "false", "hidden": False},
                    {"input": "12321", "output": "true", "hidden": True},
                    {"input": "0", "output": "true", "hidden": True}
                ]
            },
            {
                "title": "Valid Parentheses",
                "slug": "valid-parentheses",
                "difficulty": "Easy",
                "description": """
**Description:**

Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

**Example 1:**
```
Input: s = "()"
Output: true
```

**Example 2:**
```
Input: s = "()[]{}"
Output: true
```

**Example 3:**
```
Input: s = "(]"
Output: false
```
""",
                "template_code": {
                    "python": "def isValid(s: str) -> bool:\n    # Write your code here\n    pass",
                    "cpp": "class Solution {\npublic:\n    bool isValid(string s) {\n        // Write your code here\n        return false;\n    }\n};",
                    "java": "class Solution {\n    public boolean isValid(String s) {\n        // Write your code here\n        return false;\n    }\n}"
                },
                "test_cases": [
                    {"input": "\"()\"", "output": "true", "hidden": False},
                    {"input": "\"()[]{}\"", "output": "true", "hidden": False},
                    {"input": "\"(]\"", "output": "false", "hidden": False},
                    {"input": "\"{[]}\"", "output": "true", "hidden": True}
                ]
            },
            {
                "title": "Merge Sorted Array",
                "slug": "merge-sorted-array",
                "difficulty": "Easy",
                "description": """
**Description:**

You are given two integer arrays `nums1` and `nums2`, sorted in **non-decreasing order**, and two integers `m` and `n`, representing the number of elements in `nums1` and `nums2` respectively.

**Example:**
```
Input: nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3
Output: [1,2,2,3,5,6]
```
*Note: For this platform, return the merged array instead of modifying in-place for simplicity in some languages, or output the array elements.*
""",
                "template_code": {
                    "python": "def merge(nums1, m, nums2, n):\n    # Write your code here\n    pass",
                    "cpp": "class Solution {\npublic:\n    vector<int> merge(vector<int>& nums1, int m, vector<int>& nums2, int n) {\n        // Write your code here\n        return {};\n    }\n};",
                    "java": "class Solution {\n    public int[] merge(int[] nums1, int m, int[] nums2, int n) {\n        // Write your code here\n        return new int[]{};\n    }\n}"
                },
                "test_cases": [
                    {"input": "[1,2,3,0,0,0]\n3\n[2,5,6]\n3", "output": "[1, 2, 2, 3, 5, 6]", "hidden": False},
                    {"input": "[1]\n1\n[]\n0", "output": "[1]", "hidden": False},
                    {"input": "[0]\n0\n[1]\n1", "output": "[1]", "hidden": False}
                ]
            },
            {
                "title": "Best Time to Buy and Sell Stock",
                "slug": "best-time-stock",
                "difficulty": "Easy",
                "description": """
**Description:**

You are given an array `prices` where `prices[i]` is the price of a given stock on the `i`th day.

You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.

Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return `0`.

**Example 1:**
```
Input: prices = [7,1,5,3,6,4]
Output: 5
Explanation: Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.
```
""",
                "template_code": {
                    "python": "def maxProfit(prices: list[int]) -> int:\n    # Write your code here\n    pass",
                    "cpp": "class Solution {\npublic:\n    int maxProfit(vector<int>& prices) {\n        // Write your code here\n        return 0;\n    }\n};",
                    "java": "class Solution {\n    public int maxProfit(int[] prices) {\n        // Write your code here\n        return 0;\n    }\n}"
                },
                "test_cases": [
                    {"input": "[7,1,5,3,6,4]", "output": "5", "hidden": False},
                    {"input": "[7,6,4,3,1]", "output": "0", "hidden": False}
                ]
            },
            {
                "title": "Longest Substring Without Repeating Characters",
                "slug": "longest-substring",
                "difficulty": "Medium",
                "description": """
**Description:**

Given a string `s`, find the length of the **longest substring** without repeating characters.

**Example 1:**
```
Input: s = "abcabcbb"
Output: 3
Explanation: The answer is "abc", with the length of 3.
```

**Example 2:**
```
Input: s = "bbbbb"
Output: 1
Explanation: The answer is "b", with the length of 1.
```
""",
                "template_code": {
                    "python": "def lengthOfLongestSubstring(s: str) -> int:\n    # Write your code here\n    pass",
                    "cpp": "class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        // Write your code here\n        return 0;\n    }\n};",
                    "java": "class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Write your code here\n        return 0;\n    }\n}"
                },
                "test_cases": [
                    {"input": "\"abcabcbb\"", "output": "3", "hidden": False},
                    {"input": "\"bbbbb\"", "output": "1", "hidden": False},
                    {"input": "\"pwwkew\"", "output": "3", "hidden": False}
                ]
            }
        ]

        for p_data in problems_data:
            problem, created = Problem.objects.update_or_create(
                slug=p_data['slug'],
                defaults={
                    "title": p_data['title'],
                    "description": p_data['description'],
                    "difficulty": p_data['difficulty'],
                    "template_code": p_data['template_code']
                }
            )
            
            # Clear existing test cases to avoid duplicates on re-seed
            problem.test_cases.all().delete()
            
            for idx, tc_data in enumerate(p_data['test_cases'], 1):
                TestCase.objects.create(
                    problem=problem,
                    input_data=tc_data['input'],
                    expected_output=tc_data['output'],
                    is_hidden=tc_data['hidden'],
                    order=idx
                )
            
            action = "Created" if created else "Updated"
            self.stdout.write(self.style.SUCCESS(f'{action} problem: {problem.title}'))
