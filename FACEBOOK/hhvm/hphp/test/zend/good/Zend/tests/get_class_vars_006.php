<?hh

class A {
	protected $a = 1;
}

class B extends A { }

class C extends B { }

class D extends B {
	public function __construct() {
		var_dump(get_class_vars('A'));
		var_dump(get_class_vars('B'));
		var_dump(get_class_vars('C'));		
	}
}

<<__EntryPoint>>
function main_entry(): void {

  var_dump(get_class_vars('A'));
  var_dump(get_class_vars('B'));
  var_dump(get_class_vars('C'));

  print "---\n";

  new D;
}
