package com.webshop.exception;

public class ApiException extends RuntimeException {
    public ApiException(String message) {
        super(message);
    }
}
