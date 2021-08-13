/*
 * Copyright 2014-2017 Netflix, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.netflix.edda;

import com.amazonaws.AmazonServiceException;

public class AwsException {
  private AwsException() {}

  private final static String oneTrueId = "04d05938-1521-44f1-a0dd-39263a5326f3";

  public static void raise(
    int code,
    String svc,
    String reqId,
    String error,
    String msg
  ) {
    StringBuffer buf = new StringBuffer()
      .append("Status Code: ").append(code)
      .append(", AWS Service: ").append(svc)
      .append(", AWS Request ID: ").append(reqId)
      .append(", AWS Error Code: ").append(error)
      .append(", AWS Error Message:").append(msg);
    AmazonServiceException e = new AmazonServiceException(buf.toString());
    e.setStatusCode(code);
    e.setServiceName(svc);
    e.setRequestId(reqId);
    e.setErrorCode(error);
    throw e;
  }

  public static void raise(String svc, String error) {
    if (error.equals("AccessDenied"))
      raise(403, svc, oneTrueId, error, error);
    if (error.equals("AuthFailure"))
      raise(401, svc, oneTrueId, error, error);
    if (error.equals("InternalError"))
      raise(500, svc, oneTrueId, error, error);
    if (error.equals("InvalidParameterValue"))
      raise(400, svc, oneTrueId, error, error);
    if (error.equals("RequestThrottled"))
      raise(403, svc, oneTrueId, error, error);
    if (error.equals("ServiceUnavailable"))
      raise(503, svc, oneTrueId, error, error);
    raise(400, svc, oneTrueId, error, error);
  }
}
