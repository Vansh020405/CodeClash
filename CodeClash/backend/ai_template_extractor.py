"""
AI Template Extractor
Uses AI ONCE to create reusable problem templates
"""
import json
import logging
from typing import Optional
from ai_generator import get_generator
from problem_templates import ProblemTemplate

logger = logging.getLogger(__name__)


class AITemplateExtractor:
    """
    Uses AI to extract problem templates
    Called ONCE per problem type, then template is reused forever
    """
    
    def __init__(self):
        try:
            self.ai_generator = get_generator()
        except Exception as e:
            logger.warning(f"AI generator not available: {e}")
            self.ai_generator = None
    
    def extract_template(self, sample_problem: str) -> Optional[ProblemTemplate]:
        """
        Use AI to extract a reusable template from sample problem
        Returns validated template or None
        """
        if not self.ai_generator:
            logger.error("AI generator not available for template extraction")
            return None
        
        try:
            # Build prompt for template extraction
            prompt = self._build_template_extraction_prompt(sample_problem)
            
            # Call AI
            response = self.ai_generator.client.models.generate_content(
                model='gemini-2.0-flash',
                contents=prompt
            )
            
            if not response.text:
                logger.error("Empty response from AI")
                return None
            
            # Parse JSON
            template_data = self._parse_template_response(response.text)
            
            if not template_data:
                logger.error("Failed to parse template from AI response")
                return None
            
            # Create template object
            template = self._create_template_from_data(template_data)
            
            # Validate
            is_valid, error = template.validate()
            if not is_valid:
                logger.error(f"Template validation failed: {error}")
                # Try to fix and re-extract
                return self._retry_with_feedback(sample_problem, error)
            
            logger.info(f"✓ Successfully extracted template: {template.template_id}")
            return template
        
        except Exception as e:
            logger.error(f"Template extraction failed: {e}")
            return None
    
    def _build_template_extraction_prompt(self, sample_problem: str) -> str:
        """Build prompt for AI template extraction"""
        prompt = f"""You are a problem template extractor. Analyze this coding problem and extract a REUSABLE TEMPLATE.

SAMPLE PROBLEM:
{sample_problem}

IMPORTANT RULES:
1. Return ONLY valid JSON (no markdown, no explanations)
2. The template must be REUSABLE for generating similar problems
3. core_logic must be PRECISE and ALGORITHMIC, not generic
4. Include context_templates with placeholders like {{elem_type}}, {{container}}, etc.

Return this exact JSON structure:
{{
    "template_id": "unique_snake_case_id",
    "problem_type": "array | math | string | etc",
    "concept": "what algorithmic skill is being tested",
    "difficulty": "easy | medium | hard",
    "input_format": "clear description of input",
    "output_format": "clear description of output",
    "constraints": {{
        "variable_name": {{"min": number, "max": number}}
    }},
    "core_logic": "precise algorithm description (NO generic phrases like 'process input')",
    "variables": ["list", "of", "key", "variables"],
    "context_templates": [
        "Template with {{elem_type}} and {{container}} placeholders",
        "Another phrasing with {{target_name}} and {{elem_name}}"
    ],
    "value_ranges": {{
        "key": (min, max)
    }},
    "test_generator_type": "computed"
}}

CRITICAL: core_logic must describe the ALGORITHM, not the story.
Example GOOD: "Find two elements in array whose sum equals target value"
Example BAD: "Process the input and return the output"

Return ONLY the JSON, nothing else:"""
        
        return prompt
    
    def _parse_template_response(self, response_text: str) -> Optional[dict]:
        """Parse AI response into template data"""
        try:
            # Clean response
            text = response_text.strip()
            
            # Remove markdown if present
            if '```json' in text:
                start = text.find('```json') + 7
                end = text.find('```', start)
                text = text[start:end].strip()
            elif '```' in text:
                start = text.find('```') + 3
                end = text.find('```', start)
                text = text[start:end].strip()
            
            # Find JSON object
            if '{' in text:
                start = text.find('{')
                end = text.rfind('}') + 1
                text = text[start:end]
            
            # Parse JSON
            data = json.loads(text)
            return data
        
        except Exception as e:
            logger.error(f"Failed to parse template JSON: {e}")
            logger.debug(f"Response text: {response_text[:500]}")
            return None
    
    def _create_template_from_data(self, data: dict) -> ProblemTemplate:
        """Create ProblemTemplate object from parsed data"""
        # Ensure required fields with defaults
        template = ProblemTemplate(
            template_id=data.get('template_id', 'unknown_template'),
            problem_type=data.get('problem_type', 'general'),
            concept=data.get('concept', 'problem solving'),
            difficulty=data.get('difficulty', 'medium').lower(),
            input_format=data.get('input_format', 'Standard input'),
            output_format=data.get('output_format', 'Standard output'),
            constraints=data.get('constraints', {}),
            core_logic=data.get('core_logic', ''),
            variables=data.get('variables', []),
            context_templates=data.get('context_templates', [
                "Solve the following {problem_type} problem"
            ]),
            value_ranges=data.get('value_ranges', {}),
            test_generator_type=data.get('test_generator_type', 'computed'),
            created_from='ai'
        )
        
        return template
    
    def _retry_with_feedback(self, sample_problem: str, error: str) -> Optional[ProblemTemplate]:
        """Retry template extraction with validation feedback"""
        logger.info(f"Retrying template extraction with feedback: {error}")
        
        try:
            prompt = f"""The previous template extraction failed validation with error: "{error}"

Please re-analyze this problem and create a VALID template:

{sample_problem}

Requirements:
- core_logic must be specific and algorithmic (not "process input")
- Must include constraints
- Must include variables
- Must include context_templates with placeholders
- difficulty must be "easy", "medium", or "hard"

Return ONLY valid JSON:"""
            
            response = self.ai_generator.client.models.generate_content(
                model='gemini-2.0-flash',
                contents=prompt
            )
            
            if not response.text:
                return None
            
            data = self._parse_template_response(response.text)
            if not data:
                return None
            
            template = self._create_template_from_data(data)
            
            is_valid, new_error = template.validate()
            if is_valid:
                logger.info("✓ Template extraction successful on retry")
                return template
            else:
                logger.error(f"Template still invalid after retry: {new_error}")
                return None
        
        except Exception as e:
            logger.error(f"Retry failed: {e}")
            return None


# Singleton
_template_extractor = None

def get_template_extractor() -> AITemplateExtractor:
    """Get template extractor instance"""
    global _template_extractor
    if _template_extractor is None:
        _template_extractor = AITemplateExtractor()
    return _template_extractor
