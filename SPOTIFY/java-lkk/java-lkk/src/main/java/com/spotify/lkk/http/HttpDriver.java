// Copyright (c) 2013 Spotify AB
package com.spotify.lkk.http;

import java.lang.reflect.Type;

import org.apache.http.client.methods.HttpUriRequest;


/**
 * Describes the functionality of a HTTP driver for the LKK API.
 *
 * @param method The request method to use.
 * @param uri The URI to perform the request against.
 * @param entity The entity to send with the request.
 * @param expected The expected result type.
 * @author udoprog
 */
public interface HttpDriver {
    public <R,T> T execute(HttpMethod method, String uri, R entity, Type expected) throws HttpDriverException;
}
