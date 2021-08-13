// Copyright (c) 2013 Spotify AB
package com.spotify.lkk.types;

import java.util.List;

public class BoardIdentifier {
    int BoardId;
    List<IdName> CardTypes;
    List<IdName> BoardUsers;
    List<IdName> Lanes;
    List<IdName> ClassesOfService;
    List<IdName> Priorities;

    public int getBoardId() {
        return BoardId;
    }

    public void setBoardId(int boardId) {
        BoardId = boardId;
    }

    public List<IdName> getCardTypes() {
        return CardTypes;
    }

    public void setCardTypes(List<IdName> cardTypes) {
        CardTypes = cardTypes;
    }

    public List<IdName> getBoardUsers() {
        return BoardUsers;
    }

    public void setBoardUsers(List<IdName> boardUsers) {
        BoardUsers = boardUsers;
    }

    public List<IdName> getLanes() {
        return Lanes;
    }

    public void setLanes(List<IdName> lanes) {
        Lanes = lanes;
    }

    public List<IdName> getClassesOfService() {
        return ClassesOfService;
    }

    public void setClassesOfService(List<IdName> classesOfService) {
        ClassesOfService = classesOfService;
    }

    public List<IdName> getPriorities() {
        return Priorities;
    }

    public void setPriorities(List<IdName> priorities) {
        Priorities = priorities;
    }
}
