// Copyright (c) 2013 Spotify AB
package com.spotify.lkk.http;

/**
 * An exception that is raised when a remote request results with an error indicated on the transport.
 *
 * HTTP status code in a family of 4xx or 5xx.
 * Error indicated by the body of the request.
 *
 * @author udoprog
 */
public class HttpDriverRemoteException extends HttpDriverException {
    final int code;
    final String reason;

    public HttpDriverRemoteException(int code, String reason) {
        this.code = code;
        this.reason = reason;
    }

    public int getCode() {
        return code;
    }

    public String getReason() {
        return reason;
    }

    @Override
    public String toString() {
        return "HttpDriverRemoteException [" + code + ": " + reason + "]";
    }
}
