<?hh <<__EntryPoint>> function main(): void {
$ch = curl_multi_init();
curl_multi_close($ch);
var_dump($ch);
echo "===DONE===\n";
}
