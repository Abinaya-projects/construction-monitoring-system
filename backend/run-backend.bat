@echo off
REM BuildSight AI - Local Backend Runner (Windows)
echo ==========================================================
echo BuildSight AI - Spring Boot 3 Backend Launcher
echo Project: Image-Based Construction Progress Monitoring
echo ==========================================================

if "%GEMINI_API_KEY%"=="" (
    echo WARNING: GEMINI_API_KEY environment variable is not set.
    echo Please set it using: set GEMINI_API_KEY=your_key_here
    echo ----------------------------------------------------------
)

echo Starting Maven Spring Boot Application on port 8080...
mvn clean spring-boot:run
