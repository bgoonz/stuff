<?hh
// Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.

enum F : int {
  use E;
  A = 1;
}

<<__EntryPoint>>
function main() : void {
  echo F::A . "\n";
}
