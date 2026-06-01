import { useState, useCallback } from 'react';

const NORWEGIAN_MOBILE_REGEX = /^[49]\d{7}$/;
const COUNTRY_CODE_PREFIX = '+47';

/**
 * Custom hook for Norwegian phone number validation.
 * Handles normalization, validation, and formatting.
 *
 * @returns {Object} Phone validation state and handlers
 */
export function usePhoneValidation() {
    const [rawValue, setRawValue] = useState('');
    const [isValid, setIsValid] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    /**
     * Normalizes a phone number by stripping spaces, hyphens,
     * and the +47 country code prefix.
     */
    const normalize = useCallback((value) => {
        let stripped = value.replace(/[\s\-()]/g, '');
        if (stripped.startsWith(COUNTRY_CODE_PREFIX)) {
            stripped = stripped.substring(COUNTRY_CODE_PREFIX.length);
        } else if (stripped.startsWith('47') && stripped.length === 10) {
            stripped = stripped.substring(2);
        }
        return stripped;
    }, []);

    /**
     * Validates the phone number and updates state.
     */
    const validate = useCallback((value) => {
        if (!value || value.trim() === '') {
            setIsValid(null);
            setErrorMessage('');
            return false;
        }

        const normalized = normalize(value);

        if (normalized.length < 8) {
            setIsValid(false);
            setErrorMessage(`${8 - normalized.length} more digit${8 - normalized.length !== 1 ? 's' : ''} needed`);
            return false;
        }

        if (normalized.length > 8) {
            setIsValid(false);
            setErrorMessage('Too many digits');
            return false;
        }

        if (!NORWEGIAN_MOBILE_REGEX.test(normalized)) {
            setIsValid(false);
            setErrorMessage('Must start with 4 or 9 (Norwegian mobile)');
            return false;
        }

        setIsValid(true);
        setErrorMessage('');
        return true;
    }, [normalize]);

    /**
     * Formats a valid Norwegian phone number for display.
     * e.g., 41234567 → 412 34 567
     */
    const formatForDisplay = useCallback((value) => {
        const normalized = normalize(value);
        if (normalized.length === 8) {
            return `${normalized.slice(0, 3)} ${normalized.slice(3, 5)} ${normalized.slice(5)}`;
        }
        return value;
    }, [normalize]);

    const handleChange = useCallback((value) => {
        setRawValue(value);
        validate(value);
    }, [validate]);

    return {
        rawValue,
        isValid,
        errorMessage,
        handleChange,
        normalize,
        formatForDisplay,
        getNormalizedValue: () => normalize(rawValue),
    };
}
