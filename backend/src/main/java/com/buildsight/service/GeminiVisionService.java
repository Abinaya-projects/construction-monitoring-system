package com.buildsight.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;

/**
 * Service to communicate with Google Gemini Multimodal Vision API via standard Java 17 HttpClient.
 * Sends structured civil engineering prompts and expects structured JSON output.
 */
@Service
public class GeminiVisionService {

    private static final Logger log = LoggerFactory.getLogger(GeminiVisionService.class);

    @Value("${buildsight.gemini.api-key:}")
    private String configuredApiKey;

    @Value("${buildsight.gemini.api-url:https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent}")
    private String geminiApiUrl;

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public GeminiVisionService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .build();
    }

    private String getApiKey() {
        if (configuredApiKey != null && !configuredApiKey.isBlank()) {
            return configuredApiKey;
        }
        String envKey = System.getenv("GEMINI_API_KEY");
        if (envKey != null && !envKey.isBlank()) {
            return envKey;
        }
        return null;
    }

    public Map<String, Object> analyzeConstructionImage(
            String base64ImageData,
            String mimeType,
            String selectedCategory,
            String projectName,
            String inspectorNotes
    ) throws Exception {
        String apiKey = getApiKey();
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("GEMINI_API_KEY is not configured on the Java server. Set GEMINI_API_KEY environment variable.");
        }

        String prompt = "You are a senior civil and structural engineering inspector and computer vision specialist evaluating a building construction site photograph.\n" +
                "Project Context: " + (projectName != null ? projectName : "Building Project") + "\n" +
                "Selected Construction Stage Claimed by Inspector: " + (selectedCategory != null ? selectedCategory : "Unknown") + "\n" +
                "Notes: " + (inspectorNotes != null ? inspectorNotes : "None") + "\n\n" +
                "Classify the image strictly into one of the 10 stages:\n" +
                "STAGE_01_FOUNDATION, STAGE_02_PLINTH, STAGE_03_SUPERSTRUCTURE, STAGE_04_MASONRY, " +
                "STAGE_05_FACADE, STAGE_06_ROOFING, STAGE_07_MEP_SERVICES, STAGE_08_INTERIOR, " +
                "STAGE_09_COMPLETION, STAGE_10_UNCLEAR.\n\n" +
                "Return pure JSON with keys: predictedStage, confidenceLevel (HIGH/MEDIUM/LOW/UNCERTAIN), " +
                "confidenceExplanation, visibleActivities (array), observableEvidence (array), visibleMaterials (array), " +
                "structuralElements (array), finishingWorks (array), imageQualityObservations (array), " +
                "uncertaintyAndLimitations (array), categoryMatch (boolean), mismatchExplanation (string or null), " +
                "recommendedReviewAction (string).";

        Map<String, Object> partImage = Map.of(
                "inlineData", Map.of(
                        "mimeType", (mimeType != null ? mimeType : "image/jpeg"),
                        "data", base64ImageData
                )
        );
        Map<String, Object> partText = Map.of("text", prompt);

        Map<String, Object> contents = Map.of(
                "parts", List.of(partImage, partText)
        );

        Map<String, Object> requestPayload = Map.of(
                "contents", List.of(contents),
                "generationConfig", Map.of(
                        "responseMimeType", "application/json"
                )
        );

        String jsonBody = objectMapper.writeValueAsString(requestPayload);
        String targetUrl = geminiApiUrl + "?key=" + apiKey;

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(targetUrl))
                .header("Content-Type", "application/json")
                .header("User-Agent", "aistudio-build")
                .timeout(Duration.ofSeconds(45))
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        log.info("Sending image analysis request to Gemini Vision API for project: {}", projectName);
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            log.error("Gemini API error (Status {}): {}", response.statusCode(), response.body());
            throw new RuntimeException("Gemini Vision API returned error code " + response.statusCode() + ": " + response.body());
        }

        JsonNode rootNode = objectMapper.readTree(response.body());
        JsonNode textNode = rootNode.at("/candidates/0/content/parts/0/text");
        if (textNode.isMissingNode() || textNode.asText().isBlank()) {
            throw new RuntimeException("Empty response from Gemini vision model.");
        }

        String rawJson = textNode.asText();
        return objectMapper.readValue(rawJson, Map.class);
    }
}
