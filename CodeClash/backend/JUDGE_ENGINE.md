# 🏛️ CodeClash Judge Engine Documentation

## Overview

The CodeClash Judge Engine is a **deterministic, secure, multi-language code evaluation system** that executes user code against predefined test cases and returns precise verdicts.

## Core Principles

### 1. **One Reference Solution Per Problem**
- Each problem has a single trusted reference solution
- This solution is the **source of truth** for expected outputs
- Reference solutions are language-independent at the output level

### 2. **No AI in Judging**
- Correctness is determined by exact string matching
- No "smart" or fuzzy comparisons
- `user_output == expected_output` (after normalization)

### 3. **Docker-Based Sandboxing**
- Each submission runs in an isolated Docker container
- No network access
- Limited CPU, memory, and process count
- Automatic cleanup after execution

## Supported Languages

| Language | Compilation | Image | Extension |
|----------|-------------|-------|-----------|
| Python   | No (interpreted) | `python:3.10-slim` | `.py` |
| C        | Yes (`gcc`) | `gcc:11` | `.c` |
| C++      | Yes (`g++`) | `gcc:11` | `.cpp` |
| Java     | Yes (`javac`) | `openjdk:17-slim` | `.java` |

## Architecture

```
┌─────────────────┐
│  Frontend (UI)  │
└────────┬────────┘
         │
    POST /api/executor/submit/         │
         v
┌─────────────────┐
│   Judge API     │
│  (views.py)     │
└────────┬────────┘
         │
         v
┌─────────────────┐
│  Judge Engine   │
│   (judge.py)    │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Docker Sandbox  │
│  (sandbox.py)   │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Docker Container│
│  (isolated env) │
└─────────────────┘
```

## Verdict System

| Verdict | Code | Meaning |
|---------|------|---------|
| **Accepted** | AC | All test cases passed |
| **Wrong Answer** | WA | Output doesn't match expected |
| **Time Limit Exceeded** | TLE | Execution took too long |
| **Runtime Error** | RE | Program crashed/exception |
| **Compilation Error** | CE | Code failed to compile |
| **System Error** | ERROR | Internal judging system error |

## Execution Flow

### 1. **Submission Receives**
- `problem_id`: Which problem to judge
- `code`: User's source code
- `language`: Programming language
- `mode`: `run` (public tests) or `submit` (all tests)

### 2. **Problem Retrieval**
```python
problem = Problem.objects.get(id=problem_id)
test_cases = problem.test_cases.filter(is_hidden=False)  # if mode == "run"
```

### 3. **Sandbox Execution**
For each test case:
1. Create isolated Docker container
2. Copy source code to container
3. Compile (if needed)
4. Run with test input
5. Capture stdout/stderr
6. Measure  runtime & memory
7. Destroy container

### 4. **Output Comparison**
```python
def _normalize_output(output):
    lines = output.strip().split('\\n')
    normalized = [line.rstrip() for line in lines]
    return '\\n'.join(normalized)

user_output = normalize(execution_result["stdout"])
expected = normalize(test_case.expected_output)

if user_output == expected:
    verdict = "Accepted"
else:
    verdict = "Wrong Answer"
```

### 5. **Return Results**
```json
{
  "verdict": "Accepted",
  "test_cases": [
    {
      "id": 1,
      "status": "Accepted",
      "runtime_ms": 42,
      "memory_kb": 1234,
      "input": "[2,7,11,15]\\n9",
      "expected": null,
      "actual": null
    }
  ],
  "runtime_ms": 42,
  "memory_kb": 1234,
  "passed": 3,
  "total": 3
}
```

## Security Features

### Container Isolation
- `network_mode="none"` → No internet
- `mem_limit` → Memory cap
- `pids_limit` → Process limit
- Auto-cleanup → No leftover containers

### Timeout Protection
- Configured per problem (`time_limit_ms`)
- Default: 2000ms
- Enforced at container level

### Resource Limits
- Memory: Default 256MB per problem
- CPU: Shared with host (fair scheduler)
- Disk: Read-only except `/workspace`

## API Reference

### POST `/api/executor/submit/`

**Request:**
```json
{
  "problem_id": "uuid-here",
  "language": "python",
  "code": "class Solution:\n    def twoSum...",
  "mode": "run"
}
```

**Response (Success):**
```json
{
  "verdict": "Accepted",
  "test_cases": [...],
  "runtime_ms": 45,
  "memory_kb": 2048,
  "passed": 3,
  "total": 3
}
```

**Response (Failure):**
```json
{
  "verdict": "Wrong Answer",
  "test_cases": [
    {
      "id": 1,
      "status": "Wrong Answer",
      "input": "[2,7,11,15]\\n9",
      "expected": "[0, 1]",
      "actual": "[1, 0]",
      "runtime_ms": 12,
      "memory_kb": 1024
    }
  ],
  "passed": 0,
  "total": 3
}
```

## Problem Setup

### Required Fields
1. **reference_solution**: Trusted code in each language
2. **template_code**: Starter code for users
3. **test_cases**: Input + expected output pairs
4. **time_limit_ms**: Max execution time
5. **memory_limit_mb**: Max memory usage

### Example Problem Structure
```python
Problem.objects.create(
    title="Two Sum",
    slug="two-sum",
    reference_solution={
        "python": "# Reference code that produces correct output",
        "cpp": "// C++ reference solution"
    },
    template_code={
        "python": "class Solution:\n    def twoSum...",
        "cpp": "class Solution {\npublic:\n    vector<int> twoSum..."
    },
    time_limit_ms=2000,
    memory_limit_mb=256
)

TestCase.objects.create(
    problem=problem,
    input_data="[2, 7, 11, 15]\\n9",
    expected_output="[0, 1]",
    is_hidden=False,
    order=1
)
```

## Output Normalization Rules

1. **Trim trailing whitespace** from each line
2. **Remove trailing empty lines**
3. **Case-sensitive** comparison
4. **Exact match** required
5. **No partial credit**

## Testing the Judge

### 1. Validate Reference Solution
```bash
POST /api/executor/validate/
{
  "problem_id": "uuid",
  "language": "python"
}
```

This runs the reference solution against all test cases to ensure correctness.

### 2. Manual Test
```bash
POST /api/executor/submit/
{
  "problem_id": "uuid",
  "language": "python",
  "code": "...",
  "mode": "run"
}
```

## Troubleshooting

### Common Issues

**1. Docker Not Found**
```
Error: "Docker service unavailable"
Solution: Ensure Docker is running and accessible
```

**2. Image Pull Failures**
```
Error: "Could not pull python:3.10-slim"
Solution: Check internet connection, manually pull images
```

**3. TLE on Valid Code**
```
Error: Time Limit Exceeded on correct solution
Solution: Increase time_limit_ms or optimize reference solution
```

**4. Wrong Answer on Correct Code**
```
Error: Output mismatch despite correct logic
Solution: Check output format, trailing spaces, newlines
```

## Best Practices

### For Problem Authors
1. **Test reference solutions** thoroughly
2. **Include edge cases** in test data
3. **Set realistic limits** (time/memory)
4. **Document expected format** clearly
5. **Use hidden tests** for anti-cheat

### For System Admins
1. **Monitor Docker health** regularly
2. **Clean up orphaned containers**
3. **Set resource quotas** per user
4. **Log all submissions** for debugging
5. **Rate limit** API endpoints

## Performance Metrics

- **Average judging time**: ~2-5 seconds (including Docker overhead)
- **Container startup**: ~500ms
- **Python execution**: ~50-500ms
- **Compilation (C++)**: ~1-3 seconds
- **Memory overhead**: ~20-50MB per container

## Future Enhancements

- [ ] Support for more languages (Rust, Go, JavaScript)
- [ ] Parallel test case execution
- [ ] Custom checker functions (for float comparisons, etc.)
- [ ] Detailed profiling (time per test case)
- [ ] Plagiarism detection
- [ ] Contest mode with leaderboards
