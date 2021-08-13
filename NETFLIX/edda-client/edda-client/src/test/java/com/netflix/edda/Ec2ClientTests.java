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

import java.util.Map;
import java.util.HashMap;

import static org.junit.Assert.*;

import com.netflix.archaius.api.Config;
import com.netflix.archaius.api.PropertyFactory;
import com.netflix.archaius.config.EmptyConfig;
import org.junit.BeforeClass;
import org.junit.AfterClass;
import org.junit.Test;

import io.netty.buffer.ByteBuf;
import io.reactivex.netty.RxNetty;
import io.reactivex.netty.protocol.http.server.HttpServer;
import io.reactivex.netty.protocol.http.server.file.ClassPathFileRequestHandler;

import com.amazonaws.services.ec2.AmazonEC2;
import com.amazonaws.services.ec2.model.*;

import com.netflix.archaius.DefaultPropertyFactory;

import com.netflix.iep.config.DynamicPropertiesConfiguration;
import com.netflix.iep.config.TestResourceConfiguration;
import com.netflix.iep.http.RxHttp;

public class Ec2ClientTests {
  private static HttpServer<ByteBuf, ByteBuf> server;

  private static EddaContext eddaContext = new EddaContext(new RxHttp(EmptyConfig.INSTANCE, null));
  private static DynamicPropertiesConfiguration config = null;

  @BeforeClass
  public static void setUp() throws Exception {
    server = RxNetty.createHttpServer(0, new ClassPathFileRequestHandler(".")).start();

    final String userDir = System.getProperty("user.dir");
    Map<String,String> subs = new HashMap<String,String>() {{
      put("user.dir", userDir);
      put("resources.url", "http://localhost:" + server.getServerPort());
    }};

    Config cfg = TestResourceConfiguration.load("edda.test.properties", subs);
    PropertyFactory factory = new DefaultPropertyFactory(cfg);
    config = new DynamicPropertiesConfiguration(factory);
    //config.init();
  }

  @AfterClass
  public static void tearDown() throws Exception {
    config.destroy();
  }

  @Test
  public void describeSubnets() {
    AmazonEC2 client = AwsClientFactory.newEc2Client();
    DescribeSubnetsResult res = client.describeSubnets();
    assertEquals("size", res.getSubnets().size(), 8);

    String id = "subnet-30ef1559";
    res = client.describeSubnets(new DescribeSubnetsRequest().withSubnetIds(id));
    assertEquals("size", res.getSubnets().size(), 1);
    assertEquals("id", res.getSubnets().get(0).getSubnetId(), id);

    String id2 = "subnet-0962c560";
    res = client.describeSubnets(new DescribeSubnetsRequest().withSubnetIds(id, id2));
    assertEquals("size", res.getSubnets().size(), 2);
    assertEquals("id1", res.getSubnets().get(0).getSubnetId(), id);
    assertEquals("id2", res.getSubnets().get(1).getSubnetId(), id2);
  }
}
