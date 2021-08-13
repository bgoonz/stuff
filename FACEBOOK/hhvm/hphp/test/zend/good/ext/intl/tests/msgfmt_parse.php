<?hh

/*
 * Format a number using misc locales/patterns.
 */

function ut_main()
{
    $locales = darray[
        'en_US' => "{0,number,integer} monkeys on {1,number,integer} trees make {2,number} monkeys per tree",
        'ru_UA' => "{0,number,integer} мавп на {1,number,integer} деревах це {2,number} мавпи на кожному деревi",
        'de' => "{0,number,integer} Affen über {1,number,integer} Bäume um {2,number} Affen pro Baum",
        'en_UK' => "{0,number,integer} monkeys on {1,number,integer} trees make {2,number} monkeys per tree",
	'root' => '{0,whatever} would not work!',
	'fr' => 'C\'est {0,number,integer}',
    ];

	$results = darray[
		'en_US' => "4,560 monkeys on 123 trees make 37.073 monkeys per tree",
		'ru_UA' => "4 560 мавп на 123 деревах це 37,073 мавпи на кожному деревi",
		'de' => "4.560 Affen über 123 Bäume um 37,073 Affen pro Baum",
		'en_UK' => "4,560 monkeys on 123 trees make 37.073 monkeys per tree",
		'root' => "4,560 monkeys on 123 trees make 37.073 monkeys per tree",
		'fr' => "C'est 42",

	];

	$str_res = '';

    foreach( $locales as $locale => $pattern )
    {
        $str_res .= "\nLocale is: $locale\n";
        $fmt = ut_msgfmt_create( $locale, $pattern );
		if(!$fmt) {
			$str_res .= dump(intl_get_error_message())."\n";
			continue;
		}
        $str_res .= dump( ut_msgfmt_parse( $fmt, $results[$locale] ) ) . "\n";
		$str_res .= dump( ut_msgfmt_parse_message($locale, $pattern, $results[$locale])) . "\n";
    }
    return $str_res;
}

<<__EntryPoint>>
function main_entry(): void {
	include_once( 'ut_common.inc' );
  // Run the test
  ut_run();
}
