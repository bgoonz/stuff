// Copyright (c) 2013 Spotify AB
package com.spotify.lkk.types;

import java.util.List;

public class ReplyData<T> {
    int ReplyCode;
    String ReplyText;
    List<T> ReplyData;

    public int getReplyCode() {
        return ReplyCode;
    }

    public void setReplyCode(int replyCode) {
        ReplyCode = replyCode;
    }

    public String getReplyText() {
        return ReplyText;
    }

    public void setReplyText(String replyText) {
        ReplyText = replyText;
    }

    public List<T> getReplyData() {
        return ReplyData;
    }

    public void setReplyData(List<T> replyData) {
        ReplyData = replyData;
    }
}
