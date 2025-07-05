package com.insync.dto.request;

public class ExportRequest {
    private String format;

    public ExportRequest() {}

    public ExportRequest(String format) {
        this.format = format;
    }

    public String getFormat() {
        return format;
    }

    public void setFormat(String format) {
        this.format = format;
    }
} 