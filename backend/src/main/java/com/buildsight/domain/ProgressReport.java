package com.buildsight.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "progress_reports")
public class ProgressReport {

    @Id
    @Column(length = 50)
    private String id;

    @NotBlank
    @Column(name = "report_number", unique = true, nullable = false, length = 100)
    private String reportNumber;

    @NotBlank
    @Column(name = "project_id", nullable = false, length = 50)
    private String projectId;

    @NotNull
    @Column(name = "reporting_period_start", nullable = false)
    private LocalDate reportingPeriodStart;

    @NotNull
    @Column(name = "reporting_period_end", nullable = false)
    private LocalDate reportingPeriodEnd;

    @NotNull
    @Column(name = "total_observations_in_period", nullable = false)
    private Integer totalObservationsInPeriod;

    @NotBlank
    @Column(name = "predominant_stage", nullable = false, length = 50)
    private String predominantStage;

    @NotNull
    @Column(name = "estimated_weighted_progress", nullable = false)
    private Integer estimatedWeightedProgress;

    @NotBlank
    @Column(name = "executive_summary", columnDefinition = "TEXT", nullable = false)
    private String executiveSummary;

    @Column(name = "critical_observations_json", columnDefinition = "TEXT")
    private String criticalObservationsJson;

    @Column(name = "category_mismatches_count")
    private Integer categoryMismatchesCount = 0;

    @Column(name = "unresolved_alerts_count")
    private Integer unresolvedAlertsCount = 0;

    @Column(name = "reviewer_notes", columnDefinition = "TEXT")
    private String reviewerNotes;

    @Column(name = "lead_engineer_signature")
    private String leadEngineerSignature;

    @NotBlank
    @Column(name = "compliance_disclaimer", columnDefinition = "TEXT", nullable = false)
    private String complianceDisclaimer;

    @Column(name = "generated_at", updatable = false)
    private LocalDateTime generatedAt = LocalDateTime.now();

    public ProgressReport() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getReportNumber() { return reportNumber; }
    public void setReportNumber(String reportNumber) { this.reportNumber = reportNumber; }

    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }

    public LocalDate getReportingPeriodStart() { return reportingPeriodStart; }
    public void setReportingPeriodStart(LocalDate reportingPeriodStart) { this.reportingPeriodStart = reportingPeriodStart; }

    public LocalDate getReportingPeriodEnd() { return reportingPeriodEnd; }
    public void setReportingPeriodEnd(LocalDate reportingPeriodEnd) { this.reportingPeriodEnd = reportingPeriodEnd; }

    public Integer getTotalObservationsInPeriod() { return totalObservationsInPeriod; }
    public void setTotalObservationsInPeriod(Integer totalObservationsInPeriod) { this.totalObservationsInPeriod = totalObservationsInPeriod; }

    public String getPredominantStage() { return predominantStage; }
    public void setPredominantStage(String predominantStage) { this.predominantStage = predominantStage; }

    public Integer getEstimatedWeightedProgress() { return estimatedWeightedProgress; }
    public void setEstimatedWeightedProgress(Integer estimatedWeightedProgress) { this.estimatedWeightedProgress = estimatedWeightedProgress; }

    public String getExecutiveSummary() { return executiveSummary; }
    public void setExecutiveSummary(String executiveSummary) { this.executiveSummary = executiveSummary; }

    public String getCriticalObservationsJson() { return criticalObservationsJson; }
    public void setCriticalObservationsJson(String criticalObservationsJson) { this.criticalObservationsJson = criticalObservationsJson; }

    public Integer getCategoryMismatchesCount() { return categoryMismatchesCount; }
    public void setCategoryMismatchesCount(Integer categoryMismatchesCount) { this.categoryMismatchesCount = categoryMismatchesCount; }

    public Integer getUnresolvedAlertsCount() { return unresolvedAlertsCount; }
    public void setUnresolvedAlertsCount(Integer unresolvedAlertsCount) { this.unresolvedAlertsCount = unresolvedAlertsCount; }

    public String getReviewerNotes() { return reviewerNotes; }
    public void setReviewerNotes(String reviewerNotes) { this.reviewerNotes = reviewerNotes; }

    public String getLeadEngineerSignature() { return leadEngineerSignature; }
    public void setLeadEngineerSignature(String leadEngineerSignature) { this.leadEngineerSignature = leadEngineerSignature; }

    public String getComplianceDisclaimer() { return complianceDisclaimer; }
    public void setComplianceDisclaimer(String complianceDisclaimer) { this.complianceDisclaimer = complianceDisclaimer; }

    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }
}
