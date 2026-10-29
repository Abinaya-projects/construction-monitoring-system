package com.buildsight.repository;

import com.buildsight.domain.ImageObservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ImageObservationRepository extends JpaRepository<ImageObservation, String> {
    List<ImageObservation> findByProjectIdOrderByObservationDateDesc(String projectId);
    Optional<ImageObservation> findByProjectIdAndFileSha256(String projectId, String fileSha256);
    List<ImageObservation> findByProjectIdAndObservationDateBetweenOrderByObservationDateAsc(
        String projectId, LocalDate startDate, LocalDate endDate
    );
    long countByProjectId(String projectId);
}
