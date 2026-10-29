package com.buildsight.controller;

import com.buildsight.domain.ProgressReport;
import com.buildsight.repository.ProgressReportRepository;
import com.buildsight.service.ReportService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    private final ProgressReportRepository reportRepository;
    private final ReportService reportService;

    public ReportController(ProgressReportRepository reportRepository, ReportService reportService) {
        this.reportRepository = reportRepository;
        this.reportService = reportService;
    }

    @GetMapping
    public ResponseEntity<List<ProgressReport>> listReports(@RequestParam(required = false) String projectId) {
        if (projectId != null && !projectId.isBlank()) {
            return ResponseEntity.ok(reportRepository.findByProjectIdOrderByGeneratedAtDesc(projectId));
        }
        return ResponseEntity.ok(reportRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<ProgressReport> createReport(@RequestBody Map<String, Object> payload) {
        String projectId = (String) payload.get("projectId");
        LocalDate start = LocalDate.parse((String) payload.get("reportingPeriodStart"));
        LocalDate end = LocalDate.parse((String) payload.get("reportingPeriodEnd"));
        int observationsCount = ((Number) payload.getOrDefault("totalObservationsInPeriod", 0)).intValue();
        String predominantStage = (String) payload.getOrDefault("predominantStage", "STAGE_03_SUPERSTRUCTURE");
        int progress = ((Number) payload.getOrDefault("estimatedWeightedProgress", 0)).intValue();
        String summary = (String) payload.getOrDefault("executiveSummary", "Progress monitoring report.");
        int mismatches = ((Number) payload.getOrDefault("categoryMismatchesCount", 0)).intValue();
        String notes = (String) payload.getOrDefault("reviewerNotes", "");
        String signature = (String) payload.getOrDefault("leadEngineerSignature", "Chartered Civil Engineer");

        ProgressReport report = reportService.generateReport(
                projectId, start, end, observationsCount, predominantStage, progress, summary, mismatches, notes, signature
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(report);
    }
}
