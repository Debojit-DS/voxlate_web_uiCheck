"""Recorded-clip demo. The planned streaming desktop pipeline is separate."""
import asyncio
import base64
import logging
import os
from pathlib import Path
from tempfile import TemporaryDirectory

import jwt
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ReturnDocument

from transcribe_stt import transcribe_audio_groq
from translate import translate_text_groq
from voice_clone_tts import onboard_user_voice, generate_live_tts

load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[value.strip() for value in os.getenv("FRONTEND_URL", "http://localhost:3002").split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
logger = logging.getLogger("voxlate.demo")
mongo_client = AsyncIOMotorClient(os.getenv("DATABASE_URL"), serverSelectionTimeoutMS=5000)
users_collection = mongo_client[os.getenv("DEMO_DATABASE_NAME", "voxlate_db")]["users"]
LANGUAGES = {"en", "es", "fr", "de", "bn", "ta", "hi", "ja", "zh", "ar"}
MAX_AUDIO_BYTES = 10 * 1024 * 1024


def verify_demo_ticket(message: str):
    secret = os.getenv("JWT_SECRET", "")
    if len(secret) < 16 or not message.startswith("auth: "):
        raise ValueError("Signed demo access required")
    claims = jwt.decode(message[6:], secret, algorithms=["HS256"], audience="voxlate-demo",
                        issuer="voxlate-web", options={"require": ["sub", "email", "exp", "iat", "aud", "iss"]})
    if not isinstance(claims["sub"], str) or not claims["sub"] or not isinstance(claims["email"], str):
        raise ValueError("Invalid identity")
    return claims


@app.get("/ping")
async def ping():
    return {"status": "success", "service": "voxlate-demo"}


async def status_and_close(ws, status):
    try:
        await ws.send_text(status)
        await ws.close()
    except (WebSocketDisconnect, RuntimeError):
        pass


@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    allowed_origins = {value.strip() for value in os.getenv("FRONTEND_URL", "http://localhost:3002").split(",")}
    if ws.headers.get("origin") not in allowed_origins:
        await ws.close(code=1008)
        return
    await ws.accept()
    identity = None
    reserved = False
    completed = False
    try:
        try:
            claims = verify_demo_ticket(await asyncio.wait_for(ws.receive_text(), 10))
        except (ValueError, jwt.PyJWTError, asyncio.TimeoutError):
            return await status_and_close(ws, "unauthorized")
        identity = claims["sub"]
        # Preserve the old demo allowance/profile when upgrading from email identity.
        legacy = await users_collection.find_one({"email": claims["email"]})
        await users_collection.update_one({"_id": identity}, {"$setOnInsert": {
            "email": claims["email"], "count": (legacy or {}).get("count", 0), "ref_id": (legacy or {}).get("ref_id")
        }}, upsert=True)
        await ws.send_text("permitted")
        audio_data = await asyncio.wait_for(ws.receive_bytes(), 15)
        language_message = await asyncio.wait_for(ws.receive_text(), 5)
        if not audio_data or len(audio_data) > MAX_AUDIO_BYTES or not language_message.startswith("lang: "):
            return await status_and_close(ws, "error")
        target_lang = language_message[6:]
        if target_lang not in LANGUAGES:
            return await status_and_close(ws, "error")
        user = await users_collection.find_one_and_update(
            {"_id": identity, "count": {"$lt": 5}}, {"$inc": {"count": 1}}, return_document=ReturnDocument.AFTER)
        if not user:
            return await status_and_close(ws, "denied")
        reserved = True
        # UUID-owned temporary paths never contain an email or client-controlled path.
        with TemporaryDirectory(prefix="voxlate-demo-") as directory:
            filename = str(Path(directory) / "input.audio")
            output_filename = str(Path(directory) / "output.wav")
            Path(filename).write_bytes(audio_data)
            async with asyncio.timeout(80):
                transcript = await asyncio.to_thread(transcribe_audio_groq, filename)
                if not transcript or not isinstance(transcript.get("text"), str) or not transcript["text"].strip():
                    return await status_and_close(ws, "error")
                translated = await asyncio.to_thread(translate_text_groq, transcript["text"], target_lang)
                if not isinstance(translated, str) or not translated.strip():
                    return await status_and_close(ws, "error")
                ref_id = user.get("ref_id")
                if not ref_id:
                    ref_id = await asyncio.to_thread(onboard_user_voice, filename)
                    if not ref_id:
                        return await status_and_close(ws, "error")
                    await users_collection.update_one({"_id": identity}, {"$set": {"ref_id": ref_id}})
                output = await asyncio.to_thread(generate_live_tts, translated, ref_id, output_filename)
                if not output:
                    return await status_and_close(ws, "error")
                output_bytes = Path(output).read_bytes()
                if not output_bytes or len(output_bytes) > 16 * 1024 * 1024:
                    return await status_and_close(ws, "error")
                await ws.send_json({"status": "success", "original_text": transcript["text"],
                                    "translated_text": translated, "audio_base64": base64.b64encode(output_bytes).decode("ascii")})
                completed = True
        await ws.close()
    except WebSocketDisconnect:
        pass
    except Exception:
        logger.warning("Demo request failed", exc_info=False)
        await status_and_close(ws, "error")
    finally:
        if reserved and not completed:
            try:
                await users_collection.update_one({"_id": identity, "count": {"$gt": 0}}, {"$inc": {"count": -1}})
            except Exception:
                logger.warning("Demo allowance refund failed", exc_info=False)
