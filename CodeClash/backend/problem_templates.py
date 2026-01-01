"""
Problem Template Definition
Templates are AI-generated blueprints for problem generation
"""
import json
from dataclasses import dataclass, asdict
from typing import Dict, List, Any, Optional


@dataclass
class ProblemTemplate:
    """
    Problem Template - Blueprint for generating unlimited problems
    Created by AI once, used infinitely by code
    """
    template_id: str  # Unique identifier (e.g., "two_sum_array")
    problem_type: str  # e.g., "array", "math", "string"
    concept: str  # What skill is tested (e.g., "array traversal and comparison")
    difficulty: str  # "easy", "medium", or "hard"
    
    # STRICT DIFFICULTY ENFORCEMENT
    algorithmic_pattern: str  # e.g., "two_pointer", "dynamic_programming"
    time_complexity: str  # Required: e.g., "O(n)", "O(n²)"
    
    # Problem structure
    input_format: str  # Clear description
    output_format: str  # Clear description
    constraints: Dict[str, Any]  # Variable constraints
    core_logic: str  # Precise algorithm description
    variables: List[str]  # Logical variables used
    
    # Generation parameters
    context_templates: List[str]  # Different ways to phrase the problem
    value_ranges: Dict[str, tuple]  # (min, max) for each variable
    
    # Test case generation
    test_generator_type: str  # "computed", "algorithmic", "lookup"
    test_logic: Optional[str] = None  # Python code to compute test outputs
    
    # Metadata
    created_from: str = "ai"  # "ai" or "manual"
    usage_count: int = 0
    
    def to_dict(self) -> dict:
        """Convert to dictionary for storage"""
        return asdict(self)
    
    @classmethod
    def from_dict(cls, data: dict) -> 'ProblemTemplate':
        """Create from dictionary"""
        return cls(**data)
    
    def validate(self) -> tuple[bool, str]:
        """
        Validate template quality with STRICT difficulty enforcement
        Returns: (is_valid, error_message)
        """
        # Check required fields
        if not self.template_id or not self.problem_type:
            return False, "Missing template_id or problem_type"
        
        # Check algorithmic pattern exists
        if not self.algorithmic_pattern:
            return False, "Missing algorithmic_pattern (REQUIRED for difficulty enforcement)"
        
        # Check time complexity exists
        if not self.time_complexity:
            return False, "Missing time_complexity (REQUIRED)"
        
        # Check core_logic is meaningful
        generic_phrases = [
            'process input',
            'return output',
            'see test cases',
            'solve the problem',
            'implement solution'
        ]
        
        if any(phrase in self.core_logic.lower() for phrase in generic_phrases):
            return False, f"core_logic is too generic: {self.core_logic}"
        
        if len(self.core_logic) < 20:
            return False, "core_logic is too short"
        
        # Check constraints exist
        if not self.constraints:
            return False, "No constraints defined"
        
        # Check variables exist
        if not self.variables or len(self.variables) == 0:
            return False, "No variables defined"
        
        # Check context templates
        if not self.context_templates or len(self.context_templates) == 0:
            return False, "No context templates defined"
        
        # Check difficulty
        if self.difficulty not in ['easy', 'medium', 'hard']:
            return False, f"Invalid difficulty: {self.difficulty}"
        
        # STRICT: Validate difficulty matches algorithmic pattern
        from difficulty_classifier import DifficultyClassifier, AlgorithmicPattern
        
        try:
            # Try to match pattern string to enum
            pattern_str = self.algorithmic_pattern.upper().replace('-', '_')
            pattern = AlgorithmicPattern[pattern_str]
            
            # Validate difficulty matches pattern
            is_valid, error = DifficultyClassifier.validate_difficulty_match(pattern, self.difficulty)
            
            if not is_valid:
                return False, f"DIFFICULTY MISMATCH: {error}"
        
        except KeyError:
            # Pattern not in enum, just warning (allow custom patterns)
            pass
        
        return True, "Valid"


class TemplateStore:
    """
    In-memory store for problem templates
    In production, this would be a database
    """
    
    def __init__(self):
        self._templates: Dict[str, ProblemTemplate] = {}
        self._load_builtin_templates()
    
    def _load_builtin_templates(self):
        """Load pre-defined templates"""
        # Template 1: Two Sum
        two_sum = ProblemTemplate(
            template_id="two_sum_array",
            problem_type="array",
            concept="array traversal with target sum finding",
            difficulty="easy",
            algorithmic_pattern="single_pass",  # Brute force O(n²) version (easy)
            time_complexity="O(n²)",
            input_format="An array of integers and a target sum",
            output_format="Indices of two numbers that add up to target",
            constraints={
                "array_length": {"min": 2, "max": 100},
                "element_value": {"min": -1000, "max": 1000},
                "target": {"min": -2000, "max": 2000}
            },
            core_logic="Find two numbers in array that sum to target value",
            variables=["array", "target", "indices"],
            context_templates=[
                "Given an array of {elem_type}, find two {elem_name} that sum to {target_name}",
                "Find indices of two {elem_name} in the array that add up to the {target_name}",
                "Locate two {elem_name} whose sum equals the {target_name}"
            ],
            value_ranges={
                "length": (3, 10),
                "values": (-20, 20),
                "target": (-30, 30)
            },
            test_generator_type="computed",
            test_logic="def generate(arr, target): \\n    for i in range(len(arr)):\\n        for j in range(i+1, len(arr)):\\n            if arr[i] + arr[j] == target:\\n                return [i, j]\\n    return []"
        )
        
        # Template 2: Find Maximum
        find_max = ProblemTemplate(
            template_id="array_maximum",
            problem_type="array",
            concept="finding maximum element in collection",
            difficulty="easy",
            algorithmic_pattern="single_pass",  # Single loop through array
            time_complexity="O(n)",
            input_format="An array of integers",
            output_format="The maximum value in the array",
            constraints={
                "array_length": {"min": 1, "max": 1000},
                "element_value": {"min": -1000000, "max": 1000000}
            },
            core_logic="Find and return the largest element in the array",
            variables=["array", "maximum"],
            context_templates=[
                "Find the largest {elem_type} in the given {container}",
                "Determine the maximum {elem_name} from the {container}",
                "Locate the highest value among the {elem_name}"
            ],
            value_ranges={
                "length": (3, 10),
                "values": (-50, 50)
            },
            test_generator_type="computed",
            test_logic="def generate(arr): return max(arr)"
        )
        
        # Template 3: Sum Calculation
        sum_calc = ProblemTemplate(
            template_id="sum_calculation",
            problem_type="math",
            concept="basic arithmetic - addition",
            difficulty="easy",
            algorithmic_pattern="arithmetic",  # Simple arithmetic operation
            time_complexity="O(n)",
            input_format="Two or more integers",
            output_format="The sum of all input integers",
            constraints={
                "num_count": {"min": 2, "max": 10},
                "value": {"min": -1000, "max": 1000}
            },
            core_logic="Calculate the sum of all provided numbers",
            variables=["numbers", "sum", "total"],
            context_templates=[
                "Calculate the sum of {count} {num_type}",
                "Find the total of the given {num_type}",
                "Add all {num_type} and return the result"
            ],
            value_ranges={
                "count": (2, 5),
                "values": (-100, 100)
            },
            test_generator_type="computed",
            test_logic="def generate(nums): return sum(nums)"
        )
        
        # Add to store
        self.save_template(two_sum)
        self.save_template(find_max)
        self.save_template(sum_calc)
    
    def save_template(self, template: ProblemTemplate) -> bool:
        """Save a template to the store"""
        is_valid, error = template.validate()
        if not is_valid:
            raise ValueError(f"Invalid template: {error}")
        
        self._templates[template.template_id] = template
        return True
    
    def get_template(self, template_id: str) -> Optional[ProblemTemplate]:
        """Get a template by ID"""
        return self._templates.get(template_id)
    
    def find_template_by_type(self, problem_type: str) -> Optional[ProblemTemplate]:
        """Find a template by problem type"""
        for template in self._templates.values():
            if template.problem_type == problem_type:
                return template
        return None
    
    def find_template_by_concept(self, concept_keywords: List[str]) -> Optional[ProblemTemplate]:
        """Find template by matching concept keywords"""
        for template in self._templates.values():
            concept_lower = template.concept.lower()
            if any(kw.lower() in concept_lower for kw in concept_keywords):
                return template
        return None
    
    def list_all_templates(self) -> List[ProblemTemplate]:
        """Get all templates"""
        return list(self._templates.values())
    
    def find_template_by_difficulty(
        self, 
        difficulty: str, 
        problem_type: str = None
    ) -> Optional[ProblemTemplate]:
        """
        Find template matching difficulty (STRICT matching)
        Optionally filter by problem type
        """
        candidates = []
        
        for template in self._templates.values():
            # Must match difficulty exactly
            if template.difficulty.lower() != difficulty.lower():
                continue
            
            # If problem type specified, must match
            if problem_type and template.problem_type != problem_type:
                continue
            
            candidates.append(template)
        
        # Return first match (could be randomized)
        return candidates[0] if candidates else None
    
    def find_templates_by_pattern(
        self,
        algorithmic_pattern: str
    ) -> List[ProblemTemplate]:
        """Find all templates matching an algorithmic pattern"""
        matches = []
        
        for template in self._templates.values():
            if template.algorithmic_pattern == algorithmic_pattern:
                matches.append(template)
        
        return matches
    
    def increment_usage(self, template_id: str):
        """Increment usage counter for a template"""
        if template_id in self._templates:
            self._templates[template_id].usage_count += 1


# Global template store instance
_template_store = None

def get_template_store() -> TemplateStore:
    """Get or create the global template store"""
    global _template_store
    if _template_store is None:
        _template_store = TemplateStore()
    return _template_store
