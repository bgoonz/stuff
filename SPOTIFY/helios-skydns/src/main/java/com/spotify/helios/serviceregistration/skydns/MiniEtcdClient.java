/*
 * Copyright (c) 2014 Spotify AB.
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

package com.spotify.helios.serviceregistration.skydns;

import com.google.common.base.Charsets;
import com.google.common.collect.Lists;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.apache.http.HttpResponse;
import org.apache.http.ParseException;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpDelete;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPut;
import org.apache.http.concurrent.FutureCallback;
import org.apache.http.impl.nio.client.CloseableHttpAsyncClient;
import org.apache.http.impl.nio.client.HttpAsyncClients;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.util.EntityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.net.URI;
import java.util.List;
import java.util.concurrent.Future;

import static com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES;
import static com.fasterxml.jackson.databind.MapperFeature.SORT_PROPERTIES_ALPHABETICALLY;
import static com.fasterxml.jackson.databind.SerializationFeature.ORDER_MAP_ENTRIES_BY_KEYS;

/**
 * A minimal etcd client usable for our purposes for SkyDNS
 *
 * TODO: Support multiple etcd servers.
 */
class MiniEtcdClient implements AutoCloseable {
  private static final Logger log = LoggerFactory.getLogger(MiniEtcdClient.class);
  public static final ObjectMapper OBJECT_MAPPER = new ObjectMapper()
      .configure(SORT_PROPERTIES_ALPHABETICALLY, true)
      .configure(ORDER_MAP_ENTRIES_BY_KEYS, true)
      .configure(FAIL_ON_UNKNOWN_PROPERTIES, false);

  private final CloseableHttpAsyncClient httpClient;
  private final String baseUri;

  MiniEtcdClient(final String baseUri,
                 final int connectTimeout,
                 final int connectionRequestTimeout,
                 final int socketTimeout) {
    httpClient = HttpAsyncClients
        .custom().setDefaultRequestConfig(
            RequestConfig.custom()
                .setConnectTimeout(connectTimeout)
                .setConnectionRequestTimeout(connectionRequestTimeout)
                .setSocketTimeout(socketTimeout).build()).build();
    httpClient.start();
    this.baseUri = baseUri;
  }

  Future<HttpResponse> get(final String key) {
    final URI uri = URI.create(baseUri + key);
    return httpClient.execute(new HttpGet(uri), new FutureCallback<HttpResponse>() {
      @Override
      public void cancelled() {
        log.warn("Attempt to get {} to was cancelled", key);
      }

      @Override
      public void completed(HttpResponse arg0) {
        log.info("Succeeded getting {}", key);
      }

      @Override
      public void failed(Exception e) {
        log.warn("Failed getting {}", key, e);
      }
    });
  }

  EtcdResponse getEtcdInfoFromResponse(HttpResponse response) throws ParseException, IOException {
    final String getBody = EntityUtils.toString(response.getEntity());
    return OBJECT_MAPPER.readValue(getBody, EtcdResponse.class);
  }

  Future<HttpResponse> delete(final String key) {
    final URI uri = URI.create(baseUri + key);
    return httpClient.execute(new HttpDelete(uri), new FutureCallback<HttpResponse>() {
      @Override
      public void cancelled() {
        log.warn("Attempt to delete {} to was cancelled", key);
      }

      @Override
      public void completed(HttpResponse arg0) {
        log.info("Succeeded deleting {}", key);
      }

      @Override
      public void failed(Exception e) {
        log.warn("Failed deleting {}", key, e);
      }
    });
  }

  Future<HttpResponse> set(final String key, final String value, final Integer ttl) {
    final List<BasicNameValuePair> data = Lists.newArrayList();
    data.add(new BasicNameValuePair("value", value));
    if (ttl != null) {
        data.add(new BasicNameValuePair("ttl", Integer.toString(ttl)));
    }

    final URI uri = URI.create(baseUri + key);
    final HttpPut request = new HttpPut(uri);
    request.setEntity(new UrlEncodedFormEntity(data, Charsets.UTF_8));
    return httpClient.execute(request, new FutureCallback<HttpResponse>() {
      @Override
      public void cancelled() {
        log.warn("Attempt to set {} to {} was cancelled", key, value);
      }

      @Override
      public void completed(HttpResponse arg0) {
        log.info("Succeeded setting {} to {}", key, value);
      }

      @Override
      public void failed(Exception e) {
        log.warn("Failed setting {} to {}", key, value, e);
      }
    });
  }

  @Override
  public void close() throws Exception {
    httpClient.close();
  }
}

