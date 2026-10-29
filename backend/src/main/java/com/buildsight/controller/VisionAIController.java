package com.buildsight.controller;

import com.buildsight.domain.AIAnalysis;
import com.buildsight.domain.Alert;
import com.buildsight.repository.AIAnalysisRepository;
import com.buildsight.repository.AlertRepository;
import com.buildsight.service.GeminiVisionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/ai")
@CrossOrigin(origins = "*")
public class VisionAIController {

    private final GeminiVisionService geminiVisionService;
    private final AIAnalysisRepository analysisRepository;
    private final AlertRepository alertRepository;
    private final ObjectMapper objectMapper;

    public VisionAIController(
            GeminiVisionService geminiVisionService,
            AIAnalysisRepository analysisRepository,
            AlertRepository alertRepository,
            ObjectMapper objectMapper
    ) {
        this.geminiVisionService = geminiVisionService;
        this.analysisRepository = analysisRepository;
        this.alertRepository = alertRepository;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/analyze-image")
    public ResponseEntity<?> analyzeImage(@RequestBody Map<String, Object> payload) {
        try {
            String base64Image = (String) payload.get("imageDataUri");
            String selectedCategory = (String) payload.get("selectedCategory");
            String projectName = (String) payload.get("projectName");
            String inspectorNotes = (String) payload.get("notes");
            String observationId = (String) payload.get("observationId");
            String projectId = (String) payload.get("projectId");

            if (base64Image == null || base64Image.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Image data is required"));
            }

            // Extract pure base64 if data URI format
            String mimeType = "image/jpeg";
            String rawBase64 = base64Image;
            if (base64Image.startsWith("data:")) {
                int commaIdx = base64Image.indexOf(',');
                if (commaIdx != -1) {
                    String prefix = base64Image.substring(0, commaIdx);
                    rawBase64 = base64Image.substring(commaIdx + 1);
                    if (prefix.contains("image/png")) mimeType = "image/png";
                    else if (prefix.contains("image/webp")) mimeType = "image/webp";
                }
            }

            Map<String, Object> aiResult = geminiVisionService.analyzeConstructionImage(
                    rawBase64, mimeType, selectedCategory, projectName, inspectorNotes
            );

            // Create persistent entity
            AIAnalysis analysis = new AIAnalysis();
            analysis.setId("ai-" + UUID.randomUUID().toString().substring(0, 8));
            analysis.setObservationId(observationId != null ? observationId : "obs-" + UUID.randomUUID().toString().substring(0, 8));
            analysis.setPredictedStage((String) aiResult.getOrDefault("predictedStage", "STAGE_10_UNCLEAR"));
            analysis.setConfidenceLevel((String) aiResult.getOrDefault("confidenceLevel", "MEDIUM"));
            analysis.setConfidenceExplanation((String) aiResult.getOrDefault("confidenceExplanation", ""));
            analysis.setVisibleActivitiesJson(objectMapper.writeValueAsString(aiResult.get("visibleActivities")));
            analysis.setObservableEvidenceJson(objectMapper.writeValueAsString(aiResult.get("observableEvidence")));
            analysis.setVisibleMaterialsJson(objectMapper.writeValueAsString(aiResult.get("visibleMaterials")));
            analysis.setStructuralElementsJson(objectMapper.writeValueAsString(aiResult.get("structuralElements")));
            analysis.setQualityObservationsJson(objectMapper.writeValueAsString(aiResult.get("imageQualityObservations")));
            analysis.setUncertaintyLimitationsJson(objectMapper.writeValueAsString(aiResult.get("uncertaintyAndLimitations")));
            analysis.setCategoryMatch(Boolean.TRUE.equals(aiResult.get("categoryMatch")));
            analysis.setMismatchExplanation((String) aiResult.get("mismatchExplanation"));
            analysis.setRecommendedReviewAction((String) aiResult.get("recommendedReviewAction"));
            analysis.setModelVersion("gemini-3.8-flash (Java Spring Boot REST Client)");

            analysisRepository.save(analysis);

            // If category mismatch, generate alert
            if (!analysis.getCategoryMatch() && projectId != null) {
                Alert alert = new Alert();
                alert.setId("alert-" + UUID.randomUUID().toString().substring(0, 8));
                alert.setProjectId(projectId);
                alert.setObservationId(analysis.getObservationId());
                alert.setAlertType("CATEGORY_MISMATCH");
                alert.setSeverity("HIGH");
                alert.setTitle("Category Disagreement: Claimed " + selectedCategory + " vs Predicted " + analysis.getPredictedStage());
                alert.setDescription(analysis.getMismatchExplanation() != null ? analysis.getMismatchExplanation() : "Vision model contradicted claimed category.");
                alert.setSelectedCategory(selectedCategory);
                alert.setPredictedCategory(analysis.getPredictedStage());
                alertRepository.save(alert);
            }

            return ResponseEntity.ok(analysis);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "AI Analysis Failed: " + e.getMessage()
            ));
        }
    }
}
