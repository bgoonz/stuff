/*
 * Copyright (c) 2014 Spotify AB.
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
package com.spotify.crtauth.agentsigner;

import com.google.common.annotations.VisibleForTesting;
import com.spotify.crtauth.Fingerprint;
import com.spotify.crtauth.exceptions.KeyNotFoundException;
import com.spotify.crtauth.exceptions.SignerException;
import com.spotify.crtauth.signer.Signer;
import org.apache.sshd.agent.SshAgent;
import org.apache.sshd.agent.unix.AgentClient;

import java.io.IOException;
import java.security.NoSuchAlgorithmException;
import java.security.PublicKey;
import java.security.interfaces.RSAPublicKey;
import java.util.List;

/**
 * Instances of this class can be used to connect to the current user's
 * ssh-agent socket and sign data.
 */
public class AgentSigner implements Signer {
  private SshAgent sshAgent;

  public AgentSigner() {
    try {
      this.sshAgent = new AgentClient(System.getenv("SSH_AUTH_SOCK"));
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }

  @Override
  public byte[] sign(byte[] data, Fingerprint fingerprint) throws KeyNotFoundException, SignerException {
    PublicKey publicKey;
    try {
      publicKey = getKeyFromFingerprint(fingerprint, sshAgent.getIdentities());
    } catch (Exception exception) {
      throw new SignerException();
    }
    if (publicKey == null) {
      throw new KeyNotFoundException();
    }
    byte[] signed;
    try {
      signed = sshAgent.sign(publicKey, data);
    } catch (Exception e) {
      throw new SignerException();
    }
    return signed;
  }

  private static PublicKey getKeyFromFingerprint(Fingerprint referenceFingerprint,
                                                 List<SshAgent.Pair<PublicKey, String>> identities)
      throws IOException, NoSuchAlgorithmException {
    for (SshAgent.Pair<PublicKey, String> identity : identities) {
      RSAPublicKey candidate = (RSAPublicKey)identity.getFirst();
      if (referenceFingerprint.matches(candidate)) {
        return candidate;
      }
    }
    return null;
  }
}
