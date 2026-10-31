@echo off
cd /d "%~dp0"
if not exist .env.local echo Create .env.local from .env.example and add your Gemini API key.
if not exist node_modules (echo Installing dependencies... & call npm install)
call npm run dev -- --hostname 127.0.0.1
