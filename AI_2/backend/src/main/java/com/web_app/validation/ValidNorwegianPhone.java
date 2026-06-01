package com.web_app.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Custom validation annotation for Norwegian phone numbers.
 * Valid formats:
 * - 8 digits starting with 4 or 9 (mobile)
 * - Optional +47 country code prefix
 * - Spaces and hyphens are stripped before validation
 */
@Documented
@Constraint(validatedBy = NorwegianPhoneValidator.class)
@Target({ ElementType.FIELD, ElementType.PARAMETER })
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidNorwegianPhone {

    String message() default "Invalid Norwegian phone number. Must be 8 digits starting with 4 or 9.";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
