<?hh
/* Prototype  : int vfprintf  ( resource $handle  , string $format , array $args  )
 * Description: Write a formatted string to a stream
 * Source code: ext/standard/formatted_print.c
*/
<<__EntryPoint>> function main(): void {
echo "*** Testing vfprintf() : basic functionality - using bool format ***\n";

// Initialise all required variables
$format = "format";
$format1 = "%b";
$format2 = "%b %b";
$format3 = "%b %b %b";
$arg1 = varray[TRUE];
$arg2 = varray[TRUE,FALSE];
$arg3 = varray[TRUE,FALSE,TRUE];

/* creating dumping file */
$data_file = __SystemLib\hphp_test_tmppath('vfprintf_basic4.txt');
if (!($fp = fopen($data_file, 'wt')))
   return;

vfprintf($fp, $format1,$arg1);
fprintf($fp, "\n");

vfprintf($fp, $format2,$arg2);
fprintf($fp, "\n");

vfprintf($fp, $format3,$arg3);
fprintf($fp, "\n");

fclose($fp);
print_r(file_get_contents($data_file));

unlink($data_file);
echo "===DONE===\n";
}
