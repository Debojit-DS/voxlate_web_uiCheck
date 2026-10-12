"""Network-free contract tests. Providers and MongoDB are fixtures, not live services."""
import os
import sys
import time
import unittest
from pathlib import Path
from unittest.mock import patch

os.environ.update({"DATABASE_URL": "mongodb://localhost:27017", "JWT_SECRET": "fixture-secret-only-not-for-production", "FRONTEND_URL": "http://localhost:3002"})
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import jwt
from fastapi.testclient import TestClient
import connector_stream as demo

class Collection:
    def __init__(self): self.users = {}
    async def find_one(self, query):
        return next((user.copy() for user in self.users.values() if all(user.get(k) == v for k,v in query.items())), None)
    async def update_one(self, query, update, upsert=False):
        key = query["_id"]
        if key not in self.users and upsert: self.users[key] = {"_id": key, **update.get("$setOnInsert", {})}
        user = self.users.get(key)
        if user:
            user.update(update.get("$set", {}))
            for field, value in update.get("$inc", {}).items(): user[field] = user.get(field, 0) + value
    async def find_one_and_update(self, query, update, **options):
        user = self.users.get(query["_id"])
        if not user or user["count"] >= query["count"]["$lt"]: return None
        user["count"] += update["$inc"]["count"]
        return user.copy()

def ticket(**extra):
    claims = {"sub": "fixture-user", "email": "fixture@example.invalid", "aud": "voxlate-demo", "iss": "voxlate-web", "iat": int(time.time()), "exp": int(time.time())+120, **extra}
    return jwt.encode(claims, os.environ["JWT_SECRET"], algorithm="HS256")

def tts(text, ref, path):
    Path(path).write_bytes(b"RIFFfixture-wave")
    return path

class DemoContract(unittest.TestCase):
    def setUp(self):
        self.collection = Collection()
        self.patches = [patch.object(demo, "users_collection", self.collection),
                        patch.object(demo, "transcribe_audio_groq", lambda file: {"text": "Hello", "language": "en"}),
                        patch.object(demo, "translate_text_groq", lambda text, language: "नमस्ते"),
                        patch.object(demo, "onboard_user_voice", lambda file: "fixture-profile"),
                        patch.object(demo, "generate_live_tts", tts)]
        for item in self.patches: item.start(); self.addCleanup(item.stop)
        self.client = TestClient(demo.app)
    def session(self): return self.client.websocket_connect("/ws", headers={"origin":"http://localhost:3002"})
    def test_ticket_rejects_expired_wrong_audience_and_email_impersonation(self):
        for message in ["email: fixture@example.invalid", "auth: "+ticket(exp=int(time.time())-10), "auth: "+ticket(aud="voxlate-web")]:
            with self.session() as socket:
                socket.send_text(message); self.assertEqual(socket.receive_text(), "unauthorized")
        self.assertEqual(self.collection.users, {})
    def test_success_and_voice_reuse(self):
        for language in ["hi", "zh", "ar"]:
            with self.session() as socket:
                socket.send_text("auth: "+ticket()); self.assertEqual(socket.receive_text(),"permitted")
                socket.send_bytes(b"fixture-audio"); socket.send_text("lang: "+language)
                result=socket.receive_json(); self.assertEqual(result["status"],"success"); self.assertEqual(result["translated_text"],"नमस्ते")
        self.assertEqual(self.collection.users["fixture-user"]["count"],3)
        self.assertEqual(self.collection.users["fixture-user"]["ref_id"],"fixture-profile")
    def test_quota_denies_after_five_successful_clips(self):
        self.collection.users["fixture-user"]={"_id":"fixture-user","email":"fixture@example.invalid","count":5,"ref_id":None}
        with self.session() as socket:
            socket.send_text("auth: "+ticket()); self.assertEqual(socket.receive_text(),"permitted")
            socket.send_bytes(b"audio");socket.send_text("lang: hi");self.assertEqual(socket.receive_text(),"denied")
    def test_invalid_language_empty_clip_and_failure_do_not_consume_allowance(self):
        for audio,language in [(b"audio","invalid"),(b"","hi")]:
            with self.session() as socket:
                socket.send_text("auth: "+ticket());socket.receive_text();socket.send_bytes(audio);socket.send_text("lang: "+language);self.assertEqual(socket.receive_text(),"error")
        with patch.object(demo,"generate_live_tts",lambda *args:None):
            with self.session() as socket:
                socket.send_text("auth: "+ticket());socket.receive_text();socket.send_bytes(b"audio");socket.send_text("lang: hi");self.assertEqual(socket.receive_text(),"error")
        self.assertEqual(self.collection.users["fixture-user"]["count"],0)
    def test_selector_codes_match_server_allowlist(self):
        import re
        frontend=Path(__file__).resolve().parents[4]/"lib/demoLanguages.ts"
        self.assertEqual(set(re.findall(r'lang: "([a-z]+)"',frontend.read_text())), demo.LANGUAGES)
    def test_unapproved_origin_rejected(self):
        from starlette.websockets import WebSocketDisconnect
        with self.assertRaises(WebSocketDisconnect):
            with self.client.websocket_connect("/ws",headers={"origin":"https://unrelated.example"}): pass

if __name__ == "__main__": unittest.main()
