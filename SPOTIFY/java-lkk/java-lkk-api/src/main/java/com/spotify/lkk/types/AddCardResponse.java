// Copyright (c) 2013 Spotify AB
package com.spotify.lkk.types;

public class AddCardResponse {
    private int BoardVersion;
    private String Lane;
    private int CardId;

    public int getBoardVersion() {
        return BoardVersion;
    }

    public void setBoardVersion(int boardVersion) {
        BoardVersion = boardVersion;
    }

    public String getLane() {
        return Lane;
    }

    public void setLane(String lane) {
        Lane = lane;
    }

    public int getCardId() {
        return CardId;
    }

    public void setCardId(int cardId) {
        CardId = cardId;
    }
}
