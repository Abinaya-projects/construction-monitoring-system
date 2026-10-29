package com.buildsight.service;

import com.buildsight.domain.ImageComparison;
import com.buildsight.domain.ImageObservation;
import com.buildsight.repository.ImageComparisonRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@Transactional
public class HistoricalComparisonService {

    private final ImageComparisonRepository comparisonRepository;

    public HistoricalComparisonService(ImageComparisonRepository comparisonRepository) {
        this.comparisonRepository = comparisonRepository;
    }

    public ImageComparison recordComparison(
            ImageObservation baseline,
            ImageObservation target,
            String viewpointConsistency,
            String viewpointLimitations,
            String visibleChangesSummary,
            String newlyVisibleElementsJson,
            String structuralNotes,
            int progressDelta,
            String recommendedAction
    ) {
        long daysBetween = ChronoUnit.DAYS.between(baseline.getObservationDate(), target.getObservationDate());
        if (daysBetween < 0) {
            daysBetween = Math.abs(daysBetween);
        }

        ImageComparison comparison = new ImageComparison();
        comparison.setId("cmp-" + UUID.randomUUID().toString().substring(0, 8));
        comparison.setProjectId(baseline.getProjectId());
        comparison.setBaselineObservationId(baseline.getId());
        comparison.setTargetObservationId(target.getId());
        comparison.setElapsedDays((int) daysBetween);
        comparison.setViewpointConsistency(viewpointConsistency);
        comparison.setViewpointLimitations(viewpointLimitations);
        comparison.setVisibleChangesSummary(visibleChangesSummary);
        comparison.setNewlyVisibleElementsJson(newlyVisibleElementsJson);
        comparison.setStructuralProgressionNotes(structuralNotes);
        comparison.setEstimatedProgressDeltaPercent(progressDelta);
        comparison.setProgressDisclaimer("Estimated milestone advancement based on weighted work breakdown schedule. Visual inspection does not certify hidden structural completion.");
        comparison.setRecommendedSiteAction(recommendedAction);

        return comparisonRepository.save(comparison);
    }
}
