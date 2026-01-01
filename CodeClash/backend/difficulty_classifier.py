"""
Difficulty Classification System
Defines algorithmic patterns and enforces difficulty
"""
from enum import Enum
from typing import List, Set


class AlgorithmicPattern(Enum):
    """Algorithmic patterns that define difficulty"""
    
    # EASY patterns
    ARITHMETIC = "arithmetic"  # Basic math operations
    SINGLE_PASS = "single_pass"  # One loop, no state
    DIRECT_LOOKUP = "direct_lookup"  # Array/string indexing
    
    # MEDIUM patterns
    TWO_POINTER = "two_pointer"
    SLIDING_WINDOW = "sliding_window"
    PREFIX_SUM = "prefix_sum"
    GREEDY = "greedy"
    HASH_TABLE = "hash_table"
    SORTING = "sorting"
    BINARY_SEARCH = "binary_search"
    
    # HARD patterns
    DYNAMIC_PROGRAMMING = "dynamic_programming"
    GRAPH_TRAVERSAL = "graph_traversal"
    BACKTRACKING = "backtracking"
    TREE_RECURSION = "tree_recursion"
    ADVANCED_DATA_STRUCTURE = "advanced_data_structure"
    SEGMENT_TREE = "segment_tree"
    TRIE = "trie"


class DifficultyLevel(Enum):
    """Difficulty levels with strict definitions"""
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class DifficultyClassifier:
    """
    Classifies problem difficulty based on algorithmic patterns
    NOT based on labels or text
    """
    
    # Pattern to difficulty mapping
    PATTERN_DIFFICULTY = {
        # EASY
        AlgorithmicPattern.ARITHMETIC: DifficultyLevel.EASY,
        AlgorithmicPattern.SINGLE_PASS: DifficultyLevel.EASY,
        AlgorithmicPattern.DIRECT_LOOKUP: DifficultyLevel.EASY,
        
        # MEDIUM
        AlgorithmicPattern.TWO_POINTER: DifficultyLevel.MEDIUM,
        AlgorithmicPattern.SLIDING_WINDOW: DifficultyLevel.MEDIUM,
        AlgorithmicPattern.PREFIX_SUM: DifficultyLevel.MEDIUM,
        AlgorithmicPattern.GREEDY: DifficultyLevel.MEDIUM,
        AlgorithmicPattern.HASH_TABLE: DifficultyLevel.MEDIUM,
        AlgorithmicPattern.SORTING: DifficultyLevel.MEDIUM,
        AlgorithmicPattern.BINARY_SEARCH: DifficultyLevel.MEDIUM,
        
        # HARD
        AlgorithmicPattern.DYNAMIC_PROGRAMMING: DifficultyLevel.HARD,
        AlgorithmicPattern.GRAPH_TRAVERSAL: DifficultyLevel.HARD,
        AlgorithmicPattern.BACKTRACKING: DifficultyLevel.HARD,
        AlgorithmicPattern.TREE_RECURSION: DifficultyLevel.HARD,
        AlgorithmicPattern.ADVANCED_DATA_STRUCTURE: DifficultyLevel.HARD,
        AlgorithmicPattern.SEGMENT_TREE: DifficultyLevel.HARD,
        AlgorithmicPattern.TRIE: DifficultyLevel.HARD,
    }
    
    # Keywords that indicate patterns
    PATTERN_KEYWORDS = {
        AlgorithmicPattern.ARITHMETIC: ['sum', 'product', 'difference', 'quotient', 'average', 'factorial'],
        AlgorithmicPattern.SINGLE_PASS: ['maximum', 'minimum', 'count', 'find element'],
        AlgorithmicPattern.TWO_POINTER: ['two pointer', 'opposite ends', 'palindrome', 'sorted array'],
        AlgorithmicPattern.SLIDING_WINDOW: ['subarray', 'substring', 'window', 'consecutive'],
        AlgorithmicPattern.PREFIX_SUM: ['prefix', 'range sum', 'cumulative'],
        AlgorithmicPattern.GREEDY: ['greedy', 'optimal choice', 'maximize', 'minimize'],
        AlgorithmicPattern.HASH_TABLE: ['hash', 'map', 'frequency', 'duplicate'],
        AlgorithmicPattern.SORTING: ['sort', 'order', 'kth smallest', 'kth largest'],
        AlgorithmicPattern.BINARY_SEARCH: ['binary search', 'sorted', 'search space'],
        AlgorithmicPattern.DYNAMIC_PROGRAMMING: ['dp', 'dynamic programming', 'optimal substructure', 'overlapping subproblems', 'memoization'],
        AlgorithmicPattern.GRAPH_TRAVERSAL: ['graph', 'bfs', 'dfs', 'shortest path', 'connected components'],
        AlgorithmicPattern.BACKTRACKING: ['backtrack', 'permutation', 'combination', 'generate all'],
        AlgorithmicPattern.TREE_RECURSION: ['tree', 'binary tree', 'recursion', 'preorder', 'inorder'],
        AlgorithmicPattern.ADVANCED_DATA_STRUCTURE: ['heap', 'priority queue', 'union find', 'disjoint set'],
        AlgorithmicPattern.SEGMENT_TREE: ['segment tree', 'range query'],
        AlgorithmicPattern.TRIE: ['trie', 'prefix tree'],
    }
    
    @classmethod
    def detect_pattern(cls, core_logic: str, description: str = "") -> AlgorithmicPattern:
        """
        Detect algorithmic pattern from problem text
        Returns the detected pattern
        """
        text = (core_logic + " " + description).lower()
        
        # Check for patterns in order of complexity (hardest first)
        # This prevents misclassification of complex problems as simple
        
        # Hard patterns
        for pattern in [
            AlgorithmicPattern.DYNAMIC_PROGRAMMING,
            AlgorithmicPattern.GRAPH_TRAVERSAL,
            AlgorithmicPattern.BACKTRACKING,
            AlgorithmicPattern.SEGMENT_TREE,
            AlgorithmicPattern.TRIE,
            AlgorithmicPattern.TREE_RECURSION,
            AlgorithmicPattern.ADVANCED_DATA_STRUCTURE
        ]:
            keywords = cls.PATTERN_KEYWORDS[pattern]
            if any(kw in text for kw in keywords):
                return pattern
        
        # Medium patterns
        for pattern in [
            AlgorithmicPattern.BINARY_SEARCH,
            AlgorithmicPattern.TWO_POINTER,
            AlgorithmicPattern.SLIDING_WINDOW,
            AlgorithmicPattern.PREFIX_SUM,
            AlgorithmicPattern.GREEDY,
            AlgorithmicPattern.HASH_TABLE,
            AlgorithmicPattern.SORTING
        ]:
            keywords = cls.PATTERN_KEYWORDS[pattern]
            if any(kw in text for kw in keywords):
                return pattern
        
        # Easy patterns (default)
        for pattern in [
            AlgorithmicPattern.ARITHMETIC,
            AlgorithmicPattern.SINGLE_PASS
        ]:
            keywords = cls.PATTERN_KEYWORDS[pattern]
            if any(kw in text for kw in keywords):
                return pattern
        
        # Default to single pass if nothing detected
        return AlgorithmicPattern.SINGLE_PASS
    
    @classmethod
    def get_difficulty_from_pattern(cls, pattern: AlgorithmicPattern) -> DifficultyLevel:
        """Get difficulty level for a pattern"""
        return cls.PATTERN_DIFFICULTY.get(pattern, DifficultyLevel.MEDIUM)
    
    @classmethod
    def validate_difficulty_match(
        cls, 
        pattern: AlgorithmicPattern, 
        claimed_difficulty: str
    ) -> tuple[bool, str]:
        """
        Validate that pattern matches claimed difficulty
        Returns (is_valid, error_message)
        """
        actual_difficulty = cls.get_difficulty_from_pattern(pattern)
        claimed = claimed_difficulty.lower()
        
        # Check for downgrade
        if actual_difficulty == DifficultyLevel.HARD and claimed in ['easy', 'medium']:
            return False, f"Pattern {pattern.value} is HARD, cannot be labeled as {claimed}"
        
        if actual_difficulty == DifficultyLevel.MEDIUM and claimed == 'easy':
            return False, f"Pattern {pattern.value} is MEDIUM, cannot be labeled as easy"
        
        # Allow slight upgrade (easy problem labeled medium is OK)
        return True, "Valid"
    
    @classmethod
    def get_complexity_requirements(cls, difficulty: DifficultyLevel) -> dict:
        """Get minimum complexity requirements for difficulty"""
        if difficulty == DifficultyLevel.EASY:
            return {
                'min_time_complexity': 'O(n)',
                'max_loops': 1,
                'state_tracking': False,
                'optimization_required': False
            }
        elif difficulty == DifficultyLevel.MEDIUM:
            return {
                'min_time_complexity': 'O(n)',
                'max_time_complexity': 'O(n log n)',
                'state_tracking': True,
                'optimization_required': True
            }
        else:  # HARD
            return {
                'time_complexity': 'O(n²) or better with DP',
                'state_tracking': True,
                'multi_stage': True,
                'optimization_required': True
            }


def enforce_difficulty_match(template_difficulty: str, pattern: AlgorithmicPattern) -> bool:
    """
    Enforce that template difficulty matches its algorithmic pattern
    Returns True if valid, False if downgrade detected
    """
    classifier = DifficultyClassifier()
    is_valid, _ = classifier.validate_difficulty_match(pattern, template_difficulty)
    return is_valid
