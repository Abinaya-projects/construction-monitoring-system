package com.buildsight;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Gemini Multimodal Response Parsing Tests")
public class GeminiResponseParsingTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    @DisplayName("Should parse structured Gemini JSON with civil engineering fields")
    void testParseStructuredAiResponse() throws Exception {
        String mockGeminiJson = """
        {
            "predictedStage": "STAGE_03_SUPERSTRUCTURE",
            "confidenceLevel": "HIGH",
            "confidenceExplanation": "Vertical columns and cast floor slabs visible",
            "visibleActivities": ["Slab casting", "Tower crane lifting"],
            "observableEvidence": ["RCC columns", "Formwork propping"],
            "visibleMaterials": ["Reinforced concrete", "Steel rebar"],
            "structuralElements": ["Columns", "Slabs"],
            "categoryMatch": true,
            "recommendedReviewAction": "Verify post-tensioning logs"
        }
        """;

        Map<String, Object> parsed = objectMapper.readValue(mockGeminiJson, Map.class);
        assertNotNull(parsed);
        assertEquals("STAGE_03_SUPERSTRUCTURE", parsed.get("predictedStage"));
        assertEquals("HIGH", parsed.get("confidenceLevel"));
        assertEquals(Boolean.TRUE, parsed.get("categoryMatch"));
    }

    @Test
    @DisplayName("Should detect category disagreement when claimed differs from predicted")
    void testDisagreementFieldInJson() throws Exception {
        String mockMismatchJson = """
        {
            "predictedStage": "STAGE_04_MASONRY",
            "confidenceLevel": "HIGH",
            "categoryMatch": false,
            "mismatchExplanation": "Blockwork in progress; no facade panels erected."
        }
        """;

        JsonNode root = objectMapper.readTree(mockMismatchJson);
        assertFalse(root.get("categoryMatch").asBoolean());
        assertEquals("STAGE_04_MASONRY", root.get("predictedStage").asText());
        assertTrue(root.get("mismatchExplanation").asText().contains("Blockwork"));
    }
}
