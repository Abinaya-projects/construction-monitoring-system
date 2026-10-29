package com.buildsight.repository;

import com.buildsight.domain.ConstructionStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ConstructionStageRepository extends JpaRepository<ConstructionStage, String> {
    Optional<ConstructionStage> findByCode(String code);
    List<ConstructionStage> findAllByOrderBySequenceOrderAsc();
}
