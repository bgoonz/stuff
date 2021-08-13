<?hh
// Copyright 2004-present Facebook. All Rights Reserved.

class Cls {
  function func() { echo "func called\n"; }
  static function intercept1($_1, $_2, inout $_3) {
    return shape('value' => null);
  }
  static function intercept2($_1, $_2, inout $_3) {
    var_dump(debug_backtrace());
    return shape('value' => null);
  }
  static function intercept3($_1, $_2, inout $_3) {
    throw new Exception("intercept3");
  }
}

function getCls() { return new Cls; }

function test($s) {
  fb_intercept2('Cls::func', "Cls::$s");
  try {
    getCls()->func();
  } catch (Exception $e) {
    echo "Caught exception: " . $e->getMessage() . "\n";
  }
  echo "$s DONE\n";
}
<<__EntryPoint>> function main(): void {
  test('intercept1');
  test('intercept2');
  test('intercept3');
}
