<?hh <<__EntryPoint>> function main(): void {
echo "Test 10: EXSLT Support";

$dom = new DOMDocument();
  $dom->load(dirname(__FILE__)."/exslt.xsl");
  $proc = new xsltprocessor;
  $xsl = $proc->importStylesheet($dom);

  $xml = new DomDocument();
  $xml->load(dirname(__FILE__)."/exslt.xml");

  print $proc->transformToXML($xml);
}
