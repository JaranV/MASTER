package com.web_app.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.regex.Pattern;

/**
 * Validator implementation for Norwegian phone numbers.
 *
 * Accepts the following formats:
 * - 41234567 (8 digits, starts with 4 or 9)
 * - +4741234567 (with country code)
 * - 412 34 567 (with spaces)
 * - 412-34-567 (with hyphens)
 *
 * The validator strips all non-digit characters (except leading +)
 * before applying the pattern match.
 */
public class NorwegianPhoneValidator implements ConstraintValidator<ValidNorwegianPhone, String> {

    private static final Pattern NORWEGIAN_MOBILE_PATTERN = Pattern.compile("^[49]\\d{7}$");
    private static final Pattern COUNTRY_CODE_PATTERN = Pattern.compile("^\\+47[49]\\d{7}$");

    @Override
    public void initialize(ValidNorwegianPhone constraintAnnotation) {
        // No initialization needed
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isBlank()) {
            return false;
        }

        String normalized = normalizePhoneNumber(value);

        if (NORWEGIAN_MOBILE_PATTERN.matcher(normalized).matches()) {
            return true;
        }

        if (COUNTRY_CODE_PATTERN.matcher("+" + normalized).matches()) {
            return true;
        }

        return false;
    }

    /**
     * Strips spaces, hyphens, and parentheses from the phone number.
     * Preserves the leading + for country code detection.
     */
    private String normalizePhoneNumber(String phone) {
        String stripped = phone.replaceAll("[\\s\\-()]", "");
        if (stripped.startsWith("+47")) {
            stripped = stripped.substring(3);
        }
        return stripped;
    }
}
