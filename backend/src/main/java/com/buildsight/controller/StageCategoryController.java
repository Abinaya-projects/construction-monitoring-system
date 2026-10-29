package com.buildsight.controller;

import com.buildsight.domain.ConstructionStage;
import com.buildsight.repository.ConstructionStageRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/stages")
@CrossOrigin(origins = "*")
public class StageCategoryController {

    private final ConstructionStageRepository stageRepository;

    public StageCategoryController(ConstructionStageRepository stageRepository) {
        this.stageRepository = stageRepository;
    }

    @GetMapping
    public ResponseEntity<List<ConstructionStage>> listStages() {
        return ResponseEntity.ok(stageRepository.findAllByOrderBySequenceOrderAsc());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ConstructionStage> getStage(@PathVariable String id) {
        return stageRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
