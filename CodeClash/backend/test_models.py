import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.environ.get('GEMINI_API_KEY')
print(f"API Key present: {bool(api_key)}")

try:
    client = genai.Client(api_key=api_key)
    # Try to list models to see what's available
    # The new SDK might use client.models.list() or similar.
    # I'll try a basic generate call with a known model to see the error details if list fails.
    
    print("Attempting to generate with 'gemini-1.5-flash'...")
    response = client.models.generate_content(
        model='gemini-1.5-flash',
        contents='Hello'
    )
    print("Success with gemini-1.5-flash!")
except Exception as e:
    print(f"Error with gemini-1.5-flash: {e}")

try:
    print("Attempting to generate with 'gemini-2.0-flash-exp'...")
    response = client.models.generate_content(
        model='gemini-2.0-flash-exp',
        contents='Hello'
    )
    print("Success with gemini-2.0-flash-exp!")
except Exception as e:
    print(f"Error with gemini-2.0-flash-exp: {e}")
