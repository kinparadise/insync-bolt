package com.insync.dto.request;

public class HostSettingsRequest {
    private boolean muteAll;
    private boolean waitingRoom;
    private boolean recording;
    private boolean hostMuted;
    private boolean hostVideoOff;

    public HostSettingsRequest() {}

    public HostSettingsRequest(boolean muteAll, boolean waitingRoom, boolean recording, 
                             boolean hostMuted, boolean hostVideoOff) {
        this.muteAll = muteAll;
        this.waitingRoom = waitingRoom;
        this.recording = recording;
        this.hostMuted = hostMuted;
        this.hostVideoOff = hostVideoOff;
    }

    public boolean isMuteAll() {
        return muteAll;
    }

    public void setMuteAll(boolean muteAll) {
        this.muteAll = muteAll;
    }

    public boolean isWaitingRoom() {
        return waitingRoom;
    }

    public void setWaitingRoom(boolean waitingRoom) {
        this.waitingRoom = waitingRoom;
    }

    public boolean isRecording() {
        return recording;
    }

    public void setRecording(boolean recording) {
        this.recording = recording;
    }

    public boolean isHostMuted() {
        return hostMuted;
    }

    public void setHostMuted(boolean hostMuted) {
        this.hostMuted = hostMuted;
    }

    public boolean isHostVideoOff() {
        return hostVideoOff;
    }

    public void setHostVideoOff(boolean hostVideoOff) {
        this.hostVideoOff = hostVideoOff;
    }
} 