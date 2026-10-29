package com.buildsight;

import com.buildsight.service.ImageStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Image Storage & Magic Byte Validation Tests")
public class ImageValidationTest {

    private ImageStorageService storageService;

    @BeforeEach
    void setUp() {
        storageService = new ImageStorageService();
    }

    @Test
    @DisplayName("Should successfully validate real JPEG magic byte header")
    void testValidJpegHeader() {
        byte[] jpegHeader = new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01};
        String mime = storageService.validateAndDetectMimeType(jpegHeader);
        assertEquals("image/jpeg", mime);
    }

    @Test
    @DisplayName("Should successfully validate real PNG magic byte header")
    void testValidPngHeader() {
        byte[] pngHeader = new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D};
        String mime = storageService.validateAndDetectMimeType(pngHeader);
        assertEquals("image/png", mime);
    }

    @Test
    @DisplayName("Should reject arbitrary non-image text or corrupt files")
    void testRejectNonImageFile() {
        byte[] fakeTextFile = "Hello World PDF File Document".getBytes();
        assertThrows(IllegalArgumentException.class, () -> {
            storageService.validateAndDetectMimeType(fakeTextFile);
        });
    }

    @Test
    @DisplayName("Should compute reproducible SHA-256 hash for duplicate detection")
    void testSha256Hashing() {
        byte[] testData = "BuildSight_Construction_Image_Binary_Data".getBytes();
        String hash1 = storageService.computeSha256(testData);
        String hash2 = storageService.computeSha256(testData);
        assertNotNull(hash1);
        assertEquals(64, hash1.length());
        assertEquals(hash1, hash2);
    }
}
