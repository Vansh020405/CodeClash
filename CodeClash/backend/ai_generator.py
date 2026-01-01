"""
AI Problem Generator using Google Gemini
Generates complete coding problems with test cases and solutions
"""
import os
import json
from google import genai
from typing import Dict, List, Optional

# Configure Gemini
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')
client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None


class ProblemGenerator:
    """Generate coding problems using AI"""
    
    def __init__(self):
        if not client:
            raise ValueError("GEMINI_API_KEY not set in environment")
        self.client = client
    
    def generate_problem(
        self,
        difficulty: str = "Medium",
        topic: Optional[str] = None,
        style: str = "leetcode"
    ) -> Dict:
        """
        Generate a complete coding problem
        """
        prompt = self._build_prompt(difficulty, topic, style)
        return self._generate_with_fallback(prompt)
    
    def generate_similar_problem(
        self,
        sample_problem: str,
        sample_test_cases: str = ""
    ) -> Dict:
        """
        Generate a similar problem based on a college sample
        Also extracts and returns the problem schema
        """
        prompt = self._build_similar_prompt(sample_problem, sample_test_cases)
        result = self._generate_with_fallback(prompt)
        
        # Try to extract schema using AI
        if result:
            try:
                schema = self._extract_schema(sample_problem)
                result['extracted_schema'] = schema
            except Exception as e:
                print(f"Schema extraction failed: {e}")
                result['extracted_schema'] = None
        
        return result
    
    def _extract_schema(self, problem_text: str) -> dict:
        """
        Extract problem schema using AI
        """
        prompt = f"""Analyze this coding problem and extract its core structure as JSON.

Problem:
{problem_text}

Return ONLY a JSON object with this structure:
{{
    "problem_type": "math | array | string | loop | dp | graph | etc",
    "difficulty": "easy | medium | hard",
    "core_logic": "clear description of the algorithm/solution approach",
    "input_format": "description of input",
    "output_format": "description of output",
    "constraints": {{
        "variable_name": {{"min": number, "max": number}}
    }},
    "function_signature": "suggested function name and parameters"
}}

Be precise and focus on the LOGIC, not the story."""
        
        try:
            response = self.client.models.generate_content(
                model='gemini-2.0-flash',
                contents=prompt
            )
            
            if not response.text:
                return None
            
            # Parse JSON
            text = response.text.strip()
            if '```json' in text:
                start = text.find('```json') + 7
                end = text.find('```', start)
                text = text[start:end].strip()
            elif '{' in text:
                start = text.find('{')
                end = text.rfind('}') + 1
                text = text[start:end]
            
            schema = json.loads(text)
            return schema
        
        except Exception as e:
            print(f"AI schema extraction failed: {e}")
            return None

    def _generate_with_fallback(self, prompt: str) -> Dict:
        """Try multiple models until one works"""
        # List of models to try in order of preference (Newest -> Stable)
        models_to_try = [
            'gemini-2.0-flash',
            'gemini-2.0-flash-lite',
            'gemini-2.0-flash-exp',
            'gemini-2.5-flash'
        ]
        
        last_error = None
        
        for model in models_to_try:
            try:
                print(f"Attempting generation with model: {model}")
                response = self.client.models.generate_content(
                    model=model,
                    contents=prompt
                )
                
                if not response.text:
                    raise ValueError("Empty response from AI")
                    
                problem_data = self._parse_response(response.text)
                if problem_data:
                    print(f"Success with model: {model}")
                    return problem_data
                    
            except Exception as e:
                print(f"Model {model} failed: {e}")
                last_error = e
                # Continue to next model
                
        # If all failed, re-raise the last error
        raise last_error
    
    def _build_similar_prompt(self, sample_problem: str, sample_test_cases: str) -> str:
        """Build prompt for generating similar problem"""
        
        test_case_section = ""
        if sample_test_cases:
            test_case_section = f"\n\nSample Test Cases:\n{sample_test_cases}"
        
        prompt = f"""You are an expert problem setter. Generate a NEW coding problem inspired by the sample below.

CRITICAL REQUIREMENTS FOR UNIQUENESS:
✅ MUST preserve: Core algorithm/data structure concept
✅ MUST change: Context, scenario, variable names, all numbers/values, wording
❌ NEVER: Copy-paste or rephrase the same problem
❌ NEVER: Keep the same story, scenario, or domain

Original College Problem:
{sample_problem}{test_case_section}

Generation Instructions:
1. Identify the core concept (e.g., arrays, linked lists, DP, graphs)
2. Create a COMPLETELY DIFFERENT real-world scenario that tests the same concept
   - If original is about "students", use "products", "tasks", "events", etc.
   - If original uses numbers [1,2,3], use different values [5,10,15]
   - Change all variable names and descriptions
3. Keep similar difficulty and algorithmic complexity
4. Write it like a professional LeetCode problem
5. Generate 5-7 test cases with edge cases
6. Provide working Python reference solution

Return in this EXACT JSON format (no markdown blocks, pure JSON only):
{{
    "title": "Professional Problem Title (Must be unique)",
    "difficulty": "Easy|Medium|Hard",
    "description": "Complete problem description with examples in markdown",
    "constraints": "List of constraints",
    "test_cases": [
        {{"input": "test input", "output": "expected output", "explanation": "why"}},
        ...
    ],
    "reference_solution": {{
        "python": "complete working python solution"
    }},
    "template_code": {{
        "python": "starter code template",
        "cpp": "// TODO: Implement",
        "java": "// TODO: Implement"
    }},
    "hints": ["hint 1", "hint 2"],
    "topics": ["identified topics"],
    "time_complexity": "O(?)",
    "space_complexity": "O(?)",
    "concept_analysis": "Brief explanation of core concept"
}}

IMPORTANT: Treat this as creating a fresh exam question, not translating!"""
        
        return prompt
    
    def _build_prompt(self, difficulty: str, topic: Optional[str], style: str) -> str:
        """Build the prompt for Gemini"""
        
        topic_hint = f" focusing on {topic}" if topic else ""
        
        prompt = f"""Generate a {difficulty} difficulty coding problem{topic_hint} in {style} style.

Requirements:
1. Problem should be original and interesting
2. Include clear problem statement with examples
3. Provide constraints
4. Generate 5-7 test cases (including edge cases)
5. Provide a reference Python solution that passes all tests
6. Problem should be solvable in Python, C++, C, and Java

Return the response in this EXACT JSON format:
{{
    "title": "Problem Title",
    "difficulty": "{difficulty}",
    "description": "Complete problem description in markdown format with examples",
    "constraints": "List of constraints",
    "test_cases": [
        {{"input": "test input", "output": "expected output", "explanation": "why"}},
        ...
    ],
    "reference_solution": {{
        "python": "complete python code"
    }},
    "hints": ["hint 1", "hint 2"],
    "topics": ["topic1", "topic2"],
    "time_complexity": "O(n)",
    "space_complexity": "O(1)"
}}

Make sure the JSON is valid and properly formatted."""
        
        return prompt
    
    def _parse_response(self, response_text: str) -> Dict:
        """Parse Gemini's response into structured data"""
        
        # Extract JSON from response
        try:
            # Find JSON content between ```json and ```
            if "```json" in response_text:
                start = response_text.find("```json") + 7
                end = response_text.find("```", start)
                json_str = response_text[start:end].strip()
            elif "{" in response_text and "}" in response_text:
                # Try to extract JSON directly
                start = response_text.find("{")
                end = response_text.rfind("}") + 1
                json_str = response_text[start:end]
            else:
                raise ValueError("No JSON found in response")
            
            problem_data = json.loads(json_str)
            
            # Validate required fields
            required_fields = ['title', 'description', 'test_cases', 'reference_solution']
            for field in required_fields:
                if field not in problem_data:
                    raise ValueError(f"Missing required field: {field}")
            
            return problem_data
            
        except json.JSONDecodeError as e:
            print(f"JSON parse error: {e}")
            print(f"Response text: {response_text[:500]}")
            return None
        except Exception as e:
            print(f"Parse error: {e}")
            return None
    
    def validate_problem(self, problem_data: Dict) -> tuple[bool, str]:
        """Validate generated problem quality"""
        
        issues = []
        
        # Check test cases
        if len(problem_data.get('test_cases', [])) < 3:
            issues.append("Needs at least 3 test cases")
        
        # Check solution exists
        if 'reference_solution' not in problem_data:
            issues.append("Missing reference solution")
        
        # Check description length
        if len(problem_data.get('description', '')) < 100:
            issues.append("Description too short")
        
        if issues:
            return False, "; ".join(issues)
        
        return True, "Valid"
    
    def generate_test_cases_only(
        self,
        problem_description: str,
        num_cases: int = 5
    ) -> List[Dict]:
        """Generate additional test cases for existing problem"""
        
        prompt = f"""Given this problem:

{problem_description}

Generate {num_cases} diverse test cases including edge cases.

Return as JSON array:
[
    {{"input": "...", "output": "...", "explanation": "..."}},
    ...
]
"""
        
        try:
            response = self.client.models.generate_content(
                model='gemini-2.0-flash-exp',
                contents=prompt
            )
            test_cases = json.loads(response.text)
            return test_cases
        except Exception as e:
            print(f"Error generating test cases: {e}")
            return []


# Singleton instance
_generator = None

def get_generator():
    """Get or create problem generator instance"""
    global _generator
    if _generator is None:
        _generator = ProblemGenerator()
    return _generator
