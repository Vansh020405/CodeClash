"""
Schema-Based Problem Generator
Generates fresh problems and TEST CASES from problem schemas
"""
import json
import random
import re
from typing import Dict, List, Any, Tuple


class ProblemSchema:
    """Represents a problem schema - the blueprint for generation"""
    
    def __init__(self, schema_dict: dict):
        self.problem_type = schema_dict.get('problem_type', 'general')
        self.difficulty = schema_dict.get('difficulty', 'medium')
        self.core_logic = schema_dict.get('core_logic', '')
        self.input_format = schema_dict.get('input_format', '')
        self.output_format = schema_dict.get('output_format', '')
        self.constraints = schema_dict.get('constraints', {})
        self.function_signature = schema_dict.get('function_signature', None)
        
    def to_dict(self) -> dict:
        return {
            'problem_type': self.problem_type,
            'difficulty': self.difficulty,
            'core_logic': self.core_logic,
            'input_format': self.input_format,
            'output_format': self.output_format,
            'constraints': self.constraints,
            'function_signature': self.function_signature
        }


class SchemaExtractor:
    """Extracts problem schema from text"""
    
    PROBLEM_PATTERNS = {
        'sum': {
            'keywords': ['sum', 'add', 'total', 'addition', 'plus', 'combine'],
            'type': 'math',
            'logic': 'Calculate the sum of given numbers',
        },
        'max': {
            'keywords': ['max', 'maximum', 'largest', 'greatest', 'biggest', 'highest'],
            'type': 'array',
            'logic': 'Find the maximum element',
        },
        'min': {
            'keywords': ['min', 'minimum', 'smallest', 'least', 'lowest'],
            'type': 'array',
            'logic': 'Find the minimum element',
        },
        'count': {
            'keywords': ['count', 'frequency', 'occurrences', 'how many', 'number of'],
            'type': 'array',
            'logic': 'Count occurrences or elements',
        },
        'reverse': {
            'keywords': ['reverse', 'backward', 'flip', 'invert'],
            'type': 'string',
            'logic': 'Reverse the input',
        },
        'palindrome': {
            'keywords': ['palindrome'],
            'type': 'string',
            'logic': 'Check if string is palindrome',
        },
        'sort': {
            'keywords': ['sort', 'order', 'arrange', 'ascending', 'descending'],
            'type': 'array',
            'logic': 'Sort elements',
        },
        'search': {
            'keywords': ['search', 'find', 'locate', 'index', 'position', 'contains'],
            'type': 'array',
            'logic': 'Search for element',
        },
        'factorial': {
            'keywords': ['factorial'],
            'type': 'math',
            'logic': 'Calculate factorial',
        },
        'fibonacci': {
            'keywords': ['fibonacci', 'fib'],
            'type': 'math',
            'logic': 'Generate Fibonacci numbers',
        },
        'prime': {
            'keywords': ['prime'],
            'type': 'math',
            'logic': 'Check or find prime numbers',
        },
        'even_odd': {
            'keywords': ['even', 'odd'],
            'type': 'math',
            'logic': 'Check if number is even or odd',
        },
        'average': {
            'keywords': ['average', 'mean'],
            'type': 'math',
            'logic': 'Calculate average of numbers',
        },
        'power': {
            'keywords': ['power', 'exponent', 'exponential'],
            'type': 'math',
            'logic': 'Calculate power of a number',
        },
        'length': {
            'keywords': ['length', 'size', 'count characters'],
            'type': 'string',
            'logic': 'Find length of string or array',
        },
        'duplicate': {
            'keywords': ['duplicate', 'repeated', 'unique'],
            'type': 'array',
            'logic': 'Find or remove duplicates',
        },
    }
    
    def extract_from_text(self, text: str) -> ProblemSchema:
        """Extract schema from problem text"""
        text_lower = text.lower()
        
        # Detect problem type
        detected_type = 'general'
        detected_logic = 'Process input and return output'
        
        for pattern_key, pattern_info in self.PROBLEM_PATTERNS.items():
            if any(kw in text_lower for kw in pattern_info['keywords']):
                detected_type = pattern_info['type']
                detected_logic = pattern_info['logic']
                break
        
        # Extract constraints
        constraints = self._extract_constraints(text)
        
        # Detect difficulty
        difficulty = self._detect_difficulty(text, detected_type)
        
        # Extract input/output format
        input_format, output_format = self._extract_io_format(text)
        
        return ProblemSchema({
            'problem_type': detected_type,
            'difficulty': difficulty,
            'core_logic': detected_logic,
            'input_format': input_format,
            'output_format': output_format,
            'constraints': constraints,
        })
    
    def _extract_constraints(self, text: str) -> dict:
        """Extract numerical constraints from text"""
        constraints = {}
        
        # Look for range patterns like "1 <= n <= 100"
        range_pattern = r'(-?\d+)\s*<=?\s*(\w+)\s*<=?\s*(-?\d+)'
        matches = re.findall(range_pattern, text)
        
        for match in matches:
            min_val, var_name, max_val = match
            constraints[var_name] = {
                'min': int(min_val),
                'max': int(max_val)
            }
        
        # Default constraints
        if not constraints:
            constraints['n'] = {'min': 1, 'max': 1000}
        
        return constraints
    
    def _detect_difficulty(self, text: str, problem_type: str) -> str:
        """Detect problem difficulty"""
        text_lower = text.lower()
        
        # Hard indicators
        if any(kw in text_lower for kw in ['dynamic programming', 'dp', 'graph', 'tree', 'backtrack']):
            return 'Hard'
        
        # Medium indicators
        if any(kw in text_lower for kw in ['sort', 'binary search', 'hash', 'two pointer']):
            return 'Medium'
        
        # Easy by default for simple operations
        if problem_type in ['math', 'string']:
            return 'Easy'
        
        return 'Medium'
    
    def _extract_io_format(self, text: str) -> Tuple[str, str]:
        """Extract input and output format descriptions"""
        lines = text.split('\n')
        
        input_format = "Standard input"
        output_format = "Standard output"
        
        in_input_section = False
        in_output_section = False
        
        for line in lines:
            line_lower = line.lower().strip()
            
            if 'input' in line_lower and ':' in line:
                in_input_section = True
                in_output_section = False
                continue
            
            if 'output' in line_lower and ':' in line:
                in_output_section = True
                in_input_section = False
                continue
            
            if in_input_section and line.strip():
                input_format = line.strip()
                in_input_section = False
            
            if in_output_section and line.strip():
                output_format = line.strip()
                in_output_section = False
        
        return input_format, output_format


class SchemaBasedGenerator:
    """Generates fresh problems from schemas"""
    
    CONTEXT_TEMPLATES = {
        'math': [
            "Calculate the {operation} of {subject}",
            "Find the {operation} for the given {subject}",
            "Determine the {operation} of {subject}",
        ],
        'array': [
            "Find the {operation} element in an array of {subject}",
            "Given a list of {subject}, find the {operation}",
            "Locate the {operation} value in the {subject} collection",
        ],
        'string': [
            "Process a string of {subject} and {operation}",
            "Given a text containing {subject}, {operation}",
            "Manipulate the {subject} string to {operation}",
        ],
    }
    
    SUBJECTS = {
        'math': ['integers', 'numbers', 'values', 'scores', 'quantities'],
        'array': ['integers', 'scores', 'temperatures', 'prices', 'ratings'],
        'string': ['characters', 'words', 'letters', 'symbols', 'text'],
    }
    
    def __init__(self):
        self.schema_extractor = SchemaExtractor()
    
    def generate_from_schema(self, schema: ProblemSchema, seed: int = None) -> Dict[str, Any]:
        """Generate a complete problem from schema"""
        if seed:
            random.seed(seed)
        
        # Generate problem description
        description = self._generate_description(schema)
        
        # Generate test cases with COMPUTED outputs
        test_cases = self._generate_test_cases(schema)
        
        # Generate title
        title = self._generate_title(schema)
        
        # Build complete problem
        return {
            'title': title,
            'difficulty': schema.difficulty.capitalize(),
            'description': description,
            'constraints': self._format_constraints(schema.constraints),
            'test_cases': test_cases,
            'reference_solution': self._generate_solution_template(schema),
            'template_code': {
                'python': f"# Solve: {title}\ndef solution():\n    # Your code here\n    pass\n",
                'cpp': "// Write your solution here\n",
                'java': "// Write your solution here\n"
            },
            'hints': self._generate_hints(schema),
            'topics': [schema.problem_type],
            'time_complexity': 'O(?)',
            'space_complexity': 'O(?)',
            'concept_analysis': schema.core_logic,
            'source': 'schema'
        }
    
    def _generate_description(self, schema: ProblemSchema) -> str:
        """Generate problem description from schema"""
        problem_type = schema.problem_type
        
        # Get random context
        subjects = self.SUBJECTS.get(problem_type, ['elements'])
        subject = random.choice(subjects)
        
        # Build description
        intro = f"**Problem:**\n\n{schema.core_logic}.\n\n"
        
        input_desc = f"**Input Format:**\n\n{schema.input_format}\n\n"
        output_desc = f"**Output Format:**\n\n{schema.output_format}\n\n"
        
        examples = "**Examples:**\n\nSee test cases below.\n\n"
        
        return intro + input_desc + output_desc + examples
    
    def _generate_test_cases(self, schema: ProblemSchema) -> List[Dict[str, str]]:
        """Generate test cases with COMPUTED correct outputs"""
        test_cases = []
        
        # Get constraint ranges
        constraints = schema.constraints
        if not constraints:
            constraints = {'n': {'min': 1, 'max': 100}}
        
        # Generate based on problem type
        problem_type = schema.problem_type
        
        if problem_type == 'math' and 'sum' in schema.core_logic.lower():
            test_cases = self._generate_sum_tests(constraints)
        elif problem_type == 'array' and 'max' in schema.core_logic.lower():
            test_cases = self._generate_max_tests(constraints)
        elif problem_type == 'array' and 'min' in schema.core_logic.lower():
            test_cases = self._generate_min_tests(constraints)
        elif 'factorial' in schema.core_logic.lower():
            test_cases = self._generate_factorial_tests(constraints)
        elif 'reverse' in schema.core_logic.lower():
            test_cases = self._generate_reverse_tests(constraints)
        else:
            # Generic tests
            test_cases = self._generate_generic_tests(constraints)
        
        return test_cases
    
    def _generate_sum_tests(self, constraints: dict) -> List[Dict]:
        """Generate sum test cases with correct outputs"""
        tests = []
        
        # Test 1: Small positive numbers
        a, b = 5, 3
        tests.append({
            'input': f'{a}, {b}',
            'output': str(a + b),
            'explanation': 'Basic addition'
        })
        
        # Test 2: With negative
        a, b = -10, 5
        tests.append({
            'input': f'{a}, {b}',
            'output': str(a + b),
            'explanation': 'Negative number'
        })
        
        # Test 3: Zeros
        a, b = 0, 0
        tests.append({
            'input': f'{a}, {b}',
            'output': str(a + b),
            'explanation': 'Zero values'
        })
        
        return tests
    
    def _generate_max_tests(self, constraints: dict) -> List[Dict]:
        """Generate max element test cases"""
        tests = []
        
        # Test 1: Simple array
        arr = [1, 5, 3, 9, 2]
        tests.append({
            'input': str(arr),
            'output': str(max(arr)),
            'explanation': 'Find maximum in array'
        })
        
        # Test 2: Negative numbers
        arr = [-5, -2, -8, -1]
        tests.append({
            'input': str(arr),
            'output': str(max(arr)),
            'explanation': 'All negative numbers'
        })
        
        # Test 3: Single element
        arr = [42]
        tests.append({
            'input': str(arr),
            'output': str(max(arr)),
            'explanation': 'Single element'
        })
        
        return tests
    
    def _generate_min_tests(self, constraints: dict) -> List[Dict]:
        """Generate min element test cases"""
        tests = []
        
        arr = [5, 2, 8, 1, 9]
        tests.append({
            'input': str(arr),
            'output': str(min(arr)),
            'explanation': 'Find minimum'
        })
        
        arr = [-3, -1, -7, -2]
        tests.append({
            'input': str(arr),
            'output': str(min(arr)),
            'explanation': 'Negative numbers'
        })
        
        return tests
    
    def _generate_factorial_tests(self, constraints: dict) -> List[Dict]:
        """Generate factorial test cases"""
        import math
        tests = []
        
        for n in [5, 0, 10]:
            tests.append({
                'input': str(n),
                'output': str(math.factorial(n)),
                'explanation': f'Factorial of {n}'
            })
        
        return tests
    
    def _generate_reverse_tests(self, constraints: dict) -> List[Dict]:
        """Generate reverse string test cases"""
        tests = []
        
        test_strings = ['hello', 'python', 'a']
        for s in test_strings:
            tests.append({
                'input': s,
                'output': s[::-1],
                'explanation': f'Reverse "{s}"'
            })
        
        return tests
    
    def _generate_generic_tests(self, constraints: dict) -> List[Dict]:
        """Generate generic test cases when type is unknown"""
        return [
            {'input': 'test_input_1', 'output': 'expected_1', 'explanation': 'Basic test'},
            {'input': 'test_input_2', 'output': 'expected_2', 'explanation': 'Edge case'},
            {'input': 'test_input_3', 'output': 'expected_3', 'explanation': 'Complex case'},
        ]
    
    def _generate_title(self, schema: ProblemSchema) -> str:
        """Generate a descriptive title"""
        logic = schema.core_logic
        if logic:
            return logic.strip('.')
        return f"{schema.problem_type.title()} Problem"
    
    def _format_constraints(self, constraints: dict) -> str:
        """Format constraints as string"""
        lines = []
        for var, bounds in constraints.items():
            min_val = bounds.get('min', 1)
            max_val = bounds.get('max', 1000)
            lines.append(f"- {min_val} <= {var} <= {max_val}")
        
        return '\n'.join(lines) if lines else "Standard constraints apply"
    
    def _generate_solution_template(self, schema: ProblemSchema) -> dict:
        """Generate solution template"""
        return {
            'python': f"# Solution for: {schema.core_logic}\ndef solution():\n    # Implement logic here\n    pass\n"
        }
    
    def _generate_hints(self, schema: ProblemSchema) -> List[str]:
        """Generate helpful hints"""
        return [
            f"Consider the core logic: {schema.core_logic}",
            "Think about edge cases",
            "Optimize your solution"
        ]


# Singleton
_schema_generator = None

def get_schema_generator():
    global _schema_generator
    if _schema_generator is None:
        _schema_generator = SchemaBasedGenerator()
    return _schema_generator
