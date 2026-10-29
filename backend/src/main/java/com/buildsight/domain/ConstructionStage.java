package com.buildsight.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "construction_stages")
public class ConstructionStage {

    @Id
    @Column(length = 50)
    private String id;

    @NotBlank
    @Column(unique = true, nullable = false, length = 20)
    private String code;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @NotNull
    @Column(name = "default_milestone_weight", nullable = false)
    private Integer defaultMilestoneWeight;

    @NotNull
    @Column(name = "sequence_order", nullable = false)
    private Integer sequenceOrder;

    public ConstructionStage() {}

    public ConstructionStage(String id, String code, String name, String description, Integer defaultMilestoneWeight, Integer sequenceOrder) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.description = description;
        this.defaultMilestoneWeight = defaultMilestoneWeight;
        this.sequenceOrder = sequenceOrder;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getDefaultMilestoneWeight() { return defaultMilestoneWeight; }
    public void setDefaultMilestoneWeight(Integer defaultMilestoneWeight) { this.defaultMilestoneWeight = defaultMilestoneWeight; }

    public Integer getSequenceOrder() { return sequenceOrder; }
    public void setSequenceOrder(Integer sequenceOrder) { this.sequenceOrder = sequenceOrder; }
}
