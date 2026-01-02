"""
Core Judging Engine for CodeClash
Implements deterministic, secure code evaluation across multiple languages
"""
from .sandbox import DockerSandbox
from problems.models import Problem, TestCase
from typing import List, Dict, Tuple


class Judge:
    """
    Core judging logic following these principles:
    1. One reference solution per problem
    2. Language-independent expected outputs
    3. Deterministic output comparison
    4. No AI in judging process
    """
    
    def __init__(self):
        self.sandbox = DockerSandbox()
    
    def judge_submission(
        self,
        problem_id: str,
        code: str,
        language: str,
        mode: str = "run"
    ) -> Dict:
        """
        Main judge entry point
        
        Args:
            problem_id: UUID of the problem
            code: User's source code
            language: Programming language (python, cpp, c, java)
            mode: "run" (public tests only) or "submit" (all tests)
            
        Returns:
            Complete verdict with test case results
        """
        try:
            problem = Problem.objects.get(id=problem_id)
        except Problem.DoesNotExist:
            return {
                "verdict": "ERROR",
                "error": "Problem not found",
                "test_cases": []
            }
        
        # Get test cases (Run All Tests regardless of mode, as requested by user)
        test_cases = problem.test_cases.all()
        
        if not test_cases.exists():
            return {
                "verdict": "ERROR",
                "error": "No test cases available",
                "test_cases": []
            }
        
        # Execute against all test cases
        results = []
        overall_verdict = "Accepted"
        total_runtime = 0
        max_memory = 0
        
        for idx, test_case in enumerate(test_cases, 1):
            result = self._judge_single_test(
                code=code,
                language=language,
                test_case=test_case,
                problem=problem
            )
            
            # Map verdict to UI contract
            status = "Passed" if result["verdict"] == "Accepted" else "Failed"
            
            # Mask hidden test case data
            if test_case.is_hidden:
                test_case_result = {
                    "id": idx,
                    "status": status,
                    "input": "Hidden Test Case",
                    "expected_output": "Hidden Test Case",
                    "user_output": "Hidden Test Case",
                    "runtime_ms": result.get("runtime_ms", 0),
                    "is_hidden": True
                }
            else:
                test_case_result = {
                    "id": idx,
                    "status": status,
                    "input": test_case.input_data,
                    "expected_output": test_case.expected_output,
                    "user_output": result.get("stdout", ""),
                    "runtime_ms": result.get("runtime_ms", 0),
                    "is_hidden": False
                }
            
            # Add error info if present
            if result.get("stderr"):
                test_case_result["stderr"] = result["stderr"]
            
            # Add verdict for debugging
            if result["verdict"] != "Accepted":
                test_case_result["verdict"] = result["verdict"]

            results.append(test_case_result)
            
            total_runtime += result["runtime_ms"]
            max_memory = max(max_memory, result["memory_kb"])
            
            # Update overall verdict
            if result["verdict"] != "Accepted":
                # Map internal verdicts to UI verdicts if needed
                if result["verdict"] == "CE":
                    overall_verdict = "Compilation Error"
                elif result["verdict"] == "RE":
                    overall_verdict = "Runtime Error"
                elif result["verdict"] == "TLE":
                    overall_verdict = "TLE"
                else: # Wrong Answer or other
                    overall_verdict = result["verdict"]
                
                # NOTE: We continue running all tests even on failure to show full results
                # as per user request "show all test cases if passed or not"
        
        return {
            "verdict": overall_verdict,
            "runtime_ms": total_runtime // len(results) if results else 0,
            "memory_kb": max_memory,
            "testcases": results
        }
    
    def _judge_single_test(
        self,
        code: str,
        language: str,
        test_case: TestCase,
        problem: Problem
    ) -> Dict:
        """Judge code against a single test case"""
        
        # Execute user code
        execution_result = self.sandbox.execute(
            code=code,
            language=language,
            test_input=test_case.input_data,
            time_limit_ms=problem.time_limit_ms,
            memory_limit_mb=problem.memory_limit_mb
        )
        
        # If execution failed, return immediately
        print(f"DEBUG JUDGE: Verdict={execution_result['verdict']}")
        print(f"DEBUG JUDGE: RAW STDOUT={repr(execution_result['stdout'])}")
        print(f"DEBUG JUDGE: RAW STDERR={repr(execution_result['stderr'])}")

        if execution_result["verdict"] in ["TLE", "RE", "CE", "ERROR"]:
            return execution_result
        
        # Compare outputs
        user_output = self._normalize_output(execution_result["stdout"])
        expected_output = self._normalize_output(test_case.expected_output)
        
        # Debug logging for output comparison
        if user_output != expected_output:
            import logging
            logger = logging.getLogger(__name__)
            logger.debug(f"Output mismatch:")
            logger.debug(f"  Expected (len={len(expected_output)}): {repr(expected_output)}")
            logger.debug(f"  Got (len={len(user_output)}): {repr(user_output)}")
        
        if user_output == expected_output:
            execution_result["verdict"] = "Accepted"
        else:
            execution_result["verdict"] = "Wrong Answer"
        
        return execution_result
    
    def _normalize_output(self, output: str) -> str:
        """
        Normalize output for comparison (LeetCode-style leniency)
        
        Rules:
        1. Strip all leading/trailing whitespace
        2. Normalize line endings to \n
        3. Remove trailing whitespace from each line
        4. Remove completely empty lines at start/end
        5. Collapse multiple consecutive blank lines to single blank line
        """
        if not output:
            return ""
        
        # Normalize line endings and strip overall whitespace
        output = output.replace('\r\n', '\n').replace('\r', '\n').strip()
        
        if not output:
            return ""
        
        # Split into lines
        lines = output.split('\n')
        
        # Process each line - strip trailing whitespace
        normalized_lines = []
        for line in lines:
            normalized_lines.append(line.rstrip())
        
        # Remove leading empty lines
        while normalized_lines and not normalized_lines[0]:
            normalized_lines.pop(0)
        
        # Remove trailing empty lines
        while normalized_lines and not normalized_lines[-1]:
            normalized_lines.pop()
        
        # Join back
        result = '\n'.join(normalized_lines)
        
        return result
    
    def validate_reference_solution(
        self,
        problem: Problem,
        language: str = "python"
    ) -> Tuple[bool, str]:
        """
        Validate that reference solution produces expected outputs
        Used for testing and verification
        """
        if language not in problem.reference_solution:
            return False, f"No reference solution for {language}"
        
        ref_code = problem.reference_solution[language]
        
        for test_case in problem.test_cases.all():
            result = self.sandbox.execute(
                code=ref_code,
                language=language,
                test_input=test_case.input_data,
                time_limit_ms=problem.time_limit_ms,
                memory_limit_mb=problem.memory_limit_mb
            )
            
            if result["verdict"] != "AC":
                return False, f"Reference solution failed on test case: {result['stderr']}"
            
            ref_output = self._normalize_output(result["stdout"])
            expected = self._normalize_output(test_case.expected_output)
            
            if ref_output != expected:
                return False, f"Reference output mismatch. Expected: {expected}, Got: {ref_output}"
        
        return True, "Reference solution validated successfully"
