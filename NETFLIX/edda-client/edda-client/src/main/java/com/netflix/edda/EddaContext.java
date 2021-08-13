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

import java.util.concurrent.atomic.AtomicReference;

import javax.inject.Inject;
import javax.inject.Singleton;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.netflix.config.ConfigurationManager;

import com.netflix.iep.http.RxHttp;

@Singleton
public class EddaContext {
  private static final Logger LOGGER = LoggerFactory.getLogger(EddaContext.class);
  private static final String ENABLED_PROP = "edda-client.nflx.enabled";
  private static final String CONFIG_FILE = "edda-client.properties";

  public class EddaContextInstance {
    private final RxHttp rxHttp;
    protected EddaContextInstance(RxHttp rxHttp) {
      this.rxHttp = rxHttp;
      try {
        if (ConfigurationManager.getConfigInstance().getBoolean(ENABLED_PROP, true)) {
          LOGGER.debug("loading properties: " + CONFIG_FILE);
          ConfigurationManager.loadPropertiesFromResources(CONFIG_FILE);
        }
        else {
          LOGGER.debug("context not enabled, set " + ENABLED_PROP + "=true to enable");
        }
      }
      catch (java.io.IOException e) {
        LOGGER.debug("context creation failed", e);
        throw new RuntimeException(e);
      }
    }
    public RxHttp getRxHttp() {
      return rxHttp;
    }
  }

  private static final AtomicReference<EddaContextInstance> CONTEXT =
    new AtomicReference<EddaContextInstance>(null);

  protected static EddaContextInstance getContext() {
    EddaContextInstance ctx = CONTEXT.get();
    if (ctx == null) throw new IllegalStateException("EddaContext not initialized");
    return ctx;
  }

  @Inject
  public EddaContext(RxHttp rxHttp) {
    CONTEXT.set(new EddaContextInstance(rxHttp));
  }
}
