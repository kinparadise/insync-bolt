package com.insync.dto.request;

public class PollResponseRequest {
    private Integer optionIndex;

    public PollResponseRequest() {}

    public PollResponseRequest(Integer optionIndex) {
        this.optionIndex = optionIndex;
    }

    public Integer getOptionIndex() {
        return optionIndex;
    }

    public void setOptionIndex(Integer optionIndex) {
        this.optionIndex = optionIndex;
    }
} 