package com.buildsight.controller;

import com.buildsight.domain.ImageObservation;
import com.buildsight.repository.ImageObservationRepository;
import com.buildsight.service.ImageStorageService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/observations")
@CrossOrigin(origins = "*")
public class ObservationController {

    private final ImageObservationRepository observationRepository;
    private final ImageStorageService storageService;

    public ObservationController(ImageObservationRepository observationRepository, ImageStorageService storageService) {
        this.observationRepository = observationRepository;
        this.storageService = storageService;
    }

    @GetMapping
    public ResponseEntity<List<ImageObservation>> listObservations(@RequestParam(required = false) String projectId) {
        if (projectId != null && !projectId.isBlank()) {
            return ResponseEntity.ok(observationRepository.findByProjectIdOrderByObservationDateDesc(projectId));
        }
        return ResponseEntity.ok(observationRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ImageObservation> getObservation(@PathVariable String id) {
        return observationRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> saveObservation(@Valid @RequestBody ImageObservation observation) {
        // Duplicate check
        if (observation.getFileSha256() != null && !observation.getFileSha256().isBlank()) {
            Optional<ImageObservation> existing = observationRepository.findByProjectIdAndFileSha256(
                    observation.getProjectId(), observation.getFileSha256()
            );
            if (existing.isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(
                        "Duplicate photograph detected: Image with SHA-256 " + observation.getFileSha256() +
                        " was previously recorded on " + existing.get().getObservationDate()
                );
            }
        }

        if (observation.getId() == null || observation.getId().isBlank()) {
            observation.setId("obs-" + UUID.randomUUID().toString().substring(0, 8));
        }

        ImageObservation saved = observationRepository.save(observation);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
