<?hh
/* Prototype  : int stripos ( string $haystack, string $needle [, int $offset] );
 * Description: Find position of first occurrence of a case-insensitive string
 * Source code: ext/standard/string.c
*/

/* Test stripos() function by passing heredoc string containing quotes for haystack 
 *  and with various needles & offsets
*/
<<__EntryPoint>> function main(): void {
echo "*** Testing stripos() function: with heredoc strings ***\n";
echo "-- With heredoc string containing quote & slash chars --\n";
$quote_char_str = <<<EOD
it's bright,but i cann't see it.
"things in double quote"
'things in single quote'
this\line is /with\slashs
EOD;
var_dump( stripos($quote_char_str, "line") );
var_dump( stripos($quote_char_str, 'things') );
var_dump( stripos($quote_char_str, 'things', 0) );
var_dump( stripos($quote_char_str, "things", 20) );
echo "*** Done ***";
}
