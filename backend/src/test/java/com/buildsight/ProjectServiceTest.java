package com.buildsight;

import com.buildsight.domain.Project;
import com.buildsight.repository.ProjectRepository;
import com.buildsight.service.ProjectService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@DisplayName("Project Service Business Logic Tests")
public class ProjectServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @InjectMocks
    private ProjectService projectService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    @DisplayName("Should retrieve all projects from repository")
    void testGetAllProjects() {
        Project p1 = new Project("p1", "PRJ-01", "Tower A", "Bengaluru", LocalDate.now());
        when(projectRepository.findAll()).thenReturn(List.of(p1));

        List<Project> result = projectService.getAllProjects();
        assertEquals(1, result.size());
        assertEquals("Tower A", result.get(0).getName());
        verify(projectRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Should retrieve project by unique ID")
    void testGetProjectById() {
        Project p1 = new Project("p1", "PRJ-01", "Tower A", "Bengaluru", LocalDate.now());
        when(projectRepository.findById("p1")).thenReturn(Optional.of(p1));

        Optional<Project> result = projectService.getProjectById("p1");
        assertTrue(result.isPresent());
        assertEquals("PRJ-01", result.get().getProjectCode());
    }

    @Test
    @DisplayName("Should save valid project to database")
    void testSaveProject() {
        Project p1 = new Project("p1", "PRJ-01", "Tower A", "Bengaluru", LocalDate.now());
        when(projectRepository.save(p1)).thenReturn(p1);

        Project saved = projectService.saveProject(p1);
        assertNotNull(saved);
        assertEquals("Tower A", saved.getName());
        verify(projectRepository, times(1)).save(p1);
    }
}
