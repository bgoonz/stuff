// Copyright (c) 2013 Spotify AB
package com.spotify.lkk.types;

public class IdName {
    private int Id;
    private String Name;

    public int getId() {
        return Id;
    }

    public void setId(int id) {
        Id = id;
    }

    public String getName() {
        return Name;
    }

    public void setName(String name) {
        Name = name;
    }

    public String toString() {
        return "IdName [" + Id + ": " + Name + "]";
    }
}
