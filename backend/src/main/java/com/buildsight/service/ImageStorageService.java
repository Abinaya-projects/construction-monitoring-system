package com.buildsight.service;

import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

/**
 * Image storage and validation service.
 * Performs real magic byte header validation (JPEG, PNG, WebP) and SHA-256 fingerprinting.
 */
@Service
public class ImageStorageService {

    public String validateAndDetectMimeType(byte[] fileBytes) {
        if (fileBytes == null || fileBytes.length < 12) {
            throw new IllegalArgumentException("File is empty or corrupted (insufficient byte length).");
        }

        // JPEG: FF D8 FF
        if ((fileBytes[0] & 0xFF) == 0xFF && (fileBytes[1] & 0xFF) == 0xD8 && (fileBytes[2] & 0xFF) == 0xFF) {
            return "image/jpeg";
        }

        // PNG: 89 50 4E 47 0D 0A 1A 0A
        if ((fileBytes[0] & 0xFF) == 0x89 && (fileBytes[1] & 0xFF) == 0x50 &&
            (fileBytes[2] & 0xFF) == 0x4E && (fileBytes[3] & 0xFF) == 0x47) {
            return "image/png";
        }

        // WebP: RIFF .... WEBP
        if (fileBytes[0] == 'R' && fileBytes[1] == 'I' && fileBytes[2] == 'F' && fileBytes[3] == 'F' &&
            fileBytes[8] == 'W' && fileBytes[9] == 'E' && fileBytes[10] == 'B' && fileBytes[11] == 'P') {
            return "image/webp";
        }

        throw new IllegalArgumentException("Unsupported file type. Only authentic JPEG, PNG, and WebP construction photographs are permitted.");
    }

    public String computeSha256(byte[] data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data);
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available in Java runtime", e);
        }
    }
}
