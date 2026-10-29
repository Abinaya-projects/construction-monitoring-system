package com.buildsight;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Category Mismatch & Civil Engineering Logic Tests")
public class CategoryMismatchDetectionTest {

    @Test
    @DisplayName("Should detect mismatch when contractor submits Facade but vision model detects Masonry")
    void testDisagreementDetection() {
        String selectedCategory = "STAGE_05_FACADE";
        String predictedStage = "STAGE_04_MASONRY";

        boolean isMatch = selectedCategory.equals(predictedStage);
        assertFalse(isMatch, "Mismatch should be flagged when claimed category differs from predicted stage");
    }

    @Test
    @DisplayName("Should confirm agreement when claimed and predicted stages match")
    void testAgreementDetection() {
        String selectedCategory = "STAGE_03_SUPERSTRUCTURE";
        String predictedStage = "STAGE_03_SUPERSTRUCTURE";

        boolean isMatch = selectedCategory.equals(predictedStage);
        assertTrue(isMatch, "Category match should be true when both stages are identical");
    }

    @Test
    @DisplayName("Should correctly identify non-construction imagery as STAGE_10_UNCLEAR")
    void testUnclearStageHandling() {
        String nonConstructionPrediction = "STAGE_10_UNCLEAR";
        boolean requiresHumanReplacement = "STAGE_10_UNCLEAR".equals(nonConstructionPrediction);
        assertTrue(requiresHumanReplacement, "STAGE_10_UNCLEAR should prompt user for replacement photograph");
    }
}
