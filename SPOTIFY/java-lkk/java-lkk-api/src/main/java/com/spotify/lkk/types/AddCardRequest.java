// Copyright (c) 2013 Spotify AB
package com.spotify.lkk.types;

import java.util.List;

public class AddCardRequest {
    private String Title;
    private String Description;
    private int TypeId;
    private int Priority;
    private int Size;
    private boolean IsBlocked = false;
    private String BlockReason = null;
    private String DueDate;
    private String ExternalSystemName;
    private String ExternalSystemUrl;
    private String Tags;
    private int ClassOfServiceId;
    private String ExternalCardID;
    private List<String> AssignedUserIds;

    public String getTitle() {
        return Title;
    }

    public void setTitle(String title) {
        Title = title;
    }

    public String getDescription() {
        return Description;
    }

    public void setDescription(String description) {
        Description = description;
    }

    public int getTypeId() {
        return TypeId;
    }

    public void setTypeId(int typeId) {
        TypeId = typeId;
    }

    public int getPriority() {
        return Priority;
    }

    public void setPriority(int priority) {
        Priority = priority;
    }

    public int getSize() {
        return Size;
    }

    public void setSize(int size) {
        Size = size;
    }

    public boolean isIsBlocked() {
        return IsBlocked;
    }

    public void setIsBlocked(boolean isBlocked) {
        IsBlocked = isBlocked;
    }

    public String getBlockReason() {
        return BlockReason;
    }

    public void setBlockReason(String blockReason) {
        BlockReason = blockReason;
    }

    public String getDueDate() {
        return DueDate;
    }

    public void setDueDate(String dueDate) {
        DueDate = dueDate;
    }

    public String getExternalSystemName() {
        return ExternalSystemName;
    }

    public void setExternalSystemName(String externalSystemName) {
        ExternalSystemName = externalSystemName;
    }

    public String getExternalSystemUrl() {
        return ExternalSystemUrl;
    }

    public void setExternalSystemUrl(String externalSystemUrl) {
        ExternalSystemUrl = externalSystemUrl;
    }

    public String getTags() {
        return Tags;
    }

    public void setTags(String tags) {
        Tags = tags;
    }

    public int getClassOfServiceId() {
        return ClassOfServiceId;
    }

    public void setClassOfServiceId(int classOfServiceId) {
        ClassOfServiceId = classOfServiceId;
    }

    public String getExternalCardID() {
        return ExternalCardID;
    }

    public void setExternalCardID(String externalCardID) {
        ExternalCardID = externalCardID;
    }

    public List<String> getAssignedUserIds() {
        return AssignedUserIds;
    }

    public void setAssignedUserIds(List<String> assignedUserIds) {
        AssignedUserIds = assignedUserIds;
    }
}
