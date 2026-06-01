package com.web_app.shipping;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Service responsible for loading and querying Norway's postal code register.
 *
 * On application startup, loads the Posten postnummerregister CSV file into
 * an in-memory lookup map for fast O(1) postal code resolution.
 *
 * Thread-safe: the internal map is published via an unmodifiable wrapper
 * after construction, ensuring safe concurrent reads without synchronization.
 */
@Service
public class PostalCodeService {

    private static final Logger logger = LoggerFactory.getLogger(PostalCodeService.class);
    private static final String CSV_RESOURCE_PATH = "postnummer.csv";
    private static final String FIELD_DELIMITER = "\t";
    private static final int EXPECTED_FIELD_COUNT = 5;

    private Map<String, PostalCodeEntry> postalCodeRegistry = Collections.emptyMap();

    /**
     * Initializes the postal code registry from the CSV resource file.
     * Called automatically by Spring after dependency injection.
     */
    @PostConstruct
    public void loadPostalCodes() {
        Map<String, PostalCodeEntry> registry = new HashMap<>();

        try {
            ClassPathResource resource = new ClassPathResource(CSV_RESOURCE_PATH);
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {

                String headerLine = reader.readLine(); // skip header
                if (headerLine == null) {
                    logger.warn("Postal code CSV file is empty");
                    return;
                }

                String line;
                int lineNumber = 1;
                while ((line = reader.readLine()) != null) {
                    lineNumber++;
                    try {
                        PostalCodeEntry entry = parseLine(line);
                        registry.put(entry.getPostalCode(), entry);
                    } catch (IllegalArgumentException e) {
                        logger.warn("Skipping malformed line {} in postal code CSV: {}",
                                lineNumber, e.getMessage());
                    }
                }
            }

            logger.info("Loaded {} postal codes from registry", registry.size());
        } catch (Exception e) {
            logger.error("Failed to load postal code registry from {}", CSV_RESOURCE_PATH, e);
        }

        this.postalCodeRegistry = Collections.unmodifiableMap(registry);
    }

    /**
     * Looks up a postal code and returns the full entry if found.
     *
     * @param postalCode the 4-digit postal code string
     * @return Optional containing the entry, or empty if not found
     */
    public Optional<PostalCodeEntry> lookup(String postalCode) {
        if (postalCode == null || !postalCode.matches("^\\d{4}$")) {
            return Optional.empty();
        }
        return Optional.ofNullable(postalCodeRegistry.get(postalCode));
    }

    /**
     * Validates and resolves a postal code into a full lookup result
     * including city name and shipping zone information.
     *
     * @param postalCode the 4-digit postal code to resolve
     * @return PostalCodeLookupResult with validation status and zone info
     */
    public PostalCodeLookupResult resolve(String postalCode) {
        return lookup(postalCode)
                .map(PostalCodeLookupResult::found)
                .orElse(PostalCodeLookupResult.notFound(postalCode));
    }

    /**
     * Returns the total number of postal codes loaded in the registry.
     */
    public int getRegistrySize() {
        return postalCodeRegistry.size();
    }

    private PostalCodeEntry parseLine(String line) {
        String[] fields = line.split(FIELD_DELIMITER);
        if (fields.length < EXPECTED_FIELD_COUNT) {
            throw new IllegalArgumentException(
                    "Expected " + EXPECTED_FIELD_COUNT + " fields, got " + fields.length);
        }
        return new PostalCodeEntry(
                fields[0].trim(),
                fields[1].trim(),
                fields[2].trim(),
                fields[3].trim(),
                fields[4].trim()
        );
    }
}
