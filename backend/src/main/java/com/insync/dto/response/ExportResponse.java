package com.insync.dto.response;

public class ExportResponse {
    private String downloadUrl;
    private String format;
    private String status;

    public ExportResponse() {}

    public ExportResponse(String downloadUrl, String format, String status) {
        this.downloadUrl = downloadUrl;
        this.format = format;
        this.status = status;
    }

    public String getDownloadUrl() {
        return downloadUrl;
    }

    public void setDownloadUrl(String downloadUrl) {
        this.downloadUrl = downloadUrl;
    }

    public String getFormat() {
        return format;
    }

    public void setFormat(String format) {
        this.format = format;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
} 