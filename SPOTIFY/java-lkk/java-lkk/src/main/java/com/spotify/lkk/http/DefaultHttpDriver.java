// Copyright (c) 2013 Spotify AB
package com.spotify.lkk.http;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.lang.reflect.Type;

import org.apache.http.HttpEntity;
import org.apache.http.HttpEntityEnclosingRequest;
import org.apache.http.HttpHost;
import org.apache.http.HttpResponse;
import org.apache.http.StatusLine;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.Credentials;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.client.AuthCache;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpHead;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpPut;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.client.protocol.ClientContext;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.auth.BasicScheme;
import org.apache.http.impl.client.BasicAuthCache;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.protocol.BasicHttpContext;
import org.apache.http.protocol.HttpContext;

import com.google.gson.Gson;

public class DefaultHttpDriver implements HttpDriver {
    private final HttpHost targetHost;
    private final HttpClient client;
    private final HttpContext context;
    private final String charset = "utf-8";
    private final String contentType = "application/json";
    private final Gson gson = new Gson();

    public DefaultHttpDriver(String host, int port, String username, String password) {
        this.targetHost = new HttpHost(host, port, port == 443 ? "https" : "http");
        this.client = setupClient(username, password);
        this.context = setupContext();
    }

    private HttpClient setupClient(String username, String password)
    {
        DefaultHttpClient client = new DefaultHttpClient();
        AuthScope scope = new AuthScope(targetHost);

        Credentials credentials = new UsernamePasswordCredentials(username, password);

        client.getCredentialsProvider().setCredentials(scope, credentials);

        return client;
    }

    private HttpContext setupContext() {
        AuthCache authCache = new BasicAuthCache();

        BasicScheme basicAuth = new BasicScheme();
        authCache.put(targetHost, basicAuth);

        BasicHttpContext context = new BasicHttpContext();

        context.setAttribute(ClientContext.AUTH_CACHE, authCache);

        return context;
    }

    private String readBody(HttpResponse response, String charset) throws HttpDriverException {
        final HttpEntity entity = response.getEntity();

        final InputStream content;

        try {
            content = entity.getContent();
        } catch (IOException e) {
            throw new HttpDriverException(e);
        }

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        byte[] buffer = new byte[4096];

        while (true) {
            final int length;

            try {
                length = content.read(buffer);
            } catch (IOException e) {
                throw new HttpDriverException(e);
            }

            if (length <= 0) {
                break;
            }

            outputStream.write(buffer, 0, length);
        }

        try {
            return outputStream.toString(charset);
        } catch (UnsupportedEncodingException e) {
            throw new HttpDriverException(e);
        }
    }

    private <R> HttpEntity createEntity(R body) throws HttpDriverException {
        final String requestBody = gson.toJson(body);

        try {
            return new StringEntity(requestBody, charset);
        } catch (UnsupportedEncodingException e) {
            throw new HttpDriverException(e);
        }
    }

    private HttpUriRequest setupUriRequest(HttpMethod method, String uri) {
        switch (method) {
        case GET:
            return new HttpGet(uri);
        case POST:
            return new HttpPost(uri);
        case HEAD:
            return new HttpHead(uri);
        case PUT:
            return new HttpPut(uri);
        }

        return null;
    }

    public <R,T> T execute(HttpMethod method, String uri, R body, Type expected) throws HttpDriverException {
        final HttpUriRequest request = setupUriRequest(method, uri);
        final HttpResponse response;

        request.addHeader("Accept", "application/json; */*;");
        request.setHeader("Content-Type", contentType);

        if (body != null && (request instanceof HttpEntityEnclosingRequest)) {
            final HttpEntityEnclosingRequest entityRequest = HttpEntityEnclosingRequest.class.cast(request);
            HttpEntity entity = createEntity(body);
            entityRequest.setEntity(entity);
        }

        try {
            response = this.client.execute(targetHost, request, context);
        } catch (ClientProtocolException e) {
            throw new HttpDriverException(e);
        } catch (IOException e) {
            throw new HttpDriverException(e);
        }

        final StatusLine status = response.getStatusLine();

        if (status.getStatusCode() / 100 != 2) {
            throw new HttpDriverRemoteException(status.getStatusCode(), status.getReasonPhrase());
        }

        if (expected == null) {
            return null;
        }

        String responseBody = readBody(response, charset);

        return gson.fromJson(responseBody, expected);
    }
}
