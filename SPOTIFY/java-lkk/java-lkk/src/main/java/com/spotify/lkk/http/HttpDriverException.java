// Copyright (c) 2013 Spotify AB
package com.spotify.lkk.http;

public class HttpDriverException extends Exception {
    public HttpDriverException() {
        super();
    }

    public HttpDriverException(String message, Throwable cause) {
        super(message, cause);
    }

    public HttpDriverException(String message) {
        super(message);
    }

    public HttpDriverException(Throwable cause) {
        super(cause);
    }
}
