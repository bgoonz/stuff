<?hh
<<__EntryPoint>> function main(): void {
$d1 = 1.1;
$d2 = 434234.234;

$c = $d2 / $d1;
var_dump($c);

$d1 = 1.1;
$d2 = "434234.234";

$c = HH\Lib\Legacy_FIXME\cast_for_arithmetic($d2) / $d1;
var_dump($c);

$d1 = "1.1";
$d2 = "434234.234";

$c = HH\Lib\Legacy_FIXME\cast_for_arithmetic($d2) / HH\Lib\Legacy_FIXME\cast_for_arithmetic($d1);
var_dump($c);

echo "Done\n";
}
