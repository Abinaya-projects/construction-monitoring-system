package com.buildsight.controller;

import com.buildsight.domain.ImageComparison;
import com.buildsight.repository.ImageComparisonRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/comparisons")
@CrossOrigin(origins = "*")
public class ImageComparisonController {

    private final ImageComparisonRepository comparisonRepository;

    public ImageComparisonController(ImageComparisonRepository comparisonRepository) {
        this.comparisonRepository = comparisonRepository;
    }

    @GetMapping
    public ResponseEntity<List<ImageComparison>> listComparisons(@RequestParam(required = false) String projectId) {
        if (projectId != null && !projectId.isBlank()) {
            return ResponseEntity.ok(comparisonRepository.findByProjectIdOrderByComparedAtDesc(projectId));
        }
        return ResponseEntity.ok(comparisonRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ImageComparison> getComparison(@PathVariable String id) {
        return comparisonRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
