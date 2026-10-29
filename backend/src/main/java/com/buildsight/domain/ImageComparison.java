package com.buildsight.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "image_comparisons")
public class ImageComparison {

    @Id
    @Column(length = 50)
    private String id;

    @NotBlank
    @Column(name = "project_id", nullable = false, length = 50)
    private String projectId;

    @NotBlank
    @Column(name = "baseline_observation_id", nullable = false, length = 50)
    private String baselineObservationId;

    @NotBlank
    @Column(name = "target_observation_id", nullable = false, length = 50)
    private String targetObservationId;

    @NotNull
    @Column(name = "elapsed_days", nullable = false)
    private Integer elapsedDays;

    @NotBlank
    @Column(name = "viewpoint_consistency", nullable = false, length = 50)
    private String viewpointConsistency;

    @Column(name = "viewpoint_limitations", columnDefinition = "TEXT")
    private String viewpointLimitations;

    @NotBlank
    @Column(name = "visible_changes_summary", columnDefinition = "TEXT", nullable = false)
    private String visibleChangesSummary;

    @Column(name = "newly_visible_elements_json", columnDefinition = "TEXT")
    private String newlyVisibleElementsJson;

    @Column(name = "structural_progression_notes", columnDefinition = "TEXT")
    private String structuralProgressionNotes;

    @Column(name = "estimated_progress_delta_percent")
    private Integer estimatedProgressDeltaPercent = 0;

    @Column(name = "progress_disclaimer", columnDefinition = "TEXT")
    private String progressDisclaimer;

    @Column(name = "recommended_site_action", columnDefinition = "TEXT")
    private String recommendedSiteAction;

    @Column(name = "compared_at", updatable = false)
    private LocalDateTime comparedAt = LocalDateTime.now();

    public ImageComparison() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }

    public String getBaselineObservationId() { return baselineObservationId; }
    public void setBaselineObservationId(String baselineObservationId) { this.baselineObservationId = baselineObservationId; }

    public String getTargetObservationId() { return targetObservationId; }
    public void setTargetObservationId(String targetObservationId) { this.targetObservationId = targetObservationId; }

    public Integer getElapsedDays() { return elapsedDays; }
    public void setElapsedDays(Integer elapsedDays) { this.elapsedDays = elapsedDays; }

    public String getViewpointConsistency() { return viewpointConsistency; }
    public void setViewpointConsistency(String viewpointConsistency) { this.viewpointConsistency = viewpointConsistency; }

    public String getViewpointLimitations() { return viewpointLimitations; }
    public void setViewpointLimitations(String viewpointLimitations) { this.viewpointLimitations = viewpointLimitations; }

    public String getVisibleChangesSummary() { return visibleChangesSummary; }
    public void setVisibleChangesSummary(String visibleChangesSummary) { this.visibleChangesSummary = visibleChangesSummary; }

    public String getNewlyVisibleElementsJson() { return newlyVisibleElementsJson; }
    public void setNewlyVisibleElementsJson(String newlyVisibleElementsJson) { this.newlyVisibleElementsJson = newlyVisibleElementsJson; }

    public String getStructuralProgressionNotes() { return structuralProgressionNotes; }
    public void setStructuralProgressionNotes(String structuralProgressionNotes) { this.structuralProgressionNotes = structuralProgressionNotes; }

    public Integer getEstimatedProgressDeltaPercent() { return estimatedProgressDeltaPercent; }
    public void setEstimatedProgressDeltaPercent(Integer estimatedProgressDeltaPercent) { this.estimatedProgressDeltaPercent = estimatedProgressDeltaPercent; }

    public String getProgressDisclaimer() { return progressDisclaimer; }
    public void setProgressDisclaimer(String progressDisclaimer) { this.progressDisclaimer = progressDisclaimer; }

    public String getRecommendedSiteAction() { return recommendedSiteAction; }
    public void setRecommendedSiteAction(String recommendedSiteAction) { this.recommendedSiteAction = recommendedSiteAction; }

    public LocalDateTime getComparedAt() { return comparedAt; }
    public void setComparedAt(LocalDateTime comparedAt) { this.comparedAt = comparedAt; }
}
