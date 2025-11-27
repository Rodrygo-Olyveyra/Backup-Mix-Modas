@echo off
REM Wrapper simples para iniciar o servidor sem depender do npm.ps1 no PowerShell
REM Uso: start.cmd [PORT]
if not "%1"=="" (
  set PORT=%1
)
node server.js
