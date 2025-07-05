package com.insync.dto.request;

public class CallStateUpdateRequest {
    private Long participantId;
    private Boolean isMuted;
    private Boolean isVideoOn;
    private Boolean isHandRaised;
    private Boolean isScreenSharing;

    public CallStateUpdateRequest() {}

    public CallStateUpdateRequest(Long participantId, Boolean isMuted, Boolean isVideoOn, 
                                Boolean isHandRaised, Boolean isScreenSharing) {
        this.participantId = participantId;
        this.isMuted = isMuted;
        this.isVideoOn = isVideoOn;
        this.isHandRaised = isHandRaised;
        this.isScreenSharing = isScreenSharing;
    }

    public Long getParticipantId() {
        return participantId;
    }

    public void setParticipantId(Long participantId) {
        this.participantId = participantId;
    }

    public Boolean getIsMuted() {
        return isMuted;
    }

    public void setIsMuted(Boolean isMuted) {
        this.isMuted = isMuted;
    }

    public Boolean getIsVideoOn() {
        return isVideoOn;
    }

    public void setIsVideoOn(Boolean isVideoOn) {
        this.isVideoOn = isVideoOn;
    }

    public Boolean getIsHandRaised() {
        return isHandRaised;
    }

    public void setIsHandRaised(Boolean isHandRaised) {
        this.isHandRaised = isHandRaised;
    }

    public Boolean getIsScreenSharing() {
        return isScreenSharing;
    }

    public void setIsScreenSharing(Boolean isScreenSharing) {
        this.isScreenSharing = isScreenSharing;
    }
} 