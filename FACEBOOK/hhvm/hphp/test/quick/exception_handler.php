<?hh

function exn_throw($exn) {
  throw new Exception('throwing second');
}
<<__EntryPoint>>
function main() {
  set_exception_handler(exn_throw<>);
  throw new Exception('throwing first');
}
