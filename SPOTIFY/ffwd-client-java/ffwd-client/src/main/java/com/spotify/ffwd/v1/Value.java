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

import com.google.auto.value.AutoValue;
import com.google.protobuf.ByteString;
import java.util.function.Function;


/**
 * The actual value of the data point.
 * Currently we support two value types:
 * Double and Distribution.
 *
 */
public abstract class Value {

  Value() {}


  public static Value doubleValue(double value) {
    return DoubleValue.create(value);
  }

  public static Value distributionValue(ByteString byteString) {
    return DistributionValue.create(byteString);
  }


  public abstract <T> T match(
      Function<? super Double, T> doubleFunction,
      Function<? super ByteString, T> distributionFunction,
      Function<? super Value, T> defaultFunction);


  @AutoValue
  abstract static class DoubleValue extends Value {

    DoubleValue() {}

    @Override
    public final <T> T match(
        Function<? super Double, T> doubleFunction,
        Function<? super ByteString, T> distributionFunction,
        Function<? super Value, T> defaultFunction) {
      return doubleFunction.apply(getValue());
    }


    static DoubleValue create(double value) {
      return new AutoValue_Value_DoubleValue(value);
    }


    abstract double getValue();
  }

  @AutoValue
  abstract static class DistributionValue extends Value {

    DistributionValue() {}

    @Override
    public final <T> T match(
        Function<? super Double, T> doubleFunction,
        Function<? super ByteString, T> distributionFunction,
        Function<? super Value, T> defaultFunction) {
      return distributionFunction.apply(getValue());
    }


    static DistributionValue create(ByteString value) {
      return new AutoValue_Value_DistributionValue(value);
    }


    abstract ByteString getValue();
  }

}
