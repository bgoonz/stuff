<?hh

<<__NEVER_INLINE>> function P(bool $v) { print $v ? 'Y' : 'N'; }

<<__EntryPoint>>
function main_1025() {
$i = 0;
 print ++$i;
 print "\t";
 try { P(HH\Lib\Legacy_FIXME\lte('php', true)); } catch (Throwable $_) { print 'E'; }
 $a = 1;
 $a = 't';
 $a = 'php';
 try { P(HH\Lib\Legacy_FIXME\lte($a, true)); } catch (Throwable $_) { print 'E'; }
 $b = 1;
 $b = 't';
 $b = true;
 try { P(HH\Lib\Legacy_FIXME\lte('php', $b)); } catch (Throwable $_) { print 'E'; }
 try { P(HH\Lib\Legacy_FIXME\lte($a, $b)); } catch (Throwable $_) { print 'E'; }
 print "\t";
 print "'php' <= true	";
 print "\n";
 print ++$i;
 print "\t";
 try { P(HH\Lib\Legacy_FIXME\lte('php', false)); } catch (Throwable $_) { print 'E'; }
 $a = 1;
 $a = 't';
 $a = 'php';
 try { P(HH\Lib\Legacy_FIXME\lte($a, false)); } catch (Throwable $_) { print 'E'; }
 $b = 1;
 $b = 't';
 $b = false;
 try { P(HH\Lib\Legacy_FIXME\lte('php', $b)); } catch (Throwable $_) { print 'E'; }
 try { P(HH\Lib\Legacy_FIXME\lte($a, $b)); } catch (Throwable $_) { print 'E'; }
 print "\t";
 print "'php' <= false	";
 print "\n";
 print ++$i;
 print "\t";
 try { P(HH\Lib\Legacy_FIXME\lte('php', 1)); } catch (Throwable $_) { print 'E'; }
 $a = 1;
 $a = 't';
 $a = 'php';
 try { P(HH\Lib\Legacy_FIXME\lte($a, 1)); } catch (Throwable $_) { print 'E'; }
 $b = 1;
 $b = 't';
 $b = 1;
 try { P(HH\Lib\Legacy_FIXME\lte('php', $b)); } catch (Throwable $_) { print 'E'; }
 try { P(HH\Lib\Legacy_FIXME\lte($a, $b)); } catch (Throwable $_) { print 'E'; }
 print "\t";
 print "'php' <= 1	";
 print "\n";
 print ++$i;
 print "\t";
 try { P(HH\Lib\Legacy_FIXME\lte('php', 0)); } catch (Throwable $_) { print 'E'; }
 $a = 1;
 $a = 't';
 $a = 'php';
 try { P(HH\Lib\Legacy_FIXME\lte($a, 0)); } catch (Throwable $_) { print 'E'; }
 $b = 1;
 $b = 't';
 $b = 0;
 try { P(HH\Lib\Legacy_FIXME\lte('php', $b)); } catch (Throwable $_) { print 'E'; }
 try { P(HH\Lib\Legacy_FIXME\lte($a, $b)); } catch (Throwable $_) { print 'E'; }
 print "\t";
 print "'php' <= 0	";
 print "\n";
 print ++$i;
 print "\t";
 try { P(HH\Lib\Legacy_FIXME\lte('php', -1)); } catch (Throwable $_) { print 'E'; }
 $a = 1;
 $a = 't';
 $a = 'php';
 try { P(HH\Lib\Legacy_FIXME\lte($a, -1)); } catch (Throwable $_) { print 'E'; }
 $b = 1;
 $b = 't';
 $b = -1;
 try { P(HH\Lib\Legacy_FIXME\lte('php', $b)); } catch (Throwable $_) { print 'E'; }
 try { P(HH\Lib\Legacy_FIXME\lte($a, $b)); } catch (Throwable $_) { print 'E'; }
 print "\t";
 print "'php' <= -1	";
 print "\n";
 print ++$i;
 print "\t";
 try { P('php'<='1'); } catch (Throwable $_) { print 'E'; }
 $a = 1;
 $a = 't';
 $a = 'php';
 try { P($a <='1'); } catch (Throwable $_) { print 'E'; }
 $b = 1;
 $b = 't';
 $b = '1';
 try { P('php'<=$b); } catch (Throwable $_) { print 'E'; }
 try { P($a <=$b); } catch (Throwable $_) { print 'E'; }
 print "\t";
 print "'php' <= '1'	";
 print "\n";
 print ++$i;
 print "\t";
 try { P('php'<='0'); } catch (Throwable $_) { print 'E'; }
 $a = 1;
 $a = 't';
 $a = 'php';
 try { P($a <='0'); } catch (Throwable $_) { print 'E'; }
 $b = 1;
 $b = 't';
 $b = '0';
 try { P('php'<=$b); } catch (Throwable $_) { print 'E'; }
 try { P($a <=$b); } catch (Throwable $_) { print 'E'; }
 print "\t";
 print "'php' <= '0'	";
 print "\n";
 print ++$i;
 print "\t";
 try { P('php'<='-1'); } catch (Throwable $_) { print 'E'; }
 $a = 1;
 $a = 't';
 $a = 'php';
 try { P($a <='-1'); } catch (Throwable $_) { print 'E'; }
 $b = 1;
 $b = 't';
 $b = '-1';
 try { P('php'<=$b); } catch (Throwable $_) { print 'E'; }
 try { P($a <=$b); } catch (Throwable $_) { print 'E'; }
 print "\t";
 print "'php' <= '-1'	";
 print "\n";
 print ++$i;
 print "\t";
 try { P(HH\Lib\Legacy_FIXME\lte('php', null)); } catch (Throwable $_) { print 'E'; }
 $a = 1;
 $a = 't';
 $a = 'php';
 try { P(HH\Lib\Legacy_FIXME\lte($a, null)); } catch (Throwable $_) { print 'E'; }
 $b = 1;
 $b = 't';
 $b = null;
 try { P(HH\Lib\Legacy_FIXME\lte('php', $b)); } catch (Throwable $_) { print 'E'; }
 try { P(HH\Lib\Legacy_FIXME\lte($a, $b)); } catch (Throwable $_) { print 'E'; }
 print "\t";
 print "'php' <= null	";
 print "\n";
 print ++$i;
 print "\t";
 try { P('php'<=darray[]); } catch (Throwable $_) { print 'E'; }
 $a = 1;
 $a = 't';
 $a = 'php';
 try { P($a <=darray[]); } catch (Throwable $_) { print 'E'; }
 $b = 1;
 $b = 't';
 $b = darray[];
 try { P('php'<=$b); } catch (Throwable $_) { print 'E'; }
 try { P($a <=$b); } catch (Throwable $_) { print 'E'; }
 print "\t";
 print "'php' <= array()	";
 print "\n";
 print ++$i;
 print "\t";
 try { P('php'<=varray[1]); } catch (Throwable $_) { print 'E'; }
 $a = 1;
 $a = 't';
 $a = 'php';
 try { P($a <=varray[1]); } catch (Throwable $_) { print 'E'; }
 $b = 1;
 $b = 't';
 $b = varray[1];
 try { P('php'<=$b); } catch (Throwable $_) { print 'E'; }
 try { P($a <=$b); } catch (Throwable $_) { print 'E'; }
 print "\t";
 print "'php' <= array(1)	";
 print "\n";
 print ++$i;
 print "\t";
 try { P('php'<=varray[2]); } catch (Throwable $_) { print 'E'; }
 $a = 1;
 $a = 't';
 $a = 'php';
 try { P($a <=varray[2]); } catch (Throwable $_) { print 'E'; }
 $b = 1;
 $b = 't';
 $b = varray[2];
 try { P('php'<=$b); } catch (Throwable $_) { print 'E'; }
 try { P($a <=$b); } catch (Throwable $_) { print 'E'; }
 print "\t";
 print "'php' <= array(2)	";
 print "\n";
 print ++$i;
 print "\t";
 try { P('php'<=varray['1']); } catch (Throwable $_) { print 'E'; }
 $a = 1;
 $a = 't';
 $a = 'php';
 try { P($a <=varray['1']); } catch (Throwable $_) { print 'E'; }
 $b = 1;
 $b = 't';
 $b = varray['1'];
 try { P('php'<=$b); } catch (Throwable $_) { print 'E'; }
 try { P($a <=$b); } catch (Throwable $_) { print 'E'; }
 print "\t";
 print "'php' <= array('1')	";
 print "\n";
 print ++$i;
 print "\t";
 try { P('php'<=darray['0' => '1']); } catch (Throwable $_) { print 'E'; }
 $a = 1;
 $a = 't';
 $a = 'php';
 try { P($a <=darray['0' => '1']); } catch (Throwable $_) { print 'E'; }
 $b = 1;
 $b = 't';
 $b = darray['0' => '1'];
 try { P('php'<=$b); } catch (Throwable $_) { print 'E'; }
 try { P($a <=$b); } catch (Throwable $_) { print 'E'; }
 print "\t";
 print "'php' <= array('0' => '1')	";
 print "\n";
 print ++$i;
 print "\t";
 try { P('php'<=varray['a']); } catch (Throwable $_) { print 'E'; }
 $a = 1;
 $a = 't';
 $a = 'php';
 try { P($a <=varray['a']); } catch (Throwable $_) { print 'E'; }
 $b = 1;
 $b = 't';
 $b = varray['a'];
 try { P('php'<=$b); } catch (Throwable $_) { print 'E'; }
 try { P($a <=$b); } catch (Throwable $_) { print 'E'; }
 print "\t";
 print "'php' <= array('a')	";
 print "\n";
 print ++$i;
 print "\t";
 try { P('php'<=darray['a' => 1]); } catch (Throwable $_) { print 'E'; }
 $a = 1;
 $a = 't';
 $a = 'php';
 try { P($a <=darray['a' => 1]); } catch (Throwable $_) { print 'E'; }
 $b = 1;
 $b = 't';
 $b = darray['a' => 1];
 try { P('php'<=$b); } catch (Throwable $_) { print 'E'; }
 try { P($a <=$b); } catch (Throwable $_) { print 'E'; }
 print "\t";
 print "'php' <= array('a' => 1)	";
 print "\n";
 print ++$i;
 print "\t";
 try { P('php'<=darray['b' => 1]); } catch (Throwable $_) { print 'E'; }
 $a = 1;
 $a = 't';
 $a = 'php';
 try { P($a <=darray['b' => 1]); } catch (Throwable $_) { print 'E'; }
 $b = 1;
 $b = 't';
 $b = darray['b' => 1];
 try { P('php'<=$b); } catch (Throwable $_) { print 'E'; }
 try { P($a <=$b); } catch (Throwable $_) { print 'E'; }
 print "\t";
 print "'php' <= array('b' => 1)	";
 print "\n";
 print ++$i;
 print "\t";
 try { P('php'<=darray['a' => 1, 'b' => 2]); } catch (Throwable $_) { print 'E'; }
 $a = 1;
 $a = 't';
 $a = 'php';
 try { P($a <=darray['a' => 1, 'b' => 2]); } catch (Throwable $_) { print 'E'; }
 $b = 1;
 $b = 't';
 $b = darray['a' => 1, 'b' => 2];
 try { P('php'<=$b); } catch (Throwable $_) { print 'E'; }
 try { P($a <=$b); } catch (Throwable $_) { print 'E'; }
 print "\t";
 print "'php' <= array('a' => 1, 'b' => 2)	";
 print "\n";
 print ++$i;
 print "\t";
 try { P('php'<=varray[darray['a' => 1]]); } catch (Throwable $_) { print 'E'; }
 $a = 1;
 $a = 't';
 $a = 'php';
 try { P($a <=varray[darray['a' => 1]]); } catch (Throwable $_) { print 'E'; }
 $b = 1;
 $b = 't';
 $b = varray[darray['a' => 1]];
 try { P('php'<=$b); } catch (Throwable $_) { print 'E'; }
 try { P($a <=$b); } catch (Throwable $_) { print 'E'; }
 print "\t";
 print "'php' <= array(array('a' => 1))	";
 print "\n";
 print ++$i;
 print "\t";
 try { P('php'<=varray[darray['b' => 1]]); } catch (Throwable $_) { print 'E'; }
 $a = 1;
 $a = 't';
 $a = 'php';
 try { P($a <=varray[darray['b' => 1]]); } catch (Throwable $_) { print 'E'; }
 $b = 1;
 $b = 't';
 $b = varray[darray['b' => 1]];
 try { P('php'<=$b); } catch (Throwable $_) { print 'E'; }
 try { P($a <=$b); } catch (Throwable $_) { print 'E'; }
 print "\t";
 print "'php' <= array(array('b' => 1))	";
 print "\n";
 print ++$i;
 print "\t";
 try { P('php'<='php'); } catch (Throwable $_) { print 'E'; }
 $a = 1;
 $a = 't';
 $a = 'php';
 try { P($a <='php'); } catch (Throwable $_) { print 'E'; }
 $b = 1;
 $b = 't';
 $b = 'php';
 try { P('php'<=$b); } catch (Throwable $_) { print 'E'; }
 try { P($a <=$b); } catch (Throwable $_) { print 'E'; }
 print "\t";
 print "'php' <= 'php'	";
 print "\n";
 print ++$i;
 print "\t";
 try { P('php'<=''); } catch (Throwable $_) { print 'E'; }
 $a = 1;
 $a = 't';
 $a = 'php';
 try { P($a <=''); } catch (Throwable $_) { print 'E'; }
 $b = 1;
 $b = 't';
 $b = '';
 try { P('php'<=$b); } catch (Throwable $_) { print 'E'; }
 try { P($a <=$b); } catch (Throwable $_) { print 'E'; }
 print "\t";
 print "'php' <= ''	";
 print "\n";
}
