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

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.concurrent.TimeUnit;

import com.fasterxml.jackson.core.type.TypeReference;

import com.amazonaws.AmazonServiceException;

import com.netflix.edda.util.ProxyHelper;

abstract public class EddaAwsClient {
  final AwsConfiguration config;
  final String vip;
  final String region;

  public EddaAwsClient(AwsConfiguration config, String vip, String region) {
    this.config = config;
    this.vip = vip;
    this.region = region;
  }

  public void shutdown() {}

  protected <T> T readOnly(Class<T> c) {
    return ProxyHelper.unsupported(c, this);
  }

  protected <T> T wrapAwsClient(Class<T> c, T delegate) {
    return ProxyHelper.wrapper(c, delegate, this);
  }

  protected byte[] doGet(final String uri) {
    try {
      return EddaContext.getContext().getRxHttp().get(mkUrl(uri))
      .flatMap(response -> {
        if (response.getStatus().code() != 200) {
          AmazonServiceException e = new AmazonServiceException("Failed to fetch " + uri);
          e.setStatusCode(response.getStatus().code());
          e.setErrorCode("Edda");
          e.setRequestId(uri);
          return rx.Observable.error(e);
        }
        return response.getContent()
        .reduce(
          new ByteArrayOutputStream(),
          (out, bb) -> {
            try { bb.readBytes(out, bb.readableBytes()); }
            catch (IOException e) { throw new RuntimeException(e); }
            return out;
          }
        )
        .map(out -> {
          return out.toByteArray();
        });
      })
      .toBlocking()
      .toFuture()
      .get(2, TimeUnit.MINUTES);
    }
    catch (Exception e) {
      throw new RuntimeException("failed to get url: " + uri, e);
    }
  }

  protected String mkUrl(String url) {
    return url.replaceAll("\\$\\{vip\\}", vip).replaceAll("\\$\\{region\\}", region);
  }

  protected <T> T parse(TypeReference<T> ref, byte[] body) throws IOException {
      return JsonHelper.createParser(new ByteArrayInputStream(body)).readValueAs(ref);
  }

  protected void validateEmpty(String name, String s) {
    if (s != null && s.length() > 0)
      throw new UnsupportedOperationException(name + " not supported");
  }

  protected void validateNotEmpty(String name, String s) {
    if (s == null || s.length() == 0)
      throw new UnsupportedOperationException(name + " required");
  }

  protected void validateEmpty(String name, Boolean b) {
    if (b != null)
      throw new UnsupportedOperationException(name + " not supported");
  }

  protected <T> void validateEmpty(String name, List<T> list) {
    if (list != null && list.size() > 0)
      throw new UnsupportedOperationException(name + " not supported");
  }

  protected boolean shouldFilter(String s) {
    return (s != null && s.length() > 0);
  }

  protected boolean shouldFilter(List<String> list) {
    return (list != null && list.size() > 0);
  }

  protected boolean matches(String s, String v) {
    return !shouldFilter(s) || s.equals(v);
  }

  protected boolean matches(List<String> list, String v) {
    return !shouldFilter(list) || list.contains(v);
  }
}
