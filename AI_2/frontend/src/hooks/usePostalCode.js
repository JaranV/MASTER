import { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE_URL } from '../config';

/**
 * Configuration for the postal code lookup behavior.
 * Centralized to allow easy adjustment of timing and validation rules.
 */
const POSTAL_CODE_CONFIG = {
    REQUIRED_LENGTH: 4,
    DEBOUNCE_DELAY_MS: 300,
    DIGIT_ONLY_PATTERN: /^\d*$/,
};

/**
 * Possible states for the postal code lookup lifecycle.
 * Using explicit states prevents impossible state combinations.
 */
const LookupState = {
    IDLE: 'idle',
    LOADING: 'loading',
    FOUND: 'found',
    NOT_FOUND: 'not_found',
    ERROR: 'error',
};

/**
 * Custom hook for Norwegian postal code lookup with debounced API calls.
 *
 * Features:
 * - Real-time validation (digits only, exactly 4 characters)
 * - Debounced API calls to prevent excessive requests during typing
 * - Automatic city and shipping zone resolution
 * - Cleanup of pending requests on unmount
 *
 * @returns {Object} Postal code state and handlers
 */
export function usePostalCode() {
    const [rawValue, setRawValue] = useState('');
    const [lookupState, setLookupState] = useState(LookupState.IDLE);
    const [result, setResult] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    const debounceTimerRef = useRef(null);
    const abortControllerRef = useRef(null);

    /**
     * Performs the API lookup for a given postal code.
     * Manages abort controller for request cancellation.
     */
    const performLookup = useCallback(async (postalCode) => {
        // Cancel any in-flight request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        setLookupState(LookupState.LOADING);
        setErrorMessage('');

        try {
            const response = await fetch(
                `${API_BASE_URL}/postalcodes/${postalCode}`,
                { signal: controller.signal }
            );

            if (response.ok) {
                const data = await response.json();
                setResult(data);
                setLookupState(LookupState.FOUND);
                setErrorMessage('');
            } else if (response.status === 404) {
                setResult(null);
                setLookupState(LookupState.NOT_FOUND);
                setErrorMessage('Unknown postal code');
            } else {
                throw new Error(`Unexpected response: ${response.status}`);
            }
        } catch (err) {
            if (err.name === 'AbortError') return; // Request was cancelled
            setResult(null);
            setLookupState(LookupState.ERROR);
            setErrorMessage('Failed to look up postal code');
            console.error('Postal code lookup failed:', err);
        }
    }, []);

    /**
     * Handles input changes with validation and debounced lookup.
     */
    const handleChange = useCallback((value) => {
        // Only allow digits
        if (!POSTAL_CODE_CONFIG.DIGIT_ONLY_PATTERN.test(value)) return;
        if (value.length > POSTAL_CODE_CONFIG.REQUIRED_LENGTH) return;

        setRawValue(value);

        // Clear previous debounce timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Reset state if input is incomplete
        if (value.length < POSTAL_CODE_CONFIG.REQUIRED_LENGTH) {
            setLookupState(LookupState.IDLE);
            setResult(null);
            setErrorMessage('');
            return;
        }

        // Debounce the API call
        debounceTimerRef.current = setTimeout(() => {
            performLookup(value);
        }, POSTAL_CODE_CONFIG.DEBOUNCE_DELAY_MS);
    }, [performLookup]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
            if (abortControllerRef.current) abortControllerRef.current.abort();
        };
    }, []);

    return {
        rawValue,
        handleChange,
        isLoading: lookupState === LookupState.LOADING,
        isValid: lookupState === LookupState.FOUND,
        isNotFound: lookupState === LookupState.NOT_FOUND,
        hasError: lookupState === LookupState.ERROR,
        city: result?.city || '',
        zoneName: result?.zoneName || '',
        shippingCost: result?.shippingCost || 0,
        errorMessage,
        lookupState,
    };
}
