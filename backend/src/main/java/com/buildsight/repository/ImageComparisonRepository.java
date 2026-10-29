package com.buildsight.repository;

import com.buildsight.domain.ImageComparison;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ImageComparisonRepository extends JpaRepository<ImageComparison, String> {
    List<ImageComparison> findByProjectIdOrderByComparedAtDesc(String projectId);
}
