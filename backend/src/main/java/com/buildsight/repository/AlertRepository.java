package com.buildsight.repository;

import com.buildsight.domain.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, String> {
    List<Alert> findByProjectIdOrderByCreatedAtDesc(String projectId);
    List<Alert> findByStatusOrderByCreatedAtDesc(String status);
    long countByStatus(String status);
}
