<?hh

class Bar {
}
<<__EntryPoint>> function main(): void {
$b = new Bar;

var_dump($b == NULL);
var_dump($b != NULL);
var_dump(HH\Lib\Legacy_FIXME\eq($b, true));
var_dump(HH\Lib\Legacy_FIXME\neq($b, true));
var_dump($b == false);
var_dump($b != false);
var_dump($b == "");
var_dump($b != "");


echo "Done\n";
}
