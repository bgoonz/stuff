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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;


import com.google.protobuf.ByteString;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;
import org.junit.jupiter.api.Test;

public class ValueTest {
   private static final double DOUBLE_VAL = 0.976;
   private static final ByteString  DISTRIBUTION_VAL = createSample();


  @Test
  public void testDoubleValue(){
     Value  value = Value.doubleValue(DOUBLE_VAL);
     assertTrue(value instanceof Value.DoubleValue);
  }

   @Test
   public void testDistributionValue(){
    Value value = Value.distributionValue(DISTRIBUTION_VAL);
    assertTrue(value instanceof Value.DistributionValue);
   }

   @Test
   public void testMatch(){
    List<Value> expected = new ArrayList<>();
    Value value1 = Value.doubleValue(DOUBLE_VAL);
    expected.add(value1);
    Value value2 = Value.doubleValue(DOUBLE_VAL*2);
    expected.add(value2);
    Value value3 = Value.distributionValue(createSample());
    expected.add(value3);
    List<Object> actual = new ArrayList<>();
    for (Value val : expected){
       val.match(
           new Function<Double, Object>() {
             @Override
             public Object apply(Double arg) {
               actual.add(Value.doubleValue(arg));
               return null;
             }
           },
           new Function<ByteString, Object>() {
             @Override
             public Object apply(ByteString arg) {
               actual.add(Value.distributionValue(arg));
               return null;
             }
           },
           new Function<Value, Object>() {
             @Override
             public Object apply(Value arg) {
               actual.add(arg);
               return null;
             }
           }
       );
    }
     assertEquals(expected, actual);

   }

  private static ByteString createSample(){
    final String data = "FAKEDISTRIBUTIONFAKEDISTRIBUTION";
    final byte [] bytes = data.getBytes(StandardCharsets.UTF_8);
    ByteBuffer out = ByteBuffer.allocate(bytes.length);
    out.put(bytes);
    return ByteString.copyFrom(out.array());
  }



}
