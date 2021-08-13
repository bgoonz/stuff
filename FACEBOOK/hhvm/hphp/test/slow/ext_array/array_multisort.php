<?hh

function a() {
  $ar1 = varray[10, 100, 100, 0];
  $ar2 = varray[1, 3, 2, 4];
  array_multisort2(inout $ar1, inout $ar2);
  var_dump($ar1);
  var_dump($ar2);
}

function b() {
  $ar0 = varray["10", 11, 100, 100, "a"];
  $ar1 = varray[1, 2, "2", 3, 1];
  $asc = SORT_ASC;
  $string = SORT_STRING;
  $numeric = SORT_NUMERIC;
  $desc = SORT_DESC;
  array_multisort6(inout $ar0, inout $asc, inout $string, inout $ar1, inout $numeric, inout $desc);
  $ar = varray[
    $ar0,
    $ar1,
  ];
  var_dump($ar);
}

function c() {
  $array = varray["Alpha", "atomic", "Beta", "bank"];
  $array_lowercase = array_map(strtolower<>, $array);
  $asc = SORT_ASC;
  $string = SORT_STRING;
  array_multisort4(inout $array_lowercase,
                   inout $asc, inout $string, inout $array);
  var_dump($array);
}



<<__EntryPoint>>
function main_array_multisort() {
a();
b();
c();
}
