"""
Fallback Generator - DEPRECATED / REMOVED
Random generation features have been removed per new requirements.
"""

class FallbackGenerator:
    def generate_similar_problem(self, *args, **kwargs):
        raise NotImplementedError("Random problem generation has been removed.")

def get_fallback_generator():
    return FallbackGenerator()
