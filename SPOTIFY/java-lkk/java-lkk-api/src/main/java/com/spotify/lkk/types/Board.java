// Copyright (c) 2013 Spotify AB
package com.spotify.lkk.types;

public class Board {
    private int Id;
    private String Title;
    private String Description;
    private boolean IsArchived;
    private String CreationDate;

    public int getId() {
        return Id;
    }

    public void setId(int id) {
        Id = id;
    }

    public String getTitle() {
        return Title;
    }

    public void setTitle(String title) {
        Title = title;
    }

    public boolean isIsArchived() {
        return IsArchived;
    }

    public void setIsArchived(boolean isArchived) {
        IsArchived = isArchived;
    }

    public String getCreationDate() {
        return CreationDate;
    }

    public void setCreationDate(String creationDate) {
        CreationDate = creationDate;
    }
}
