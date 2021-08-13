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

import com.google.common.base.Preconditions;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class SkyDnsEntry {
  private final String host;
  private final Integer port;
  private final Integer priority;
  private final Integer weight;
  private final Integer ttl;

  private SkyDnsEntry(String host, Integer port, Integer priority, Integer weight, Integer ttl) {
    this.host = Preconditions.checkNotNull(host);
    this.port = port;
    this.priority = priority;
    this.weight = weight;
    this.ttl = ttl;
  }

  public String getHost() {
    return host;
  }

  public Integer getPort() {
    return port;
  }

  public Integer getPriority() {
    return priority;
  }

  public Integer getWeight() {
    return weight;
  }

  public Integer getTtl() {
    return ttl;
  }

  public static Builder builder() {
    return new Builder();
  }

  public static class Builder {
    private String host = null;
    private Integer port = null;
    private Integer priority = null;
    private Integer weight = null;
    private Integer ttl = null;

    public Builder() {}

    public Builder setHost(String host) {
      this.host = host;
      return this;
    }

    public Builder setPort(Integer port) {
      this.port = port;
      return this;
    }

    public Builder setPriority(Integer priority) {
      this.priority = priority;
      return this;
    }

    public Builder setWeight(Integer weight) {
      this.weight = weight;
      return this;
    }

    public Builder setTtl(Integer ttl) {
      this.ttl = ttl;
      return this;
    }

    public String getHost() {
      return host;
    }

    public Integer getPort() {
      return port;
    }

    public Integer getPriority() {
      return priority;
    }

    public Integer getWeight() {
      return weight;
    }

    public Integer getTtl() {
      return ttl;
    }

    public SkyDnsEntry build() {
      return new SkyDnsEntry(host, port, priority, weight, ttl);
    }
  }
}
