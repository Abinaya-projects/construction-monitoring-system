package com.buildsight.repository;

import com.buildsight.domain.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, String> {
    Optional<Project> findByProjectCode(String projectCode);
    List<Project> findByStatusOrderByCreatedAtDesc(String status);
}
