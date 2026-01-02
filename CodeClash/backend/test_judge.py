"""
Test script to validate judge and sandbox fixes
"""
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from executor.judge import Judge
from executor.sandbox import DockerSandbox
from problems.models import Problem, TestCase

def test_sandbox_basic():
    """Test basic sandbox execution"""
    print("\n" + "="*60)
    print("TEST 1: Basic Sandbox Execution")
    print("="*60)
    
    sandbox = DockerSandbox()
    
    # Test Python
    code = '''
import sys
data = sys.stdin.read().strip()
print(f"Hello {data}")
'''
    
    result = sandbox.execute(
        code=code,
        language="python",
        test_input="World"
    )
    
    print(f"Verdict: {result['verdict']}")
    print(f"Output: {repr(result['stdout'])}")
    print(f"Stderr: {repr(result['stderr'])}")
    print(f"Runtime: {result['runtime_ms']}ms")
    
    expected = "Hello World"
    actual = result['stdout'].strip()
    
    if actual == expected:
        print("✅ PASSED: Basic execution works")
    else:
        print(f"❌ FAILED: Expected '{expected}', got '{actual}'")
    
    return result['verdict'] == 'AC' and actual == expected


def test_two_sum_python():
    """Test Two Sum problem with Python"""
    print("\n" + "="*60)
    print("TEST 2: Two Sum Problem (Python)")
    print("="*60)
    
    try:
        problem = Problem.objects.get(slug="two-sum")
    except Problem.DoesNotExist:
        print("❌ FAILED: Two Sum problem not found in database")
        print("   Run: python seed_data_v3.py")
        return False
    
    # Correct solution
    code = '''import sys
import json

def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

if __name__ == "__main__":
    input_data = sys.stdin.read().strip()
    nums, target = input_data.split('\n')
    nums = json.loads(nums)
    target = int(target)
    result = two_sum(nums, target)
    print(json.dumps(result))
'''
    
    judge = Judge()
    result = judge.judge_submission(
        problem_id=str(problem.id),
        code=code,
        language="python",
        mode="run"  # Only public tests
    )
    
    print(f"Overall Verdict: {result['verdict']}")
    print(f"Runtime: {result['runtime_ms']}ms")
    print(f"Memory: {result['memory_kb']}KB")
    print(f"\nTest Cases:")
    
    all_passed = True
    for tc in result.get('testcases', []):
        status_icon = "✅" if tc['status'] == 'Passed' else "❌"
        print(f"  {status_icon} Test {tc['id']}: {tc['status']}")
        print(f"     Input: {tc['input'][:50]}...")
        print(f"     Expected: {tc['expected_output']}")
        print(f"     Got: {tc['user_output']}")
        
        if tc['status'] != 'Passed':
            all_passed = False
            if 'stderr' in tc:
                print(f"     Error: {tc['stderr']}")
    
    if all_passed and result['verdict'] == 'Accepted':
        print("\n✅ PASSED: Correct solution passes all tests")
    else:
        print(f"\n❌ FAILED: Expected Accepted, got {result['verdict']}")
    
    return all_passed


def test_wrong_answer():
    """Test that wrong answers are properly detected"""
    print("\n" + "="*60)
    print("TEST 3: Wrong Answer Detection")
    print("="*60)
    
    try:
        problem = Problem.objects.get(slug="two-sum")
    except Problem.DoesNotExist:
        print("❌ FAILED: Two Sum problem not found")
        return False
    
    # Intentionally wrong solution (always returns [0, 1])
    code = '''import sys
import json

if __name__ == "__main__":
    input_data = sys.stdin.read().strip()
    print(json.dumps([0, 1]))  # Wrong answer
'''
    
    judge = Judge()
    result = judge.judge_submission(
        problem_id=str(problem.id),
        code=code,
        language="python",
        mode="run"
    )
    
    print(f"Overall Verdict: {result['verdict']}")
    
    # This should fail on at least some tests
    if result['verdict'] != 'Accepted':
        print("✅ PASSED: Wrong answer correctly detected")
        return True
    else:
        print("❌ FAILED: Wrong answer was marked as Accepted")
        return False


def test_compilation_error():
    """Test C++ compilation error handling"""
    print("\n" + "="*60)
    print("TEST 4: Compilation Error Handling")
    print("="*60)
    
    # Invalid C++ code
    code = '''#include <iostream>
using namespace std;

int main() {
    cout << "Hello" << endl  // Missing semicolon
    return 0;
}
'''
    
    sandbox = DockerSandbox()
    result = sandbox.execute(
        code=code,
        language="cpp",
        test_input=""
    )
    
    print(f"Verdict: {result['verdict']}")
    print(f"Stderr: {result['stderr'][:200]}...")
    
    if result['verdict'] == 'CE':
        print("✅ PASSED: Compilation error correctly detected")
        return True
    else:
        print(f"❌ FAILED: Expected CE, got {result['verdict']}")
        return False


def test_runtime_error():
    """Test runtime error handling"""
    print("\n" + "="*60)
    print("TEST 5: Runtime Error Handling")
    print("="*60)
    
    # Python code that raises an exception
    code = '''import sys
data = sys.stdin.read()
raise Exception("Test error")
'''
    
    sandbox = DockerSandbox()
    result = sandbox.execute(
        code=code,
        language="python",
        test_input="test"
    )
    
    print(f"Verdict: {result['verdict']}")
    print(f"Stderr: {result['stderr'][:200]}...")
    
    if result['verdict'] == 'RE':
        print("✅ PASSED: Runtime error correctly detected")
        return True
    else:
        print(f"❌ FAILED: Expected RE, got {result['verdict']}")
        return False


def test_output_normalization():
    """Test output normalization logic"""
    print("\n" + "="*60)
    print("TEST 6: Output Normalization")
    print("="*60)
    
    judge = Judge()
    
    test_cases = [
        # (output1, output2, should_match)
        ("[0, 1]", "[0, 1]", True),
        ("[0, 1]\n", "[0, 1]", True),
        ("[0, 1]  \n", "[0, 1]", True),
        ("  [0, 1]", "[0, 1]", True),
        ("[0,1]", "[0, 1]", False),  # Different spacing - should not match
        ("[0, 1]\n\n", "[0, 1]", True),
        ("[0, 1]", "[1, 0]", False),
    ]
    
    passed = 0
    failed = 0
    
    for out1, out2, should_match in test_cases:
        norm1 = judge._normalize_output(out1)
        norm2 = judge._normalize_output(out2)
        matches = (norm1 == norm2)
        
        if matches == should_match:
            print(f"✅ {repr(out1)} vs {repr(out2)}: {matches} (expected {should_match})")
            passed += 1
        else:
            print(f"❌ {repr(out1)} vs {repr(out2)}: {matches} (expected {should_match})")
            print(f"   Normalized: {repr(norm1)} vs {repr(norm2)}")
            failed += 1
    
    print(f"\nNormalization: {passed} passed, {failed} failed")
    return failed == 0


def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("JUDGE AND SANDBOX VALIDATION TESTS")
    print("="*60)
    
    tests = [
        ("Basic Execution", test_sandbox_basic),
        ("Two Sum (Correct)", test_two_sum_python),
        ("Wrong Answer Detection", test_wrong_answer),
        ("Compilation Error", test_compilation_error),
        ("Runtime Error", test_runtime_error),
        ("Output Normalization", test_output_normalization),
    ]
    
    results = []
    for name, test_func in tests:
        try:
            passed = test_func()
            results.append((name, passed))
        except Exception as e:
            print(f"\n❌ EXCEPTION in {name}: {e}")
            import traceback
            traceback.print_exc()
            results.append((name, False))
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    passed_count = sum(1 for _, passed in results if passed)
    total_count = len(results)
    
    for name, passed in results:
        icon = "✅" if passed else "❌"
        print(f"{icon} {name}")
    
    print(f"\n{passed_count}/{total_count} tests passed")
    
    if passed_count == total_count:
        print("\n🎉 ALL TESTS PASSED! Judge system is working correctly.")
    else:
        print(f"\n⚠️  {total_count - passed_count} test(s) failed. Review the output above.")


if __name__ == "__main__":
    main()
