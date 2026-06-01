import React from 'react';

/**
 * A specialized phone input component for Norwegian phone numbers.
 * Displays real-time validation feedback with visual indicators.
 *
 * @param {Object} props
 * @param {string} props.value - Current phone number value
 * @param {Function} props.onChange - Change handler
 * @param {boolean|null} props.isValid - Validation state (null = not yet validated)
 * @param {string} props.errorMessage - Validation error message
 */
function PhoneInput({ value, onChange, isValid, errorMessage }) {
    const getInputClassName = () => {
        if (isValid === null) return 'phone-input';
        return isValid ? 'phone-input phone-input--valid' : 'phone-input phone-input--invalid';
    };

    const getStatusIcon = () => {
        if (isValid === null) return null;
        return isValid ? '✓' : '✗';
    };

    return (
        <div className="phone-input-wrapper">
            <label htmlFor="phone-input">Phone</label>
            <div className="phone-input-container">
                <span className="phone-country-code">+47</span>
                <input
                    id="phone-input"
                    type="tel"
                    className={getInputClassName()}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="412 34 567"
                    maxLength={12}
                    required
                    aria-describedby={errorMessage ? 'phone-error' : undefined}
                    aria-invalid={isValid === false}
                />
                {isValid !== null && (
                    <span className={`phone-status ${isValid ? 'phone-status--valid' : 'phone-status--invalid'}`}>
                        {getStatusIcon()}
                    </span>
                )}
            </div>
            {errorMessage && (
                <p id="phone-error" className="phone-error-message" role="alert">
                    {errorMessage}
                </p>
            )}
        </div>
    );
}

export default PhoneInput;
