import os
from groq import Groq
from dotenv import load_dotenv

def transcribe_audio_groq(audio_file_path, api_key=None):
    """
    Takes an audio file path, sends it to Groq's Whisper API, 
    and returns the transcribed text and detected language.
    Returns None if an error occurs.
    """
    try:
        # Uses the provided key or defaults to the GROQ_API_KEY environment variable
        client = Groq(api_key=api_key or os.environ.get("GROQ_API_KEY"), timeout=30.0, max_retries=0)
        
        with open(audio_file_path, "rb") as audio_file:
            response = client.audio.transcriptions.create(
                file=(os.path.basename(audio_file_path), audio_file.read()),
                model="whisper-large-v3-turbo", 
                temperature=0.0,
                response_format="verbose_json"  # Required to get the detected language back
            )
            
        return {
            "text": response.text,
            "language": response.language
        }
        
    except Exception as e:
        print(f"Transcription error: {e}")
        return None