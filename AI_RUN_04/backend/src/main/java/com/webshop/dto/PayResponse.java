package com.webshop.dto;

public class PayResponse {

    private String url;

    public PayResponse() {}

    public PayResponse(String url) {
        this.url = url;
    }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
}
