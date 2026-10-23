import os
from groq import Groq

def translate_text_groq(text, target_language, api_key=None):
    """
    Takes an input string, detects its language, and translates it 
    to the target language using Groq's API. Returns None if an error occurs.
    """
    try:
        client = Groq(api_key=api_key or os.environ.get("GROQ_API_KEY"), timeout=30.0, max_retries=0)
        
        completion = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {
                    "role": "system",
                    "content": f"You are a professional translator. Detect the language of the user's text and translate it into {target_language}. Return ONLY the translated text, nothing else."
                },
                {
                    "role": "user",
                    "content": text
                }
            ],
            temperature=0.3 
        )
        
        return completion.choices[0].message.content
        
    except Exception as e:
        print(f"Translation error: {e}")
        return None