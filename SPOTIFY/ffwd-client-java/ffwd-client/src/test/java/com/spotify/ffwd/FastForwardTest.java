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

package com.spotify.ffwd;

import com.spotify.ffwd.v1.Metric;
import java.io.IOException;
import java.net.SocketException;
import java.net.UnknownHostException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.mockito.Spy;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.times;


public class FastForwardTest {
   private static final String KEY = "key";


   @Spy
   private FastForward client;

   private ArgumentCaptor<byte []> inputCaptor;
   private ArgumentCaptor<FastForward.Version> versionCaptor;

   @BeforeEach
   public void before() throws IOException{
     MockitoAnnotations.initMocks(this);
     inputCaptor = ArgumentCaptor.forClass(byte[].class);
     versionCaptor = ArgumentCaptor.forClass(FastForward.Version.class);
     Mockito.doNothing().when(client).sendFrame(inputCaptor.capture(), versionCaptor.capture());
   }

  @Test
  public void testSendV1() throws SocketException, UnknownHostException , IOException {
    final  Metric metricV1 = FastForward.metricV1(KEY);
    client.send(metricV1);
    Mockito.verify(client,times(1)).sendFrame(Mockito.any(byte[].class) ,
        Mockito.any(FastForward.Version.class));
    assertArrayEquals(metricV1.serialize(), inputCaptor.getValue());
    assertEquals(FastForward.Version.V1,versionCaptor.getValue());
  }

   @Test
   public void testSendV0() throws SocketException, UnknownHostException , IOException {
     final  com.spotify.ffwd.Metric metricV0 = FastForward.metric(KEY);
     client.send(metricV0);
     Mockito.verify(client,times(1)).sendFrame(Mockito.any(byte[].class) ,
         Mockito.any(FastForward.Version.class));
     assertArrayEquals(metricV0.serialize(), inputCaptor.getValue());
     assertEquals(FastForward.Version.V0,versionCaptor.getValue());
   }

   @Test
   public void testMetricV0(){
     com.spotify.ffwd.Metric metricV0 = FastForward.metric(KEY);
     assertEquals(com.spotify.ffwd.Metric.class, metricV0.getClass());
     assertEquals(KEY,metricV0.getKey());
   }

   @Test
   public void testMetricV1(){
     Metric metricV1 = FastForward.metricV1(KEY);
     assertEquals(Metric.class, metricV1.getClass());
     assertEquals(KEY,metricV1.getKey());
   }


}
