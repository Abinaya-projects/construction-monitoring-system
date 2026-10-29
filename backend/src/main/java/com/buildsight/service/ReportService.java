package com.buildsight.service;

import com.buildsight.domain.ProgressReport;
import com.buildsight.repository.ProgressReportRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Transactional
public class ReportService {

    private final ProgressReportRepository reportRepository;

    public ReportService(ProgressReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    public ProgressReport generateReport(
            String projectId,
            LocalDate startDate,
            LocalDate endDate,
            int observationsCount,
            String predominantStage,
            int weightedProgress,
            String executiveSummary,
            int mismatchesCount,
            String reviewerNotes,
            String leadEngineerSignature
    ) {
        ProgressReport report = new ProgressReport();
        report.setId("rep-" + UUID.randomUUID().toString().substring(0, 8));
        report.setReportNumber("BS-REP-" + LocalDate.now().getYear() + "-" + (1000 + (int)(Math.random() * 9000)));
        report.setProjectId(projectId);
        report.setReportingPeriodStart(startDate);
        report.setReportingPeriodEnd(endDate);
        report.setTotalObservationsInPeriod(observationsCount);
        report.setPredominantStage(predominantStage);
        report.setEstimatedWeightedProgress(weightedProgress);
        report.setExecutiveSummary(executiveSummary);
        report.setCategoryMismatchesCount(mismatchesCount);
        report.setUnresolvedAlertsCount(mismatchesCount);
        report.setReviewerNotes(reviewerNotes);
        report.setLeadEngineerSignature(leadEngineerSignature);
        report.setComplianceDisclaimer("Computer vision observations represent visual outer surface assessments. Mandatory quality verification requires laboratory cube compression tests (IS 516), non-destructive testing (NDT), and authorized surveyor level checks.");
        report.setGeneratedAt(LocalDateTime.now());

        return reportRepository.save(report);
    }
}
