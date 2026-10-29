package com.buildsight.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "image_observations")
public class ImageObservation {

    @Id
    @Column(length = 50)
    private String id;

    @NotBlank
    @Column(name = "project_id", nullable = false, length = 50)
    private String projectId;

    @NotBlank
    @Column(name = "file_name", nullable = false)
    private String fileName;

    @NotBlank
    @Column(name = "file_path", nullable = false, length = 500)
    private String filePath;

    @NotNull
    @Column(name = "file_size_bytes", nullable = false)
    private Long fileSizeBytes;

    @NotBlank
    @Column(name = "mime_type", nullable = false, length = 100)
    private String mimeType;

    @NotBlank
    @Column(name = "file_sha256", nullable = false, length = 64)
    private String fileSha256;

    @NotNull
    @Column(name = "observation_date", nullable = false)
    private LocalDate observationDate;

    @NotBlank
    @Column(name = "inspector_name", nullable = false, length = 150)
    private String inspectorName;

    @Column(name = "location_tag", length = 150)
    private String locationTag;

    @NotBlank
    @Column(name = "selected_category", nullable = false, length = 50)
    private String selectedCategory;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "has_mismatch_alert")
    private Boolean hasMismatchAlert = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public ImageObservation() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public Long getFileSizeBytes() { return fileSizeBytes; }
    public void setFileSizeBytes(Long fileSizeBytes) { this.fileSizeBytes = fileSizeBytes; }

    public String getMimeType() { return mimeType; }
    public void setMimeType(String mimeType) { this.mimeType = mimeType; }

    public String getFileSha256() { return fileSha256; }
    public void setFileSha256(String fileSha256) { this.fileSha256 = fileSha256; }

    public LocalDate getObservationDate() { return observationDate; }
    public void setObservationDate(LocalDate observationDate) { this.observationDate = observationDate; }

    public String getInspectorName() { return inspectorName; }
    public void setInspectorName(String inspectorName) { this.inspectorName = inspectorName; }

    public String getLocationTag() { return locationTag; }
    public void setLocationTag(String locationTag) { this.locationTag = locationTag; }

    public String getSelectedCategory() { return selectedCategory; }
    public void setSelectedCategory(String selectedCategory) { this.selectedCategory = selectedCategory; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Boolean getHasMismatchAlert() { return hasMismatchAlert; }
    public void setHasMismatchAlert(Boolean hasMismatchAlert) { this.hasMismatchAlert = hasMismatchAlert; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
