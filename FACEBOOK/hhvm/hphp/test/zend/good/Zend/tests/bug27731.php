<?hh <<__EntryPoint>> function main(): void {
error_reporting(E_ALL ^ E_NOTICE);
@error_reporting(E_WARNING);
var_dump(error_reporting());
}
