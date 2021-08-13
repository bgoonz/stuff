<?hh // partial

namespace {

// This doc comment block generated by idl/sysdoc.php
/**
 * ( excerpt from http://php.net/manual/en/class.countable.php )
 *
 * Classes implementing Countable can be used with the count() function.
 *
 */
interface Countable {
  // This doc comment block generated by idl/sysdoc.php
  /**
   * ( excerpt from http://php.net/manual/en/countable.count.php )
   *
   * This method is executed when using the count() function on an object
   * implementing Countable.
   *
   * @return     mixed   The custom count as an integer.
   *
   *                     The return value is cast to an integer.
   */
  public function count();
}

}

namespace HH\Rx {

interface Countable extends \Countable {
  public function count()[]: int;
}

}
