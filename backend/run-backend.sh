#!/usr/bin/env bash
# BuildSight AI - Local Backend Runner (Linux/macOS)
set -e

echo "=========================================================="
echo "BuildSight AI - Spring Boot 3 Backend Launcher"
echo "Project: Image-Based Construction Progress Monitoring"
echo "=========================================================="

if [ -z "$GEMINI_API_KEY" ]; then
    echo "WARNING: GEMINI_API_KEY is not set."
    echo "AI image analysis will fail without a valid API key."
    echo "Example: export GEMINI_API_KEY=\"AIzaSy...\""
    echo "----------------------------------------------------------"
fi

echo "Compiling and launching Spring Boot application..."
mvn clean spring-boot:run
