import React from 'react';

/**
 * Specialized input component for Norwegian postal codes.
 * Displays real-time lookup results including city name and shipping zone.
 *
 * Visual states:
 * - Idle: neutral input (fewer than 4 digits entered)
 * - Loading: spinner indicator during API lookup
 * - Found: green success with city name and shipping cost
 * - Not Found: red error with message
 * - Error: red error for network/server failures
 *
 * @param {Object} props
 * @param {string} props.value - Current postal code value
 * @param {Function} props.onChange - Change handler (receives raw string)
 * @param {boolean} props.isLoading - Whether a lookup is in progress
 * @param {boolean} props.isValid - Whether the postal code was found
 * @param {boolean} props.isNotFound - Whether the postal code was not found
 * @param {string} props.city - Resolved city name
 * @param {string} props.zoneName - Shipping zone name
 * @param {number} props.shippingCost - Shipping cost in NOK
 * @param {string} props.errorMessage - Error message to display
 */
function PostalCodeInput({
    value,
    onChange,
    isLoading,
    isValid,
    isNotFound,
    city,
    zoneName,
    shippingCost,
    errorMessage
}) {
    const getInputClassName = () => {
        if (isValid) return 'postal-input postal-input--valid';
        if (isNotFound || errorMessage) return 'postal-input postal-input--invalid';
        return 'postal-input';
    };

    const getStatusIndicator = () => {
        if (isLoading) return <span className="postal-status postal-status--loading">⟳</span>;
        if (isValid) return <span className="postal-status postal-status--valid">✓</span>;
        if (isNotFound) return <span className="postal-status postal-status--invalid">✗</span>;
        return null;
    };

    return (
        <div className="postal-code-wrapper">
            <label htmlFor="postal-code-input">Postal Code</label>
            <div className="postal-input-container">
                <input
                    id="postal-code-input"
                    type="text"
                    inputMode="numeric"
                    className={getInputClassName()}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="0001"
                    maxLength={4}
                    required
                    aria-describedby="postal-code-info"
                    aria-invalid={isNotFound || !!errorMessage}
                />
                {getStatusIndicator()}
            </div>

            {isValid && (
                <div id="postal-code-info" className="postal-result">
                    <p className="postal-city">{city}</p>
                    <p className="postal-shipping">
                        Zone: {zoneName} — Shipping: {shippingCost} kr
                    </p>
                </div>
            )}

            {errorMessage && (
                <p id="postal-code-info" className="postal-error-message" role="alert">
                    {errorMessage}
                </p>
            )}
        </div>
    );
}

export default PostalCodeInput;
