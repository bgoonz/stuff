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

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;

public class ProxyHelper {
  private ProxyHelper() {}

  private static Throwable findCause(Throwable e) {
    Throwable t = e;
    while (t != null && t.getClass().getName().startsWith("java.lang.reflect."))
      t = t.getCause();
    return (t == null) ? e : t;
  }

  @SuppressWarnings("unchecked")
  public static <T> T wrapper(final Class<T> ctype, final T delegate, final Object overrides) {
    InvocationHandler handler = new InvocationHandler() {
      @Override
      public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        try {
          Method m = overrides.getClass().getMethod(method.getName(), method.getParameterTypes());
          return m.invoke(overrides, args);
        }
        catch(NoSuchMethodException e) {
          try {
            return method.invoke(delegate, args);
          }
          catch (Throwable t) {
            throw findCause(t);
          }
        }
        catch(Throwable t) {
          throw findCause(t);
        }
      }
    };

    return (T) Proxy.newProxyInstance(ctype.getClassLoader(), new Class[]{ctype}, handler);
  }

  @SuppressWarnings("unchecked")
  public static <T> T unsupported(final Class<T> ctype) {
    InvocationHandler handler = new InvocationHandler() {
      @Override
      public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        throw new UnsupportedOperationException(ctype.getName() + "." + method.getName());
      }
    };
    return (T) Proxy.newProxyInstance(ctype.getClassLoader(), new Class[]{ctype}, handler);
  }

  @SuppressWarnings("unchecked")
  public static <T> T unsupported(final Class<T> ctype, final Object overrides) {
    InvocationHandler handler = new InvocationHandler() {
      @Override
      public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        try {
          Method m = overrides.getClass().getMethod(method.getName(), method.getParameterTypes());
          return m.invoke(overrides, args);
        }
        catch(NoSuchMethodException e) {
          throw new UnsupportedOperationException(ctype.getName() + "." + method.getName());
        }
        catch(Throwable t) {
          throw findCause(t);
        }
      }
    };

    return (T) Proxy.newProxyInstance(ctype.getClassLoader(), new Class[]{ctype}, handler);
  }
}
