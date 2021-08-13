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

@JsonInclude(JsonInclude.Include.NON_NULL)
public class EtcdResponse {
    private final String action;
    private final EtcdNode node;
    private final EtcdNode prevNode;
    private final Integer errorCode;
    private final String message;
    private final String cause;
    private final int errorIndex;

    public EtcdResponse(@JsonProperty("action") final String action,
                        @JsonProperty("node") final EtcdNode node,
                        @JsonProperty("prevNode") final EtcdNode prevNode,
                        @JsonProperty("errorCode") final Integer errorCode,
                        @JsonProperty("message") final String message,
                        @JsonProperty("cause") final String cause,
                        @JsonProperty("errorIndex") final int errorIndex) {
      this.action = action;
      this.node = node;
      this.prevNode = prevNode;
      this.errorCode = errorCode;
      this.message = message;
      this.cause = cause;
      this.errorIndex = errorIndex;
    }

    public String getAction() {
      return action;
    }

    public EtcdNode getNode() {
      return node;
    }

    public EtcdNode getPrevNode() {
      return prevNode;
    }

    public Integer getErrorCode() {
      return errorCode;
    }

    public String getMessage() {
      return message;
    }

    public String getCause() {
      return cause;
    }

    public int getErrorIndex() {
      return errorIndex;
    }
 }
