// Copyright (c) 2013 Spotify AB
package com.spotify.lkk.types;

import java.util.List;

public class Card {
    private String type;
    private String title;
    private String externalCardId;
    private String field;
    private String description;
    private String externalSystemName;
    private String externalSystemUrl;
    private int priority;
    private int size;
    private List<String> tags;

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getExternalCardId() {
        return externalCardId;
    }

    public void setExternalCardId(String externalCardId) {
        this.externalCardId = externalCardId;
    }

    public String getField() {
        return field;
    }

    public void setField(String field) {
        this.field = field;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getExternalSystemName() {
        return externalSystemName;
    }

    public void setExternalSystemName(String externalSystemName) {
        this.externalSystemName = externalSystemName;
    }

    public String getExternalSystemUrl() {
        return externalSystemUrl;
    }

    public void setExternalSystemUrl(String externalSystemUrl) {
        this.externalSystemUrl = externalSystemUrl;
    }

    public int getPriority() {
        return priority;
    }

    public void setPriority(int priority) {
        this.priority = priority;
    }

    public int getSize() {
        return size;
    }

    public void setSize(int size) {
        this.size = size;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }
}
