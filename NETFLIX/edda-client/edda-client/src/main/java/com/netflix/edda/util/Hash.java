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
package com.netflix.edda.util;

import java.math.BigInteger;
import java.io.UnsupportedEncodingException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class Hash {
  private Hash() {}

  public static BigInteger md5(String input) throws UnsupportedEncodingException {
    return md5(input.getBytes("UTF-8"));
  }

  public static BigInteger md5(byte[] input) {
    return computeHash("MD5", input);
  }

  public static BigInteger sha1(String input) throws UnsupportedEncodingException {
    return sha1(input.getBytes("UTF-8"));
  }

  public static BigInteger sha1(byte[] input) {
    return computeHash("SHA1", input);
  }

  private static BigInteger computeHash(String algorithm, byte[] bytes) {
    try {
      MessageDigest md = MessageDigest.getInstance(algorithm);
      md.update(bytes);
      return new BigInteger(1, md.digest());
    }
    catch (NoSuchAlgorithmException e) {
      throw new RuntimeException("algorithm " + algorithm + " not found", e);
    }
  }
}
