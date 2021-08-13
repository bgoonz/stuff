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

import java.io.IOException;
import java.io.InputStream;
import java.io.Reader;
import java.io.StringReader;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.MappingJsonFactory;
import com.fasterxml.jackson.databind.ObjectMapper;

import com.netflix.awsobjectmapper.AmazonObjectMapperConfigurer;
import com.netflix.edda.mapper.*;

public class JsonHelper {
  private JsonHelper() {}

  private static final ObjectMapper mapper;
  private static final MappingJsonFactory factory;

  static {
    mapper = AmazonObjectMapperConfigurer.createConfigured()
      .addMixIn(InstanceStateView.class, InstanceStateViewMixIn.class)
      .addMixIn(LoadBalancerAttributesView.class, LoadBalancerAttributesViewMixIn.class);
    factory = new MappingJsonFactory(mapper);
  }

  public static JsonParser createParser(InputStream input) throws IOException {
    return factory.createParser(input);
  }

  public static JsonParser createParser(Reader input) throws IOException {
    return factory.createParser(input);
  }

  public static <T> T decode(Class<T> c, InputStream input) throws IOException {
    try {
      TypeReference<T> ref = new TypeReference<T>() {};
      return createParser(input).readValueAs(ref);
    }
    finally {
      input.close();
    }
  }

  public static <T> T decode(Class<T> c, Reader input) throws IOException {
    try {
      TypeReference<T> ref = new TypeReference<T>() {};
      return createParser(input).readValueAs(ref);
    }
    finally {
      input.close();
    }
  }

  public static <T> T decode(Class<T> c, String json) throws IOException {
    return decode(c, new StringReader(json));
  }
}
