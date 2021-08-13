// Copyright (c) 2013 Spotify AB
package com.spotify.lkk;

/**
 * An error happened that was indicated withing the API transport through an error response.
 *
 * This should be distinguished from HTTP Errors which should have their own exception hierarchy.
 *
 * @author udoprog
 */
public class ApiRemoteException extends ApiException {
    final int code;
    final String reason;

    public ApiRemoteException(int code, String reason) {
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
        return "ApiRemoteException [" + code + ": " + reason + "]";
    }
}
