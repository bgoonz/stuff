<?hh

function same($left, $right) {
  echo ($left === $right) ? "true\n" : "false\n";
}

function eq($left, $right) {
  echo (HH\Lib\Legacy_FIXME\eq($left, $right)) ? "true\n" : "false\n";
}

function neq($left, $right) {
  echo (HH\Lib\Legacy_FIXME\neq($left, $right)) ? "true\n" : "false\n";
}
<<__EntryPoint>> function main(): void {
same(false, 0);
neq(0, "b");
eq(true, -1);
}
