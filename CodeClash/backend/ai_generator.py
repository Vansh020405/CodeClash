"""
AI Problem Normalizer using Google Gemini
Converts student-submitted problems into compiler-ready standardized problems.
"""
import os
import json
import subprocess
import tempfile
import sys
from google import genai
from typing import Dict, List, Optional

# Configure Gemini
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')
try:
    client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None
    print(f"Gemini Client Status: {'Ready' if client else 'Not Set'}", flush=True)
except Exception as e:
    print(f"Gemini Client Init Failed: {e}", flush=True)
    client = None

class ProblemGenerator:
    """
    Handles normalization of student problems into standardized formats.
    NO random question generation allowed.
    """
    
    def __init__(self):
        if not client:
            print("ERROR: GEMINI_API_KEY not set or client init failed", flush=True)
            raise ValueError("GEMINI_API_KEY not set in environment")
        self.client = client
    
    def normalize_problem(self, title: str, description: str, sample_input: str, sample_output: str, constraints_input: str = "", input_format_str: str = "", output_format_str: str = "", extra_test_cases: List[Dict] = None) -> Dict:
        """
        Main entry point: Convert raw student input into a standardized problem.
        Prioritizes AI analysis, but falls back to direct formatting if AI fails.
        """
        print(f"DEBUG: Normalizing problem '{title}'...", flush=True)
        
        # Step 1: Logic Extraction & Schema Validation (AI)
        schema = self._extract_logic_and_schema(title, description, sample_input, sample_output, constraints_input, input_format_str, output_format_str)
        
        # FAILSAFE: If AI fails to understand logic, use a fallback schema
        if not schema or not schema.get('core_logic'):
            print("DEBUG: Schema extraction failed or ambiguous. Falling back to direct formatting.", flush=True)
            schema = {
                "difficulty": "Medium",
                "core_logic": "Logic checking disabled for this problem.",
                "input_format": input_format_str or "See description",
                "output_format": output_format_str or "See description",
                "constraints": {"custom": constraints_input or "Standard limits"},
                "topics": ["Implementation"],
                "reference_solution_code": "def solve():\n    # TODO: Implement solution logic based on description\n    pass"
            }
        else:
            print(f"DEBUG: Schema extracted. Logic: {schema.get('core_logic', '')[:50]}...", flush=True)
            
        
        # Step 2: Generate Intelligence Engine (Python Code) or Use Fallback
        test_cases = []
        
        # Only try generating code-based tests if we actually have core logic
        if schema.get('core_logic') != "Logic checking disabled for this problem.":
             generator_script = self._generate_test_case_script(schema, sample_input, sample_output)
             if generator_script:
                 print("DEBUG: Executing test case script...", flush=True)
                 test_cases = self._execute_test_case_generator(generator_script)
        
        if not test_cases:
             print("DEBUG: No system test cases generated. Using sample only.", flush=True)
             test_cases.append({
                 "input": sample_input,
                 "output": sample_output,
                 "explanation": "Sample case"
             })

        # Step 3: Append User Provided Extra Test Cases (CRITICAL)
        if extra_test_cases:
            print(f"DEBUG: Appending {len(extra_test_cases)} user-provided test cases.", flush=True)
            for tc in extra_test_cases:
                test_cases.append({
                    "input": tc.get("input", ""),
                    "output": tc.get("output", ""),
                    "explanation": "User provided test case"
                })

        # Step 3.5: Append Extracted Examples from Text (Optional)
        extracted_examples = schema.get("extracted_examples", [])
        if extracted_examples:
            print(f"DEBUG: Appending {len(extracted_examples)} extracted examples.", flush=True)
            for tc in extracted_examples:
                tc_input = tc.get("input", "").strip()
                tc_explanation = tc.get("explanation", "").strip()
                
                # Check if this input is already in test_cases
                existing_index = -1
                for i, existing in enumerate(test_cases):
                    if existing.get("input", "").strip() == tc_input:
                        existing_index = i
                        break
                
                if existing_index != -1:
                    # Update existing explanation if the new one is better (and not just empty)
                    current_expl = test_cases[existing_index].get("explanation", "")
                    if tc_explanation and (current_expl in ["Sample case", "Extracted from description", ""] or not current_expl):
                        test_cases[existing_index]["explanation"] = tc_explanation
                else:
                    test_cases.append({
                        "input": tc.get("input", ""),
                        "output": tc.get("output", ""),
                        "explanation": tc_explanation or "Extracted from description"
                    })

        # Step 4: Construct Final Object
        normalized_problem = {
            "title": title,
            "difficulty": schema.get("difficulty", "Medium"),
            "description": description, # Do not append formats here anymore
            "input_format": schema.get("input_format", input_format_str),
            "output_format": schema.get("output_format", output_format_str),
            "constraints": self._format_constraints(schema.get("constraints", {})),
            "test_cases": test_cases,
            "reference_solution": {
                "python": schema.get("reference_solution_code", "") 
            },
            "topics": schema.get("topics", []),
            "core_logic": schema.get("core_logic", "")
        }
        
        return normalized_problem

    def _extract_logic_and_schema(self, title: str, desc: str, inp: str, outp: str, constraints: str, input_fmt: str, output_fmt: str) -> Dict:
        prompt = f"""
        Analyze this coding problem submission and extract its core logic and structure.
        
        Input Data:
        Title: {title}
        Description: {desc}
        Sample Input: {inp}
        Sample Output: {outp}
        Provided Constraints: {constraints}
        Provided Input Format: {input_fmt}
        Provided Output Format: {output_fmt}
        
        Task:
        1. Identify the core algorithmic logic (precise explanation).
        2. Identify input and output formats. If "Provided Input Format" is not empty, USE IT VERBATIM. Otherwise infer it.
        3. Identify constraints. If provided by user, use them.
        4. Extract ALL examples found in the text. Look specifically for "Explanation", "Explanation 1", etc. appearing after outputs. Capture the full explanation text.
        5. Write a correct Python Reference Solution function.
        
        Output JSON Format (Strictly):
        {{
            "problem_type": "math|array|string|...",
            "difficulty": "Easy|Medium|Hard",
            "core_logic": "Precise explanation of algorithm...",
            "input_format": "Detailed description...",
            "output_format": "Detailed description...",
            "constraints": {{ "var": "range", ... }},
            "topics": ["topic1", "topic2"],
            "extracted_examples": [
                {{"input": "...", "output": "...", "explanation": "Full text of explanation..."}}
            ],
            "reference_solution_code": "def solve(): ..."
        }}
        
        Start JSON now:
        """
        return self._generate_json(prompt)

    def _generate_test_case_script(self, schema: Dict, sample_in: str, sample_out: str) -> str:
        prompt = f"""
        You are a Test Case Intelligence Engine.
        Your task is to write a STANDALONE Python script.
        
        Context:
        Core Logic: {schema.get('core_logic')}
        Input Format: {schema.get('input_format')}
        Constraints: {schema.get('constraints')}
        Reference Implementation: 
        {schema.get('reference_solution_code')}
        
        Requirements for the Script:
        1. It must contain the reference solution function.
        2. It must have a function `generate_case(type)` that generates inputs based on constraints.
           - Support types: 'sample' (hardcoded), 'edge' (min/max values), 'small_random', 'large_random'.
        3. It must generate exactly:
           - 1 Sample case (from provided headers below)
           - 2 Edge cases
           - 2 Random cases
           - 1 Large performance case
        4. For each case, it must run the reference solution to get the expected output.
        5. It must print the FINAL RESULT as a JSON list to STDOUT.
           Format: [ {{"input": "...", "output": "...", "explanation": "..."}}, ... ]
        
        Sample Data to Include (PRESERVE EXACT FORMATTING/SPACING):
        Input: 
        '''{sample_in}'''
        Output: 
        '''{sample_out}'''
        
        Output ONLY the Python Code. No markdown.
        """
        
        try:
            response = self.client.models.generate_content(
                model='gemini-2.0-flash',
                contents=prompt
            )
            code = response.text
            # Strip markdown
            if "```python" in code:
                code = code.split("```python")[1].split("```")[0]
            elif "```" in code:
                code = code.split("```")[1].split("```")[0]
            return code.strip()
        except Exception as e:
            print(f"Error generating script: {e}", flush=True)
            return ""

    def _execute_test_case_generator(self, script_code: str) -> List[Dict]:
        if not script_code:
            return []
            
        try:
            with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False, encoding='utf-8') as f:
                f.write(script_code)
                script_path = f.name
            
            print(f"DEBUG: Running generated script at {script_path}", flush=True)
            
            # Execute
            result = subprocess.run(
                ['python', script_path], 
                capture_output=True, 
                text=True, 
                timeout=15
            )
            
            os.unlink(script_path)
            
            if result.returncode != 0:
                print(f"Script Execution Error: {result.stderr}", flush=True)
                print(f"Script Content was:\n{script_code}", flush=True)
                return []
                
            # Parse JSON output
            output_str = result.stdout.strip()
            print(f"DEBUG: Script output: {output_str[:100]}...", flush=True)
            
            # Find JSON list start/end in case of extra prints
            start = output_str.find('[')
            end = output_str.rfind(']') + 1
            if start != -1 and end != -1:
                json_data = output_str[start:end]
                try:
                    return json.loads(json_data)
                except json.JSONDecodeError:
                    print(f"DEBUG: Failed to parse JSON from script output. Raw: {json_data}", flush=True)
                    return []
            
            print("DEBUG: No JSON list found in script output.", flush=True)
            return []
            
        except Exception as e:
            print(f"Execution handling failed: {e}", flush=True)
            return []

    def _generate_json(self, prompt: str) -> Optional[Dict]:
        try:
            response = self.client.models.generate_content(
                model='gemini-2.0-flash',
                contents=prompt
            )
            text = response.text.strip()
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0]
            elif "{" in text:
                start = text.find("{")
                end = text.rfind("}") + 1
                text = text[start:end]
            return json.loads(text)
        except Exception as e:
            print(f"JSON Generation error: {e}", flush=True)
            return None

    def _format_description(self, schema, original_desc):
        # Description is now handled raw, with separate fields for I/O
        return original_desc

    def _format_constraints(self, constraints):
        if isinstance(constraints, dict):
            return "\n".join([f"{k}: {v}" for k, v in constraints.items()])
        return str(constraints)

# Singleton
_generator = None
def get_generator():
    global _generator
    if _generator is None:
        _generator = ProblemGenerator()
    return _generator
