# BuildSight AI — Java Spring Boot Backend

Academic Project: **UTILIZATION OF IMAGES FOR MONITORING OF PROGRESS OF CONSTRUCTION ACTIVITIES FOR BUILDING CONSTRUCTION PROJECTS**

## 1. System Requirements
- **Java Development Kit (JDK)**: Java 17 or higher (OpenJDK 17 / Eclipse Temurin 17 / Oracle JDK 17)
- **Maven**: Version 3.8+ (or use included `./mvnw`)
- **Database**: SQLite (built-in local academic default, zero installation required) or PostgreSQL 14+
- **Gemini API Key**: Multimodal vision analysis powered by Google Gemini Vision API

## 2. Quick Local Execution

### Step A: Set Environment Variable
```bash
# Linux / macOS
export GEMINI_API_KEY="your-google-gemini-api-key"

# Windows (Command Prompt)
set GEMINI_API_KEY=your-google-gemini-api-key

# Windows (PowerShell)
$env:GEMINI_API_KEY="your-google-gemini-api-key"
```

### Step B: Build and Run with Maven
```bash
cd backend
mvn clean spring-boot:run
```
Or execute the helper script:
```bash
# Linux / macOS
./run-backend.sh

# Windows
run-backend.bat
```

The Spring Boot backend will start on **`http://localhost:8080`**.

## 3. API Endpoints & Swagger UI
- **Swagger OpenAPI Documentation**: `http://localhost:8080/swagger-ui.html`
- **OpenAPI Schema (JSON)**: `http://localhost:8080/api-docs`
- **Health Check**: `GET http://localhost:8080/api/v1/health`
- **Projects**: `GET /api/v1/projects`, `POST /api/v1/projects`
- **Image Observations**: `GET /api/v1/observations`, `POST /api/v1/observations`
- **Multimodal AI Vision Analysis**: `POST /api/v1/ai/analyze-image`
- **Historical Image Comparison**: `POST /api/v1/ai/compare-images`
- **Category Mismatch Alerts**: `GET /api/v1/alerts`, `PUT /api/v1/alerts/{id}/resolve`
- **Progress Reports**: `GET /api/v1/reports`, `POST /api/v1/reports`

## 4. Connecting with the React Frontend
In the BuildSight web application, open the top-right header badge:
Toggle connection mode from **Live Express Preview** to **Local Spring Boot Backend (`http://localhost:8080/api/v1`)**.
The system automatically conducts an HTTP health handshake to verify connection.

## 5. Automated Tests
Run the comprehensive test suite (Unit & Integration tests):
```bash
mvn test
```
Tested modules:
- `ImageValidationTest`: Magic byte validation (JPEG `FF D8 FF`, PNG `89 50 4E 47`, WebP), corruption checks, SHA-256 deduplication.
- `CategoryMismatchDetectionTest`: Stage divergence detection, conflict flags, alert triggers.
- `ProjectServiceTest`: CRUD operations, milestone weightings, date validation.
