<?hh
<<__EntryPoint>>
function main_entry(): void {

  ini_set("intl.error_level", E_WARNING);

  $tr = Transliterator::create("Katakana-Latin");
  $orstr = "オーシャンビュー";
  $new_str = $tr->transliterate($orstr);

  $revtr = $tr->createInverse();
  $recovstr = $revtr->transliterate($new_str);

  $revtr2 = transliterator_create_inverse($tr);
  $recovstr2 = $revtr2->transliterate($new_str);

  echo $orstr,"\n";
  echo $new_str,"\n";
  echo $recovstr,"\n";

  var_dump(HH\Lib\Legacy_FIXME\eq(($orstr == $recovstr), $recovstr2));

  echo "Done.\n";
}
