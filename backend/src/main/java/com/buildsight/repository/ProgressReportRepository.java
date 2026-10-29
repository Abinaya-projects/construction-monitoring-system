package com.buildsight.repository;

import com.buildsight.domain.ProgressReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProgressReportRepository extends JpaRepository<ProgressReport, String> {
    List<ProgressReport> findByProjectIdOrderByGeneratedAtDesc(String projectId);
    Optional<ProgressReport> findByReportNumber(String reportNumber);
}
