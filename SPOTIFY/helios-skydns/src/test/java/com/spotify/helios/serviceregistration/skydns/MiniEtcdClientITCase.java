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

import org.apache.http.HttpResponse;
import org.apache.http.StatusLine;
import org.junit.Test;

import static com.google.common.base.Strings.isNullOrEmpty;
import static org.junit.Assert.assertEquals;

public class MiniEtcdClientITCase {
  @Test
  public void test() throws Exception {
    String etcdServer = System.getenv("ETCD_SERVER");
    if (isNullOrEmpty(etcdServer)) {
      etcdServer = "http://localhost:4001";
    }
    final MiniEtcdClient client = new MiniEtcdClient(etcdServer + "/v2/keys/", 10000, 10000, 10000);
    final String data = "DATA!";
    final String key = "KEY";
    client.set(key, data, null).get();

    final HttpResponse getResult = client.get(key).get();
    final EtcdResponse etc = client.getEtcdInfoFromResponse(getResult);
    assertEquals(data, etc.getNode().getValue());

    final HttpResponse delResult = client.delete(key).get();
    final StatusLine statusLine = delResult.getStatusLine();
    assertEquals(200, statusLine.getStatusCode());

    final HttpResponse postDelResult = client.get(key).get();
    final StatusLine postDelStatusLine = postDelResult.getStatusLine();
    assertEquals(404, postDelStatusLine.getStatusCode());

    client.close();
  }
}
