/*-
 * -\-\-
 * FastForward Client
 * --
 * Copyright (C) 2016 - 2019 Spotify AB
 * --
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *      http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * -/-/-
 */

package com.spotify.ffwd;

import com.spotify.ffwd.protocol0.Protocol0;
import com.spotify.ffwd.protocol0.Protocol0.Attribute;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Metric {

  private static final long PROC = 1 << 0;
  private static final long TIME = 1 << 1;
  private static final long KEY = 1 << 2;
  private static final long VALUE = 1 << 3;
  private static final long HOST = 1 << 4;
  private static final long TAGS = 1 << 5;
  private static final long ATTRIBUTES = 1 << 6;

  private final long has;
  private final String proc;
  private final long time;
  private final String key;
  private final double value;
  private final String host;
  private final List<String> tags;
  private final Map<String, String> attributes;

  public Metric() {
    this.has = 0;
    this.proc = null;
    this.time = 0;
    this.key = null;
    this.value = 0;
    this.host = null;
    this.tags = new ArrayList<>();
    this.attributes = new HashMap<>();
  }

  public Metric(
      long has, String proc, long time, String key, double value, String host,
      List<String> tags, Map<String, String> attributes
  ) {
    this.has = has;
    this.proc = proc;
    this.time = time;
    this.key = key;
    this.value = value;
    this.host = host;
    this.tags = tags;
    this.attributes = attributes;
  }

  private boolean test(long n) {
    return (has & n) != 0;
  }

  private long set(long n) {
    return has | n;
  }

  public Metric proc(String proc) {
    return new Metric(set(PROC), proc, time, key, value, host, tags, attributes);
  }

  public Metric time(long time) {
    return new Metric(set(TIME), proc, time, key, value, host, tags, attributes);
  }

  public Metric key(String key) {
    return new Metric(set(KEY), proc, time, key, value, host, tags, attributes);
  }

  public Metric value(double value) {
    return new Metric(set(VALUE), proc, time, key, value, host, tags, attributes);
  }

  public Metric host(String host) {
    return new Metric(set(HOST), proc, time, key, value, host, tags, attributes);
  }

  public Metric tag(String tag) {
    final List<String> tags = new ArrayList<>(this.tags);
    tags.add(tag);
    return new Metric(set(TAGS), proc, time, key, value, host, tags, attributes);
  }

  public Metric tags(List<String> tags) {
    return new Metric(set(TAGS), proc, time, key, value, host,
        new ArrayList<>(tags), attributes);
  }

  public Metric attribute(String k, String v) {
    final Map<String, String> attributes = new HashMap<>(this.attributes);
    attributes.put(k, v);
    return new Metric(set(ATTRIBUTES), proc, time, key, value, host, tags, attributes);
  }

  public Metric attributes(Map<String, String> attributes) {
    return new Metric(set(ATTRIBUTES), proc, time, key, value, host, tags,
        new HashMap<>(attributes));
  }

  public byte[] serialize() {
    final Protocol0.Metric.Builder builder = Protocol0.Metric.newBuilder();

    if (test(PROC)) {
      builder.setProc(proc);
    }

    if (test(TIME)) {
      builder.setTime(time);
    }

    if (test(KEY)) {
      builder.setKey(key);
    }

    if (test(VALUE)) {
      builder.setValue(value);
    }

    if (test(HOST)) {
      builder.setHost(host);
    }

    if (test(TAGS)) {
      for (final String tag : tags) {
        builder.addTags(tag);
      }
    }

    if (test(ATTRIBUTES)) {
      for (final Map.Entry<String, String> entry : attributes.entrySet()) {
        if (entry.getKey() == null) {
          continue;
        }

        final Attribute.Builder attributeBuilder =
            Protocol0.Attribute.newBuilder().setKey(entry.getKey());

        if (entry.getValue() != null) {
          attributeBuilder.setValue(entry.getValue());
        }

        builder.addAttributes(attributeBuilder.build());
      }
    }

    final Protocol0.Metric m = builder.build();
    return Protocol0.Message.newBuilder().setMetric(m).build()
        .toByteArray();
  }

  public boolean equals(final Object o) {
    if (o == this) {
      return true;
    }
    if (!(o instanceof Metric)) {
      return false;
    }
    final Metric other = (Metric) o;
    if (!other.canEqual((Object) this)) {
      return false;
    }
    if (this.has != other.has) {
      return false;
    }
    final Object this$proc = this.proc;
    final Object other$proc = other.proc;
    if (this$proc == null ? other$proc != null : !this$proc.equals(other$proc)) {
      return false;
    }
    if (this.time != other.time) {
      return false;
    }
    final Object this$key = this.key;
    final Object other$key = other.key;
    if (this$key == null ? other$key != null : !this$key.equals(other$key)) {
      return false;
    }
    if (Double.compare(this.value, other.value) != 0) {
      return false;
    }
    final Object this$host = this.host;
    final Object other$host = other.host;
    if (this$host == null ? other$host != null : !this$host.equals(other$host)) {
      return false;
    }
    final Object this$tags = this.tags;
    final Object other$tags = other.tags;
    if (this$tags == null ? other$tags != null : !this$tags.equals(other$tags)) {
      return false;
    }
    final Object this$attributes = this.attributes;
    final Object other$attributes = other.attributes;
    if (this$attributes == null ? other$attributes != null
                                : !this$attributes.equals(other$attributes)) {
      return false;
    }
    return true;
  }

  private boolean canEqual(final Object other) {
    return other instanceof Metric;
  }

  @SuppressWarnings({"AbbreviationAsWordInName"})
  public int hashCode() {
    final int PRIME = 59;
    int result = 1;
    final long $has = this.has;
    result = result * PRIME + (int) ($has >>> 32 ^ $has);
    final Object $proc = this.proc;
    result = result * PRIME + ($proc == null ? 43 : $proc.hashCode());
    final long $time = this.time;
    result = result * PRIME + (int) ($time >>> 32 ^ $time);
    final Object $key = this.key;
    result = result * PRIME + ($key == null ? 43 : $key.hashCode());
    final long $value = Double.doubleToLongBits(this.value);
    result = result * PRIME + (int) ($value >>> 32 ^ $value);
    final Object $host = this.host;
    result = result * PRIME + ($host == null ? 43 : $host.hashCode());
    final Object $tags = this.tags;
    result = result * PRIME + ($tags == null ? 43 : $tags.hashCode());
    final Object $attributes = this.attributes;
    result = result * PRIME + ($attributes == null ? 43 : $attributes.hashCode());
    return result;
  }

  public String getProc() {
    return this.proc;
  }

  public long getTime() {
    return this.time;
  }

  public String getKey() {
    return this.key;
  }

  public double getValue() {
    return this.value;
  }

  public String getHost() {
    return this.host;
  }

  public List<String> getTags() {
    return this.tags;
  }

  public Map<String, String> getAttributes() {
    return this.attributes;
  }
}
