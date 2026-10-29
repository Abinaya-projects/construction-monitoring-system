package com.buildsight;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * BuildSight AI — Construction Progress Intelligence System
 * Academic Project: "UTILIZATION OF IMAGES FOR MONITORING OF PROGRESS OF
 * CONSTRUCTION ACTIVITIES FOR BUILDING CONSTRUCTION PROJECTS"
 *
 * Main Spring Boot Application Entry Point.
 */
@SpringBootApplication
@EnableAsync
public class BuildSightApplication {

    public static void main(String[] args) {
        SpringApplication.run(BuildSightApplication.class, args);
    }
}
