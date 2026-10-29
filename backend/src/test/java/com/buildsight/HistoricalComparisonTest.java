package com.buildsight;

import com.buildsight.domain.ImageComparison;
import com.buildsight.domain.ImageObservation;
import com.buildsight.repository.ImageComparisonRepository;
import com.buildsight.service.HistoricalComparisonService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@DisplayName("Historical Image Comparison Service Tests")
public class HistoricalComparisonTest {

    @Mock
    private ImageComparisonRepository comparisonRepository;

    @InjectMocks
    private HistoricalComparisonService comparisonService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    @DisplayName("Should correctly compute elapsed days between two chronological observations")
    void testElapsedDaysCalculation() {
        ImageObservation baseline = new ImageObservation();
        baseline.setId("obs-1");
        baseline.setProjectId("proj-1");
        baseline.setObservationDate(LocalDate.of(2025, 6, 1));

        ImageObservation target = new ImageObservation();
        target.setId("obs-2");
        target.setProjectId("proj-1");
        target.setObservationDate(LocalDate.of(2025, 6, 21));

        when(comparisonRepository.save(any(ImageComparison.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ImageComparison comparison = comparisonService.recordComparison(
                baseline,
                target,
                "HIGH",
                "",
                "Columns cast and cured",
                "[\"Column C4\"]",
                "Stage 3 progressing",
                12,
                "Audit rebar logs"
        );

        assertNotNull(comparison);
        assertEquals(20, comparison.getElapsedDays());
        assertEquals("HIGH", comparison.getViewpointConsistency());
        assertEquals(12, comparison.getEstimatedProgressDeltaPercent());
        assertNotNull(comparison.getProgressDisclaimer());
    }
}
