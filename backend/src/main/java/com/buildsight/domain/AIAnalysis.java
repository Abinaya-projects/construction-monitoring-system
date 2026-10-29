package com.buildsight.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_analyses")
public class AIAnalysis {

    @Id
    @Column(length = 50)
    private String id;

    @NotBlank
    @Column(name = "observation_id", unique = true, nullable = false, length = 50)
    private String observationId;

    @NotBlank
    @Column(name = "predicted_stage", nullable = false, length = 50)
    private String predictedStage;

    @NotBlank
    @Column(name = "confidence_level", nullable = false, length = 20)
    private String confidenceLevel;

    @Column(name = "confidence_explanation", columnDefinition = "TEXT")
    private String confidenceExplanation;

    @Column(name = "visible_activities_json", columnDefinition = "TEXT")
    private String visibleActivitiesJson;

    @Column(name = "observable_evidence_json", columnDefinition = "TEXT")
    private String observableEvidenceJson;

    @Column(name = "visible_materials_json", columnDefinition = "TEXT")
    private String visibleMaterialsJson;

    @Column(name = "structural_elements_json", columnDefinition = "TEXT")
    private String structuralElementsJson;

    @Column(name = "finishing_works_json", columnDefinition = "TEXT")
    private String finishingWorksJson;

    @Column(name = "quality_observations_json", columnDefinition = "TEXT")
    private String qualityObservationsJson;

    @Column(name = "uncertainty_limitations_json", columnDefinition = "TEXT")
    private String uncertaintyLimitationsJson;

    @NotNull
    @Column(name = "category_match", nullable = false)
    private Boolean categoryMatch;

    @Column(name = "mismatch_explanation", columnDefinition = "TEXT")
    private String mismatchExplanation;

    @Column(name = "recommended_review_action", columnDefinition = "TEXT")
    private String recommendedReviewAction;

    @Column(name = "analyzed_at", updatable = false)
    private LocalDateTime analyzedAt = LocalDateTime.now();

    @NotBlank
    @Column(name = "model_version", nullable = false, length = 100)
    private String modelVersion;

    @Column(name = "is_human_verified")
    private Boolean isHumanVerified = false;

    @Column(name = "verified_by", length = 150)
    private String verifiedBy;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "verification_notes", columnDefinition = "TEXT")
    private String verificationNotes;

    public AIAnalysis() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getObservationId() { return observationId; }
    public void setObservationId(String observationId) { this.observationId = observationId; }

    public String getPredictedStage() { return predictedStage; }
    public void setPredictedStage(String predictedStage) { this.predictedStage = predictedStage; }

    public String getConfidenceLevel() { return confidenceLevel; }
    public void setConfidenceLevel(String confidenceLevel) { this.confidenceLevel = confidenceLevel; }

    public String getConfidenceExplanation() { return confidenceExplanation; }
    public void setConfidenceExplanation(String confidenceExplanation) { this.confidenceExplanation = confidenceExplanation; }

    public String getVisibleActivitiesJson() { return visibleActivitiesJson; }
    public void setVisibleActivitiesJson(String visibleActivitiesJson) { this.visibleActivitiesJson = visibleActivitiesJson; }

    public String getObservableEvidenceJson() { return observableEvidenceJson; }
    public void setObservableEvidenceJson(String observableEvidenceJson) { this.observableEvidenceJson = observableEvidenceJson; }

    public String getVisibleMaterialsJson() { return visibleMaterialsJson; }
    public void setVisibleMaterialsJson(String visibleMaterialsJson) { this.visibleMaterialsJson = visibleMaterialsJson; }

    public String getStructuralElementsJson() { return structuralElementsJson; }
    public void setStructuralElementsJson(String structuralElementsJson) { this.structuralElementsJson = structuralElementsJson; }

    public String getFinishingWorksJson() { return finishingWorksJson; }
    public void setFinishingWorksJson(String finishingWorksJson) { this.finishingWorksJson = finishingWorksJson; }

    public String getQualityObservationsJson() { return qualityObservationsJson; }
    public void setQualityObservationsJson(String qualityObservationsJson) { this.qualityObservationsJson = qualityObservationsJson; }

    public String getUncertaintyLimitationsJson() { return uncertaintyLimitationsJson; }
    public void setUncertaintyLimitationsJson(String uncertaintyLimitationsJson) { this.uncertaintyLimitationsJson = uncertaintyLimitationsJson; }

    public Boolean getCategoryMatch() { return categoryMatch; }
    public void setCategoryMatch(Boolean categoryMatch) { this.categoryMatch = categoryMatch; }

    public String getMismatchExplanation() { return mismatchExplanation; }
    public void setMismatchExplanation(String mismatchExplanation) { this.mismatchExplanation = mismatchExplanation; }

    public String getRecommendedReviewAction() { return recommendedReviewAction; }
    public void setRecommendedReviewAction(String recommendedReviewAction) { this.recommendedReviewAction = recommendedReviewAction; }

    public LocalDateTime getAnalyzedAt() { return analyzedAt; }
    public void setAnalyzedAt(LocalDateTime analyzedAt) { this.analyzedAt = analyzedAt; }

    public String getModelVersion() { return modelVersion; }
    public void setModelVersion(String modelVersion) { this.modelVersion = modelVersion; }

    public Boolean getIsHumanVerified() { return isHumanVerified; }
    public void setIsHumanVerified(Boolean isHumanVerified) { this.isHumanVerified = isHumanVerified; }

    public String getVerifiedBy() { return verifiedBy; }
    public void setVerifiedBy(String verifiedBy) { this.verifiedBy = verifiedBy; }

    public LocalDateTime getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; }

    public String getVerificationNotes() { return verificationNotes; }
    public void setVerificationNotes(String verificationNotes) { this.verificationNotes = verificationNotes; }
}
