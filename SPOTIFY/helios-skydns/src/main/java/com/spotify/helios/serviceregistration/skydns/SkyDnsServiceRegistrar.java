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

import com.google.common.base.Joiner;
import com.google.common.base.Optional;
import com.google.common.base.Preconditions;
import com.google.common.base.Splitter;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.util.concurrent.MoreExecutors;
import com.google.common.util.concurrent.ThreadFactoryBuilder;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.spotify.helios.serviceregistration.ServiceRegistrar;
import com.spotify.helios.serviceregistration.ServiceRegistration;
import com.spotify.helios.serviceregistration.ServiceRegistration.Endpoint;
import com.spotify.helios.serviceregistration.ServiceRegistrationHandle;

import org.apache.commons.lang3.text.StrSubstitutor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledThreadPoolExecutor;
import java.util.concurrent.ThreadFactory;

import static com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES;
import static com.fasterxml.jackson.databind.MapperFeature.SORT_PROPERTIES_ALPHABETICALLY;
import static com.fasterxml.jackson.databind.SerializationFeature.ORDER_MAP_ENTRIES_BY_KEYS;
import static java.util.concurrent.TimeUnit.SECONDS;

public class SkyDnsServiceRegistrar implements ServiceRegistrar {
  private static final Logger log = LoggerFactory.getLogger(SkyDnsServiceRegistrar.class);

  static final ObjectMapper OBJECT_MAPPER = new ObjectMapper()
      .configure(SORT_PROPERTIES_ALPHABETICALLY, true)
      .configure(ORDER_MAP_ENTRIES_BY_KEYS, true)
      .configure(FAIL_ON_UNKNOWN_PROPERTIES, false);

  private final ThreadFactory threadFactory = new ThreadFactoryBuilder()
      .setNameFormat("skydns-registrar-%d").build();
  private final ScheduledExecutorService executor;

  private final Map<ServiceRegistrationHandle, ServiceRegistration> handles;
  private final MiniEtcdClient etcdClient;
  private final int timeToLiveSeconds;

  private final Runnable registrationRunnable = new Runnable() {
    @Override public void run() {
      for (ServiceRegistration handle : handles.values()) {
        try {
          log.debug("handles is {}", handles);
          sendRegistration(handle);
        } catch (Exception e) {
          log.error("Caught exception sending registration for handle {}", handle, e);
        }
      }
    }
  };

  private final String srvFormat;

  public SkyDnsServiceRegistrar(final MiniEtcdClient etcdClient,
                                final int timeToLiveSeconds) {
    this(etcdClient, timeToLiveSeconds,
        Optional
            .fromNullable(System.getenv("REGISTRAR_HOST_FORMAT"))
            .or("${service}.${protocol}.${domain}"));
  }

  /**
   * @param etcdClient client to talk to etcd with.
   * @param timeToLiveSeconds how long entries in the discovery service should live.
   * @param format the hostname format.
   */
  public SkyDnsServiceRegistrar(final MiniEtcdClient etcdClient,
                                final int timeToLiveSeconds,
                                final String format) {
    this.etcdClient = Preconditions.checkNotNull(etcdClient);
    this.timeToLiveSeconds = timeToLiveSeconds;
    this.handles = Maps.newConcurrentMap();

    this.executor = MoreExecutors.getExitingScheduledExecutorService(
        (ScheduledThreadPoolExecutor) Executors.newScheduledThreadPool(1, threadFactory),
        0, SECONDS);

    // Dividing into thirds, since at least halves are necessary to ensure that the item doesn't
    // expire due to a slight delay, and went to thirds so that a single failure won't tank the
    // registration
    this.executor.scheduleAtFixedRate(registrationRunnable, timeToLiveSeconds / 3,
        timeToLiveSeconds / 3, SECONDS);
    this.srvFormat = format;
  }

  @Override
  public void close() {
    try {
      executor.shutdownNow();
    } catch (Exception e) {
      log.error("Error shutting down executor service", e);
    }
    try {
      etcdClient.close();
    } catch (Exception e) {
      log.error("Error shutting down http client to etcd", e);
    }
  }

  @Override
  public ServiceRegistrationHandle register(ServiceRegistration registration) {
    final ServiceRegistrationHandle newHandle = new ServiceRegistrationHandle(){};

    handles.put(newHandle, registration);
    try {
      sendRegistration(registration);
    } catch (Exception e) {
      log.warn("Error performing registration", e);
    }
    return newHandle;
  }

  @Override
  public void unregister(final ServiceRegistrationHandle handle) {
    if (!handles.containsKey(handle)) {
      return;
    }

    try {
      sendDeRegistration(handle);
    } catch (Exception e) {
      log.warn("error removing registration handle {}", handle, e);
    }

    handles.remove(handle);
  }

  private void sendDeRegistration(ServiceRegistrationHandle handle) {
    final ServiceRegistration registration = handles.get(handle);
    if (registration == null) {
      return;
    }
    for (Endpoint endpoint : registration.getEndpoints()) {
      etcdClient.delete(makeKey(endpoint));
    }
  }

  private void sendRegistration(ServiceRegistration registration) throws JsonProcessingException {
    for (Endpoint endpoint : registration.getEndpoints()) {
      final String value = OBJECT_MAPPER.writeValueAsString(SkyDnsEntry.builder()
          .setHost(makeHostnameCanonical(endpoint.getHost()))
          .setPort(endpoint.getPort())
          // could set TTL, but skydns goes by the min(ttl, etcd entry ttl) anyhow
          .build());
      etcdClient.set(makeKey(endpoint), value, timeToLiveSeconds);
    }
  }

  /**
   * Necessary because otherwise, SkyDNS will "helpfully" and quasi-nondeterministically append
   * a domain to the FQDN we supply when returning the SRV record.
   */
  private static String makeHostnameCanonical(final String advertisedHost) {
    if (!advertisedHost.endsWith(".")) {
      return advertisedHost + ".";
    } else {
      return advertisedHost;
    }
  }

  private static String pathifyDomain(final String domain) {
    final List<String> constituents = Splitter.on('.').omitEmptyStrings().splitToList(domain);
    return Joiner.on('/').join(Lists.reverse(constituents));
  }

  private String makeKey(final Endpoint endpoint) {
    final StrSubstitutor subst = new StrSubstitutor(ImmutableMap.<String, Object>of(
        "service", endpoint.getName(),
        "protocol", endpoint.getProtocol(),
        "domain", endpoint.getDomain()));

    final String srvRecordName = subst.replace(srvFormat);
    final String uniqueSuffix = (endpoint.getHost() + "_" + endpoint.getPort()).replace(".", "_");

    return pathifyDomain(srvRecordName) + "/" + uniqueSuffix;
  }
}
