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

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class EtcdNode {
  private final String key;
  private final long createdIndex;
  private final long modifiedIndex;
  private final String value;
  private final String expiration;
  private final Integer ttl;
  private final boolean dir;
  private final List<EtcdNode> nodes;

  public EtcdNode(@JsonProperty("key") final String key,
                  @JsonProperty("createdIndex") final long createdIndex,
                  @JsonProperty("modifiedIndex") final long modifiedIndex,
                  @JsonProperty("value") final String value,
                  @JsonProperty("expiration") final String expiration,
                  @JsonProperty("ttl") final Integer ttl,
                  @JsonProperty("dir") final boolean dir,
                  @JsonProperty("nodes") final List<EtcdNode> nodes) {
    this.key = key;
    this.createdIndex = createdIndex;
    this.modifiedIndex = modifiedIndex;
    this.value = value;
    this.expiration = expiration;
    this.ttl = ttl;
    this.dir = dir;
    this.nodes = nodes;
  }

  public String getKey() {
    return key;
  }

  public long getCreatedIndex() {
    return createdIndex;
  }

  public long getModifiedIndex() {
    return modifiedIndex;
  }

  public String getValue() {
    return value;
  }

  public String getExpiration() {
    return expiration;
  }

  public Integer getTtl() {
    return ttl;
  }

  public boolean isDir() {
    return dir;
  }

  public List<EtcdNode> getNodes() {
    return nodes;
  }
}
