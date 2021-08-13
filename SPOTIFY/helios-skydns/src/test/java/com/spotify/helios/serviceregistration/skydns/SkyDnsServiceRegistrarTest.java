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

import com.google.common.base.Throwables;
import com.google.common.collect.ImmutableList;
import com.google.common.util.concurrent.Futures;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.spotify.helios.serviceregistration.ServiceRegistration;
import com.spotify.helios.serviceregistration.ServiceRegistration.Endpoint;
import com.spotify.helios.serviceregistration.ServiceRegistrationHandle;

import org.apache.http.HttpResponse;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.internal.verification.VerificationModeFactory;
import org.mockito.runners.MockitoJUnitRunner;

import static com.spotify.helios.serviceregistration.skydns.SkyDnsServiceRegistrar.OBJECT_MAPPER;
import static org.mockito.Mockito.timeout;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@RunWith(MockitoJUnitRunner.class)
public class SkyDnsServiceRegistrarTest {
  private static final int WAIT_TIMEOUT = 1000;
  private static final String PROTOCOL = "http";
  private static final String PORT_NAME = "helios";
  private static final String HOSTNAME = "myhostname.";
  private static final String DOMAIN = "services.foo.com";
  private static final String SUFFIX_KEY = "/myhostname__4242";
  private static final String ETCD_KEY = "com/foo/services/http/helios" + SUFFIX_KEY;
  private static final String EXPECTED = createExpected();
  private static final int TTL = 3;
  final ImmutableList<Endpoint> ENDPOINTS = ImmutableList.of(
      new ServiceRegistration.Endpoint(PORT_NAME, PROTOCOL, 4242, DOMAIN, HOSTNAME));

  @Mock private MiniEtcdClient client;
  @Mock private HttpResponse response;

  private static String createExpected() {
    try {
      return OBJECT_MAPPER.writeValueAsString(SkyDnsEntry.builder()
        .setHost(HOSTNAME)
        .setPort(4242)
        .build());
    } catch (JsonProcessingException e) {
      throw Throwables.propagate(e);
    }
  }

  @Test
  public void testRegistration_alternateFormat() throws Exception {
    // set some weird domain format
    final SkyDnsServiceRegistrar registrar = new SkyDnsServiceRegistrar(client, TTL,
        "${domain}.${service}");
    final String key = "helios/com/foo/services" + SUFFIX_KEY;
    when(client.set(key, EXPECTED, TTL))
        .thenReturn(Futures.immediateFuture(response));
    registrar.register(new ServiceRegistration(ImmutableList.of(
        new ServiceRegistration.Endpoint(PORT_NAME, PROTOCOL, 4242, DOMAIN, HOSTNAME))));
    verify(client, timeout(WAIT_TIMEOUT)).set(key, EXPECTED, TTL);
    registrar.close();
  }

  @Test
  public void testRegistration() throws Exception {
    final SkyDnsServiceRegistrar registrar = makeRegistrar();
    when(client.set(ETCD_KEY, EXPECTED, TTL))
        .thenReturn(Futures.immediateFuture(response));
    registrar.register(new ServiceRegistration(ImmutableList.of(
        new ServiceRegistration.Endpoint(PORT_NAME, PROTOCOL, 4242, DOMAIN, HOSTNAME))));
    verify(client, timeout(WAIT_TIMEOUT)).set(ETCD_KEY, EXPECTED, TTL);
    registrar.close();
  }

  @Test
  public void testRegistrationWithFullyQualifiedDomain() throws Exception {
    final SkyDnsServiceRegistrar registrar = makeRegistrar();
    when(client.set(ETCD_KEY, EXPECTED, TTL))
        .thenReturn(Futures.immediateFuture(response));
    registrar.register(new ServiceRegistration(ImmutableList.of(
        new ServiceRegistration.Endpoint(PORT_NAME, PROTOCOL, 4242, DOMAIN + ".", HOSTNAME))));
    verify(client, timeout(WAIT_TIMEOUT)).set(ETCD_KEY, EXPECTED, TTL);
    registrar.close();
  }

  private SkyDnsServiceRegistrar makeRegistrar() {
    return new SkyDnsServiceRegistrar(client, TTL);
  }

  @Test
  public void testDeregistration() {
    final SkyDnsServiceRegistrar registrar = makeRegistrar();
    when(client.set(ETCD_KEY, EXPECTED, TTL))
        .thenReturn(Futures.immediateFuture(response));
    final ServiceRegistrationHandle handle = registrar.register(new ServiceRegistration(ENDPOINTS));

    when(client.delete(ETCD_KEY)).thenReturn(Futures.immediateFuture(response));
    registrar.unregister(handle);
    verify(client, timeout(WAIT_TIMEOUT)).delete(ETCD_KEY);
    registrar.close();
  }

  @Test
  public void testRegistrationAndRefresh() throws Exception {
    final SkyDnsServiceRegistrar registrar = makeRegistrar();
    when(client.set(ETCD_KEY, EXPECTED, TTL))
        .thenReturn(Futures.immediateFuture(response));
    registrar.register(new ServiceRegistration(ENDPOINTS));
    verify(client, timeout(WAIT_TIMEOUT)).set(ETCD_KEY, EXPECTED, TTL);
    verify(client, timeout(2000).atLeast(2)).set(ETCD_KEY, EXPECTED, TTL);
    registrar.close();
  }

  @Test
  public void testUnRegistrationNotRefreshedAnyMore() throws Exception {
    final SkyDnsServiceRegistrar registrar = makeRegistrar();
    when(client.set(ETCD_KEY, EXPECTED, TTL))
        .thenReturn(Futures.immediateFuture(response));

    final ServiceRegistrationHandle handle = registrar.register(
        new ServiceRegistration(ENDPOINTS));
    verify(client, timeout(WAIT_TIMEOUT)).set(ETCD_KEY, EXPECTED, TTL);

    when(client.delete(ETCD_KEY)).thenReturn(Futures.immediateFuture(response));
    registrar.unregister(handle);
    verify(client, timeout(WAIT_TIMEOUT)).delete(ETCD_KEY);

    Thread.sleep(2000);
    verify(client, VerificationModeFactory.noMoreInteractions()).set(ETCD_KEY, EXPECTED, TTL);
    registrar.close();
  }
}
