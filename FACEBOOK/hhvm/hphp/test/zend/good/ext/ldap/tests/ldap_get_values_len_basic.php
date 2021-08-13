<?hh
<<__EntryPoint>> function main(): void {
require "connect.inc";
$link = ldap_connect_and_bind(test_host(), test_port(), test_user(), test_passwd(), test_protocol_version());
$base = test_base();
insert_dummy_data($link, $base);
$result = ldap_search($link, "$base", "(o=test)");
$entry = ldap_first_entry($link, $result);
var_dump(
    ldap_get_values_len($link, $entry, "o")
);
echo "===DONE===\n";
//--remove_dummy_data($link, $base);
}
