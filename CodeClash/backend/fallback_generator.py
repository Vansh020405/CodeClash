"""
LAYER 3: Deterministic Fallback Generator
Generates problems WITHOUT AI - never fails, always fast
"""
import re
import random
import hashlib


class FallbackGenerator:
    """Generate problems deterministically when AI is unavailable"""
    
    def __init__(self):
        # Context transformation templates
        self.context_replacements = {
            'student': ['employee', 'customer', 'player', 'user', 'participant'],
            'students': ['employees', 'customers', 'players', 'users', 'participants'],
            'class': ['team', 'group', 'department', 'squad', 'division'],
            'school': ['company', 'organization', 'club', 'agency', 'institute'],
            'teacher': ['manager', 'supervisor', 'coach', 'leader', 'director'],
            'grade': ['score', 'rating', 'level', 'rank', 'point'],
            'exam': ['test', 'assessment', 'evaluation', 'quiz', 'challenge'],
            'book': ['document', 'file', 'record', 'item', 'entry'],
            'books': ['documents', 'files', 'records', 'items', 'entries'],
            'number': ['value', 'count', 'amount', 'quantity', 'total'],
            'numbers': ['values', 'counts', 'amounts', 'quantities', 'totals'],
        }
        
        self.variable_replacements = {
            'n': ['k', 'm', 'x', 'len', 'size'],
            'i': ['j', 'idx', 'pos', 'index'],
            'a': ['nums', 'arr', 'data', 'values'],
            'b': ['target', 'key', 'goal', 'limit'],
            'sum': ['total', 'result', 'answer', 'output'],
            'count': ['tally', 'freq', 'occurrences', 'instances'],
        }
    
    def generate_similar_problem(self, sample_problem: str, sample_test_cases: str = "") -> dict:
        """
        Transform the sample problem deterministically
        Returns a valid problem structure - NEVER FAILS
        """
        try:
            # Generate a deterministic seed from the input
            seed = int(hashlib.md5(sample_problem.encode()).hexdigest()[:8], 16)
            random.seed(seed)
            
            # Transform the problem
            new_problem = self._transform_problem(sample_problem)
            
            # Extract or generate basic metadata
            difficulty = self._detect_difficulty(sample_problem)
            topics = self._detect_topics(sample_problem)
            
            # Transform test cases
            new_test_cases = self._transform_test_cases(sample_test_cases) if sample_test_cases else self._generate_default_tests()
            
            # Create a professional title
            title = self._generate_title(new_problem, topics)
            
            return {
                "title": title,
                "difficulty": difficulty,
                "description": new_problem,
                "constraints": self._extract_constraints(sample_problem),
                "test_cases": new_test_cases,
                "reference_solution": {
                    "python": "# Solution template\ndef solve():\n    # TODO: Implement solution\n    pass"
                },
                "template_code": {
                    "python": "# Write your solution here\n",
                    "cpp": "// Write your solution here\n",
                    "java": "// Write your solution here\n"
                },
                "hints": ["Analyze the problem constraints", "Consider edge cases"],
                "topics": topics,
                "time_complexity": "O(?)",
                "space_complexity": "O(?)",
                "concept_analysis": "Generated using fallback system",
                "source": "fallback"
            }
        except Exception as e:
            # Even if transformation fails, return a minimal valid problem
            return self._emergency_fallback(sample_problem)
    
    def _transform_problem(self, text: str) -> str:
        """Transform problem text by replacing context and numbers"""
        result = text
        
        # Store original line structure
        lines = result.split('\n')
        transformed_lines = []
        
        for line in lines:
            # Skip empty lines and preserve formatting
            if not line.strip():
                transformed_lines.append(line)
                continue
            
            transformed_line = line
            
            # Only transform content lines, not headers/labels
            is_content_line = not any(marker in line.lower() for marker in 
                                     ['input:', 'output:', 'example:', 'constraints:', 
                                      'note:', 'explanation:'])
            
            if is_content_line:
                # Transform numbers (multiply/add offset)
                def transform_number(match):
                    num = int(match.group())
                    if num == 0:
                        return '0'
                    if num == 1:
                        return str(random.choice([1, 2]))
                    if abs(num) <= 5:
                        # Small numbers - add offset
                        return str(num + random.choice([1, 2, 3]) * (1 if num > 0 else -1))
                    else:
                        # Larger numbers - multiply
                        return str(num * random.choice([2, 3, 5]))
                
                transformed_line = re.sub(r'-?\b\d+\b', transform_number, transformed_line)
                
                # Replace context words carefully (preserve sentence structure)
                for original, replacements in self.context_replacements.items():
                    # Only replace whole words
                    pattern = r'\b' + re.escape(original) + r'\b'
                    if re.search(pattern, transformed_line, re.IGNORECASE):
                        replacement = random.choice(replacements)
                        transformed_line = re.sub(pattern, replacement, transformed_line, 
                                                 count=1, flags=re.IGNORECASE)
            
            transformed_lines.append(transformed_line)
        
        return '\n'.join(transformed_lines)
    
    def _transform_test_cases(self, test_cases: str) -> list:
        """Transform test case values"""
        cases = []
        
        # Split by common patterns
        lines = test_cases.strip().split('\n')
        current_input = None
        current_output = None
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            if 'input' in line.lower():
                current_input = line.split(':', 1)[-1].strip()
            elif 'output' in line.lower():
                current_output = line.split(':', 1)[-1].strip()
                
                if current_input and current_output:
                    # Transform the values
                    transformed_input = self._transform_value(current_input)
                    transformed_output = self._transform_value(current_output)
                    
                    cases.append({
                        "input": transformed_input,
                        "output": transformed_output,
                        "explanation": "Transformed test case"
                    })
                    current_input = None
                    current_output = None
        
        # If no valid cases parsed, return defaults
        if not cases:
            cases = self._generate_default_tests()
        
        return cases
    
    def _transform_value(self, value: str) -> str:
        """Transform a test value"""
        # Replace numbers
        def transform_num(match):
            num = int(match.group())
            if num == 0:
                return '0'
            return str(num * random.choice([2, 3, 5]))
        
        return re.sub(r'\d+', transform_num, value)
    
    def _generate_default_tests(self) -> list:
        """Generate minimal default test cases"""
        return [
            {"input": "Example input 1", "output": "Example output 1", "explanation": "Basic case"},
            {"input": "Example input 2", "output": "Example output 2", "explanation": "Edge case"},
            {"input": "Example input 3", "output": "Example output 3", "explanation": "Complex case"}
        ]
    
    def _detect_difficulty(self, text: str) -> str:
        """Detect difficulty from problem text"""
        text_lower = text.lower()
        
        # Check for complexity indicators
        if any(word in text_lower for word in ['dynamic programming', 'dp', 'graph', 'tree', 'backtrack']):
            return "Hard"
        elif any(word in text_lower for word in ['sort', 'search', 'hash', 'two pointer', 'sliding window']):
            return "Medium"
        else:
            return "Easy"
    
    def _detect_topics(self, text: str) -> list:
        """Detect topics from problem text"""
        text_lower = text.lower()
        topics = []
        
        topic_keywords = {
            'array': ['array', 'list', 'sequence'],
            'string': ['string', 'text', 'character'],
            'hash table': ['hash', 'map', 'dictionary'],
            'sorting': ['sort', 'order'],
            'searching': ['search', 'find', 'locate'],
            'dynamic programming': ['dp', 'dynamic programming', 'memoization'],
            'graph': ['graph', 'node', 'edge', 'vertex'],
            'tree': ['tree', 'binary tree', 'bst'],
            'math': ['sum', 'product', 'calculate', 'mathematical'],
        }
        
        for topic, keywords in topic_keywords.items():
            if any(kw in text_lower for kw in keywords):
                topics.append(topic)
        
        return topics if topics else ['general']
    
    def _extract_constraints(self, text: str) -> str:
        """Extract or generate constraints"""
        # Look for constraints section
        lines = text.split('\n')
        constraints = []
        in_constraints = False
        
        for line in lines:
            if 'constraint' in line.lower():
                in_constraints = True
                continue
            if in_constraints and line.strip():
                if line.strip().startswith('-') or '<=' in line or '>=' in line:
                    constraints.append(line.strip())
        
        if constraints:
            return '\n'.join(constraints)
        
        # Default constraints
        return "- 1 <= n <= 10^5\n- All inputs are valid integers"
    
    def _generate_title(self, problem: str, topics: list) -> str:
        """Generate a professional title"""
        # Extract first meaningful sentence
        first_line = problem.split('\n')[0].strip()
        
        # Clean up and capitalize
        if len(first_line) > 50:
            first_line = first_line[:47] + "..."
        
        if first_line.endswith('.'):
            first_line = first_line[:-1]
        
        # Add topic hint
        if topics:
            return f"{first_line} ({topics[0].title()})"
        
        return first_line or "Generated Coding Problem"
    
    def _emergency_fallback(self, sample: str) -> dict:
        """Last resort - return a minimal valid structure"""
        return {
            "title": "Coding Challenge",
            "difficulty": "Medium",
            "description": f"Solve the following problem:\n\n{sample[:500]}",
            "constraints": "Standard constraints apply",
            "test_cases": [
                {"input": "Test input", "output": "Expected output", "explanation": "Sample test"}
            ],
            "reference_solution": {"python": "# Implement solution\npass"},
            "template_code": {
                "python": "# Write your code here\n",
                "cpp": "// Write your code here\n",
                "java": "// Write your code here\n"
            },
            "hints": ["Analyze the problem carefully"],
            "topics": ["general"],
            "time_complexity": "O(?)",
            "space_complexity": "O(?)",
            "concept_analysis": "Emergency fallback",
            "source": "fallback"
        }


# Singleton instance
_fallback_generator = None

def get_fallback_generator():
    """Get or create fallback generator instance"""
    global _fallback_generator
    if _fallback_generator is None:
        _fallback_generator = FallbackGenerator()
    return _fallback_generator
