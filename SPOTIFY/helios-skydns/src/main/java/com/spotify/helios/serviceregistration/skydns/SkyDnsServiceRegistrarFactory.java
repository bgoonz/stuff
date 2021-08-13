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

import com.spotify.helios.serviceregistration.ServiceRegistrar;
import com.spotify.helios.serviceregistration.ServiceRegistrarFactory;

import java.net.URI;
import java.net.URISyntaxException;

public class SkyDnsServiceRegistrarFactory implements ServiceRegistrarFactory {
  private static final int DEFAULT_ENTRY_TIME_TO_LIVE = 60;

  private final int ttlSeconds;

  public SkyDnsServiceRegistrarFactory() {
    ttlSeconds = DEFAULT_ENTRY_TIME_TO_LIVE;
  }

  public SkyDnsServiceRegistrarFactory(int ttlSeconds) {
    this.ttlSeconds = ttlSeconds;
  }

  @Override
  public ServiceRegistrar create(final String connectString) {
    final URI uri;
    try {
      uri = new URI(connectString).resolve("/v2/keys/skydns/");
    } catch (URISyntaxException e) {
      throw new RuntimeException("server is not a proper url");
    }

    /*
      Ideally, we should send the refresh ttl/3 (we'll call it P).  For practical and timing
      reasons refreshes have to be at least ttl/(>1), or else you can get spurious expirations due
      to clock skew and delay.  ttl/3 allows one to fail without a spurious expiration.

      If an attempt to refresh would exceed P, we might as well just give up on it and try it again.
      Ideally the apache client would allow you to set an overall timeout for the full request
      cycle, but alas no.  And so, following the patterns of what I saw online, I set the three
      timeouts to the same value.  So if we nearly use up all three in a given request, would be
      just under P/3.  We can consider reweighting them at some point if necessary.

      In practice, it may make sense to reevaluate giving up on a refresh request if it would
      exceed P.  I thought this approach was reasonable for a first approximation because ttl/3/3
      for the current state would be (60,000ms/3/3) or 6,666ms seconds which is pretty generous,
      and if any part of the refresh request took 6 2/3 seconds, something is very likely wrong and
      aborting the attempt seemed wise.
      */
    final int timeoutValueMillis = ((ttlSeconds * 1000) / 3) / 3;
    final MiniEtcdClient etcdClient = new MiniEtcdClient(
        uri.toString(), timeoutValueMillis, timeoutValueMillis, timeoutValueMillis);
    return new SkyDnsServiceRegistrar(etcdClient, ttlSeconds);
  }

  @Override
  public ServiceRegistrar createForDomain(String arg0) {
    throw new UnsupportedOperationException("eventually, just not yet");
  }
}
