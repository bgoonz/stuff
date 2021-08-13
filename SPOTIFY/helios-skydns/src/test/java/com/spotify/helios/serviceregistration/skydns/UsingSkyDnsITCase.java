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

import com.google.common.collect.ImmutableList;

import com.spotify.helios.Polling;
import com.spotify.helios.serviceregistration.ServiceRegistrar;
import com.spotify.helios.serviceregistration.ServiceRegistration;
import com.spotify.helios.serviceregistration.ServiceRegistration.Endpoint;
import com.spotify.helios.serviceregistration.ServiceRegistrationHandle;

import org.junit.Test;
import org.xbill.DNS.Cache;
import org.xbill.DNS.Lookup;
import org.xbill.DNS.Name;
import org.xbill.DNS.Record;
import org.xbill.DNS.SRVRecord;
import org.xbill.DNS.SimpleResolver;
import org.xbill.DNS.TextParseException;

import java.net.UnknownHostException;
import java.util.concurrent.Callable;

import static com.google.common.base.Strings.isNullOrEmpty;
import static java.util.concurrent.TimeUnit.SECONDS;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

public class UsingSkyDnsITCase {
  private static final int TTL = 300;
  private static final String DOMAIN = getEnv("SKYDNS_DOMAIN", "skydns.local");
  private static final String NORMAL_HOSTNAME_LOOKUP = "helios.http." + DOMAIN;
  private static final String HOSTNAME = "myhostname." + DOMAIN;
  final ImmutableList<Endpoint> ENDPOINTS = ImmutableList.of(
      new ServiceRegistration.Endpoint("helios", "http", 4242, DOMAIN, HOSTNAME));

  @Test
  public void test() throws Exception {
    final ServiceRegistrar registrar = getRegistrar();
    final SimpleResolver resolver = getResolver();

    final ServiceRegistrationHandle handle = registrar.register(
        new ServiceRegistration(ENDPOINTS));

    final Record[] records = Polling.await(10, SECONDS, new Callable<Record[]>() {
      @Override
      public Record[] call() throws Exception {
        final Lookup lookup = doLookup(resolver, NORMAL_HOSTNAME_LOOKUP);
        final Record[] records = lookup.run();
        if (lookup.getResult() == Lookup.SUCCESSFUL) {
          return records;
        }
        return null;
      }
    });

    assertTrue(records.length > 0);
    final SRVRecord record = (SRVRecord) records[0];
    assertEquals(HOSTNAME, record.getTarget().toString(true));

    registrar.unregister(handle);

    Polling.await(10, SECONDS, new Callable<Boolean>() {
      @Override
      public Boolean call() throws Exception {
        final Lookup lookup2 = doLookup(resolver, NORMAL_HOSTNAME_LOOKUP);
        lookup2.run();
        final int result = lookup2.getResult();
        if (result == Lookup.HOST_NOT_FOUND || result == Lookup.TYPE_NOT_FOUND) {
          return true;
        }
        return null;
      }
    });
  }

  private SimpleResolver getResolver() throws UnknownHostException {
    final String skyDnsAddress = getEnv("SKYDNS_SERVER", "localhost");
    final SimpleResolver resolver = new SimpleResolver(skyDnsAddress);
    final String skyDnsPort = System.getenv("SKYDNS_PORT");
    resolver.setPort(isNullOrEmpty(skyDnsPort) ? 53 : Integer.parseInt(skyDnsPort));
    return resolver;
  }

  private ServiceRegistrar getRegistrar() {
    final String etcdServer = getEnv("ETCD_SERVER", "http://localhost:4001");
    return new SkyDnsServiceRegistrarFactory(TTL).create(etcdServer);
  }

  private Lookup doLookup(final SimpleResolver resolver, String hostname)
      throws TextParseException {
    final Cache cache = new Cache();
    final Lookup lookup = new Lookup(new Name(hostname), org.xbill.DNS.Type.SRV);
    lookup.setResolver(resolver);
    lookup.setCache(cache);
    return lookup;
  }

  private static String getEnv(String key, String defaultValue) {
    final String value = System.getenv(key);
    return isNullOrEmpty(value) ? defaultValue : value;
  }
}
