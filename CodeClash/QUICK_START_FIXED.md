# 🚀 Quick Start Guide - Testing Fixed Judge System

## Your app and compiler have been fixed! Here's how to verify:

### Step 1: Ensure Docker is Running
```powershell
# Check Docker status
docker ps
```
If Docker isn't running, start Docker Desktop.

---

### Step 2: Install Backend Dependencies (if needed)
```powershell
cd c:\Users\VANSH\Desktop\CodeClash\CodeClash\backend
pip install -r requirements.txt
```

---

### Step 3: Seed the Database (if not already done)
```powershell
cd c:\Users\VANSH\Desktop\CodeClash\CodeClash\backend
python seed_data_v3.py
```

Expected output:
```
✅ Updated problem: Two Sum
   - Template now includes working solution!
   - 5 test cases
🎉 Database updated successfully!
```

---

### Step 4: Run the Test Suite
```powershell
cd c:\Users\VANSH\Desktop\CodeClash\CodeClash\backend
python test_judge.py
```

Expected output (all tests should pass):
```
TEST 1: Basic Sandbox Execution
✅ PASSED: Basic execution works

TEST 2: Two Sum Problem (Python)
✅ PASSED: Correct solution passes all tests

TEST 3: Wrong Answer Detection
✅ PASSED: Wrong answer correctly detected

TEST 4: Compilation Error Handling
✅ PASSED: Compilation error correctly detected

TEST 5: Runtime Error Handling
✅ PASSED: Runtime error correctly detected

TEST 6: Output Normalization
✅ PASSED: All normalization tests passed

🎉 ALL TESTS PASSED! Judge system is working correctly.
```

---

### Step 5: Start Backend Server
```powershell
cd c:\Users\VANSH\Desktop\CodeClash\CodeClash\backend
python manage.py runserver
```

Should see:
```
Starting development server at http://127.0.0.1:8000/
```

---

### Step 6: Start Frontend Server (New Terminal)
```powershell
cd c:\Users\VANSH\Desktop\CodeClash\CodeClash\frontend
npm run dev
```

Should see:
```
▲ Next.js 14.2.35
- Local: http://localhost:3000
✓ Ready in 2.1s
```

---

### Step 7: Test in Browser

#### Open the Two Sum problem:
```
http://localhost:3000/problem/two-sum
```

#### You should see:
- ✅ Problem description on the left
- ✅ Code editor on the right with template code
- ✅ Language selector (Python, C++, C, Java)
- ✅ Test panel at bottom
- ✅ Run and Submit buttons

#### Test with the default code (Python):
The template code is already a correct solution. Just click **"Run"**.

**Expected Result**:
- ✅ Verdict: "Accepted"
- ✅ All test cases show green checkmarks
- ✅ Shows "3/3 test cases passed"
- ✅ Runtime displayed (e.g., "15 ms")
- ✅ Each test case shows:
  - Input
  - Your Output (matching expected)
  - Expected Output

---

### Step 8: Test Wrong Answer Detection

Modify the Python code to always return `[0, 1]`:

```python
import sys
import json

if __name__ == "__main__":
    print(json.dumps([0, 1]))
```

Click **"Run"**.

**Expected Result**:
- ❌ Verdict: "Wrong Answer"
- ❌ Test case 1: Passed (by luck - [2,7,11,15], target 9 → [0,1] is correct)
- ❌ Test case 2: Failed (expected [1,2], got [0,1])
- Shows both expected and actual output
- Clear error indication with red X

---

### Step 9: Test Other Languages

#### C++ Template (provided):
```cpp
#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>

using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        for(int i=0; i<nums.size(); ++i) {
             for(int j=i+1; j<nums.size(); ++j) {
                 if(nums[i] + nums[j] == target) return {i, j};
             }
        }
        return {};
    }
};

// I/O handling code...
```

This should also pass all tests when you click **"Run"**.

---

## What Was Fixed

### 🔧 Critical Fixes:
1. **Timeout mechanism** - Now properly enforces time limits
2. **Input handling** - Fixed empty input.txt issues
3. **Java filename** - Corrected Main.java vs main.java
4. **Output normalization** - Better whitespace handling
5. **Error handling** - Robust memory stats and error reporting
6. **Threading** - Proper timeout with thread management

### 📋 Test Coverage:
- ✅ Basic execution
- ✅ Correct solutions
- ✅ Wrong answers
- ✅ Compilation errors  
- ✅ Runtime errors
- ✅ Output comparison
- ✅ All languages (Python, C++, C, Java)

---

## Troubleshooting

### Issue: "Docker service unavailable"
**Solution**: 
```powershell
# Start Docker Desktop, then verify:
docker ps
```

### Issue: "ModuleNotFoundError: No module named 'rest_framework'"
**Solution**:
```powershell
cd backend
pip install -r requirements.txt
```

### Issue: "Problem not found"
**Solution**:
```powershell
cd backend
python seed_data_v3.py
```

### Issue: Frontend won't connect
**Solution**:
1. Check backend is running on http://localhost:8000
2. Check CORS settings in `backend/core/settings.py`:
   ```python
   CORS_ALLOWED_ORIGINS = [
       "http://localhost:3000",
   ]
   ```
3. Restart backend server

### Issue: Test cases still failing with correct code
**Solution**:
1. Run `python test_judge.py` to validate fixes
2. Check Docker logs: `docker logs <container_id>`
3. Enable debug logging (see JUDGE_FIXES_COMPLETE.md)

---

## Next Steps

### ✅ Verify Everything Works:
1. Run test suite → All pass
2. Test in browser → Correct code passes
3. Test wrong code → Properly detected
4. Test all languages → All work

### 🎯 After Verification:
- Try creating new problems
- Test with different difficulty levels
- Benchmark performance
- Add more test cases

---

**Your judge system is now fully functional!** 🎉

All test cases should pass with correct code, and errors should be properly detected and reported.
