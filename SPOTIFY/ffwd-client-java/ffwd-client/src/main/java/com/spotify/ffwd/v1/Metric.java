/*-
 * -\-\-
 * FastForward Java Client
 * --
 * Copyright (C) 2016 - 2020 Spotify AB
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

package com.spotify.ffwd.v1;

import com.spotify.ffwd.protocol1.Protocol1;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


public class Metric {

  private static final long TIME = 1 << 1;
  private static final long KEY = 1 << 2;
  private static final long VALUE = 1 << 3;
  private static final long HOST = 1 << 4;
  private static final long TAGS = 1 << 5;
  private static final long ATTRIBUTES = 1 << 6;

  private final long has;
  private final long time;
  private final String key;
  private final Value value;
  private final String host;
  private final List<String> tags;
  private final Map<String, String> attributes;

  public Metric() {
    this.has = 0;
    this.time = 0;
    this.key = null;
    this.value = Value.doubleValue(0);
    this.host = null;
    this.tags = new ArrayList<>();
    this.attributes = new HashMap<>();
  }

  public Metric(
      long has, long time, String key, Value value, String host,
      List<String> tags, Map<String, String> attributes
  ) {
    this.has = has;
    this.time = time;
    this.key = key;
    this.value = (value == null) ? Value.doubleValue(0) : value;
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

  public Metric time(long time) {
    return new Metric(set(TIME), time, key, value, host, tags, attributes);
  }

  public Metric key(String key) {
    return new Metric(set(KEY), time, key, value, host, tags, attributes);
  }

  public Metric value(Value value) {
    Value newValue = (value == null) ? Value.doubleValue(0) : value;
    return new Metric(set(VALUE), time, key, newValue, host, tags, attributes);
  }

  public Metric host(String host) {
    return new Metric(set(HOST), time, key, value, host, tags, attributes);
  }

  public Metric tag(String tag) {
    final List<String> tags = new ArrayList<>(this.tags);
    tags.add(tag);
    return new Metric(set(TAGS), time, key, value, host, tags, attributes);
  }

  public Metric tags(List<String> tags) {
    return new Metric(set(TAGS), time, key, value, host,
        new ArrayList<>(tags), attributes);
  }

  public Metric attribute(String k, String v) {
    final Map<String, String> attributes = new HashMap<>(this.attributes);
    attributes.put(k, v);
    return new Metric(set(ATTRIBUTES), time, key, value, host, tags, attributes);
  }

  public Metric attributes(Map<String, String> attributes) {
    return new Metric(set(ATTRIBUTES), time, key, value, host, tags,
        new HashMap<>(attributes));
  }

  public byte[] serialize() {
    final Protocol1.Metric.Builder builder = Protocol1.Metric.newBuilder();

    if (test(TIME)) {
      builder.setTime(time);
    }

    if (test(KEY)) {
      builder.setKey(key);
    }

    if (test(VALUE)) {
      if (value instanceof Value.DoubleValue) {
        Value.DoubleValue doubleValue = (Value.DoubleValue) value;
        builder.setValue(Protocol1.Value.newBuilder().setDoubleValue(doubleValue.getValue()));
      } else if (value instanceof Value.DistributionValue) {
        Value.DistributionValue distributionValue = (Value.DistributionValue) value;
        builder.setValue(Protocol1.Value.newBuilder()
            .setDistributionValue(distributionValue.getValue()));
      } else {
        throw new IllegalArgumentException("Failed to identify distribution type : [" + value
                                          + "]");
      }
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

        final Protocol1.Attribute.Builder attributeBuilder =
            Protocol1.Attribute.newBuilder().setKey(entry.getKey());

        if (entry.getValue() != null) {
          attributeBuilder.setValue(entry.getValue());
        }

        builder.addAttributes(attributeBuilder.build());
      }
    }

    final Protocol1.Metric m = builder.build();
    return Protocol1.Message.newBuilder().setMetric(m).build()
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

    if (this.time != other.time) {
      return false;
    }
    final Object this$key = this.key;
    final Object other$key = other.key;
    if (this$key == null ? other$key != null : !this$key.equals(other$key)) {
      return false;
    }
    final Object this$value = this.value;
    final Object other$value = other.value;
    if (this$value == null ? other$value != null : !this$value.equals(other$value)) {
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
    return other instanceof com.spotify.ffwd.Metric;
  }

  @SuppressWarnings({ "AbbreviationAsWordInName" })
  public int hashCode() {
    final int PRIME = 59;
    int result = 1;
    final long $has = this.has;
    result = result * PRIME + (int) ($has >>> 32 ^ $has);
    final long $time = this.time;
    result = result * PRIME + (int) ($time >>> 32 ^ $time);
    final Object $key = this.key;
    result = result * PRIME + ($key == null ? 43 : $key.hashCode());
    final Object $value = this.value;
    result = result * PRIME + ($value == null ? 43 : $value.hashCode());
    final Object $host = this.host;
    result = result * PRIME + ($host == null ? 43 : $host.hashCode());
    final Object $tags = this.tags;
    result = result * PRIME + ($tags == null ? 43 : $tags.hashCode());
    final Object $attributes = this.attributes;
    result = result * PRIME + ($attributes == null ? 43 : $attributes.hashCode());
    return result;
  }


  public long getTime() {
    return this.time;
  }

  public String getKey() {
    return this.key;
  }

  public Value getValue() {
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
