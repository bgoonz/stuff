<?hh

const vec<mixed> VALS = vec[
  0,
  -10,
  1.234,
  INF,
  NAN,
  true,
  false,
  null,
  STDIN,
  "string",
  varray[42],
  dict['foobar' => false],
];

<<__EntryPoint>>
function main(): void {
  foreach(VALS as $i) {
    foreach(VALS as $j) {
      echo '$i '; var_dump($i); echo '$j '; var_dump($j);
      do_the_thing($i, $j);
    }
  }
}

function do_the_thing(mixed $i, mixed $j): void {
  if (!($i is AnyArray || $j is AnyArray)) {
    plus($i, $j);
    minus($i, $j);
    mul($i, $j);
    if (HH\Lib\Legacy_FIXME\neq($j, 0)) {
      // don't trigger div-by-zero exceptions
      div($i, $j);
    }
  }
  if (HH\Lib\Legacy_FIXME\neq($j, 0) && $j !== INF) {
    // don't trigger div-by-zero exceptions
    mod($i, $j);
  }
  pow_($i, $j);
}

function with_exn($fn): mixed {
  try {
    $fn();
  } catch (Exception $e) {
    echo "\n".$e->getMessage()."\n";
  }
}

function plus(mixed $i, mixed $j): void {
  echo 'plus<';
  with_exn(() ==> { $i + $j; }); // this should generate a notice as applicable
  with_exn(() ==> print($i += $j));
  echo ">\n";
}

function minus(mixed $i, mixed $j): void {
  echo 'minus<';
  with_exn(() ==> { $i - $j; }); // this should generate a notice as applicable
  with_exn(() ==> print($i -= $j));
  echo ">\n";
}

function div(mixed $i, mixed $j): void {
  echo 'div<';
  with_exn(() ==> { $i / $j; }); // this should generate a notice as applicable
  with_exn(() ==> print($i /= $j));
  echo ">\n";
}

function mul(mixed $i, mixed $j): void {
  echo 'mul<';
  with_exn(() ==> { $i * $j; }); // this should generate a notice as applicable
  with_exn(() ==> print($i *= $j));
  echo ">\n";
}

function mod(mixed $i, mixed $j): void {
  echo 'mod<';
  with_exn(() ==> { $i % $j; }); // this should generate a notice as applicable
  with_exn(() ==> print($i %= $j));
  echo ">\n";
}

function pow_(mixed $i, mixed $j): void {
  echo 'pow<';
  with_exn(() ==> { $i ** $j; }); // this should generate a notice as applicable
  with_exn(() ==> print($i **= $j));
  echo ">\n";
}
