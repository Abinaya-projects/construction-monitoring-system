package com.buildsight.controller;

import com.buildsight.domain.Alert;
import com.buildsight.repository.AlertRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/alerts")
@CrossOrigin(origins = "*")
public class AlertController {

    private final AlertRepository alertRepository;

    public AlertController(AlertRepository alertRepository) {
        this.alertRepository = alertRepository;
    }

    @GetMapping
    public ResponseEntity<List<Alert>> listAlerts(@RequestParam(required = false) String projectId) {
        if (projectId != null && !projectId.isBlank()) {
            return ResponseEntity.ok(alertRepository.findByProjectIdOrderByCreatedAtDesc(projectId));
        }
        return ResponseEntity.ok(alertRepository.findAll());
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<Alert> resolveAlert(
            @PathVariable String id,
            @RequestBody Map<String, String> resolutionPayload
    ) {
        return alertRepository.findById(id)
                .map(alert -> {
                    alert.setStatus(resolutionPayload.getOrDefault("status", "CONFIRMED_BY_ENGINEER"));
                    alert.setResolvedBy(resolutionPayload.getOrDefault("resolvedBy", "Supervising Civil Engineer"));
                    alert.setResolutionNotes(resolutionPayload.getOrDefault("resolutionNotes", "Resolution recorded."));
                    alert.setResolvedAt(LocalDateTime.now());
                    return ResponseEntity.ok(alertRepository.save(alert));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
