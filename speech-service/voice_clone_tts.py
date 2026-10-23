import os
from fishaudio import FishAudio

def onboard_user_voice(audio_file_path, user_name="Voxlate_Speaker"):
    """
    Uploads a short audio sample to create a saved voice profile.
    Returns the reference_id string to be saved by the orchestrator.
    """
    # The client automatically picks up the FISH_API_KEY from your .env file
    try:
        client = FishAudio(timeout=30.0)
    except Exception as e:
        print("❌ Failed to initialize Fish Audio Client. Is FISH_API_KEY in your .env?")
        return None

    try:
        with open(audio_file_path, "rb") as audio_file:
            print(f"  [API] Uploading {audio_file_path} to create voice profile...")
            
            # The SDK handles the multipart form data perfectly to prevent 422 errors
            voice_profile = client.voices.create(
                title=f"{user_name}_Voice",
                voices=[audio_file.read()],
                description="Live meeting voice clone profile."
            )
            
            return voice_profile.id
            
    except Exception as e:
        print(f"❌ Voice onboarding failed. Error details: {e}")
        # If it's an API error, this will print the exact reason (e.g., 'File too short')
        if hasattr(e, 'response') and hasattr(e.response, 'text'):
            print(f"❌ Server replied: {e.response.text}")
        return None


def generate_live_tts(text_to_speak, reference_id, output_path="output.wav"):
    """
    Generates ultra-low latency speech using the saved voice profile.
    """
    try:
        client = FishAudio(timeout=30.0)
        
        print("  [API] Requesting ultra-low latency TTS chunk...")
        audio_content = client.tts.convert(
            text=text_to_speak,
            reference_id=reference_id,
            model=os.getenv("FISH_TTS_MODEL", "s2.1-pro"),
            format="wav", 
            latency="balanced" 
        )
        
        with open(output_path, "wb") as f:
            f.write(audio_content)
            
        return output_path
        
    except Exception as e:
        print(f"❌ TTS generation failed: {e}")
        if hasattr(e, 'response') and hasattr(e.response, 'text'):
            print(f"❌ Server replied: {e.response.text}")
        return None