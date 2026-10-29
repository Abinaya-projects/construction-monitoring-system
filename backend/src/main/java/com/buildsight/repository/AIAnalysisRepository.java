package com.buildsight.repository;

import com.buildsight.domain.AIAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface AIAnalysisRepository extends JpaRepository<AIAnalysis, String> {
    Optional<AIAnalysis> findByObservationId(String observationId);
}
