<?hh // partial
/**
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the "hack" directory of this source tree.
 *
 *
 */

type X = (function(): int);

function useX(X $x): int {
  do {
    return $x();
    if (true) {
    }
  } while (true);
  return 0;
}
