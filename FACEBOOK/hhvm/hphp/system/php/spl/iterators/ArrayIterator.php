<?hh

// This doc comment block generated by idl/sysdoc.php
/**
 * ( excerpt from http://php.net/manual/en/class.arrayiterator.php )
 *
 * This iterator allows unsetting and modifying values and keys while
 * iterating over Arrays and Objects.
 */
class ArrayIterator implements \HH\Iterator<mixed> {
  // $vals will always be list-like. If the original array is list-like, then
  // $keys will be null; otherwise, it will contain the original array's keys.
  // (This optimization saves memory when iterating over varrays or vecs.)
  private ?vec<arraykey> $keys = null;
  private AnyArray $vals;
  private int $index = 0;
  private int $flags;

  // This doc comment block generated by idl/sysdoc.php
  /**
   * ( excerpt from http://php.net/manual/en/arrayiterator.construct.php )
   *
   * Constructs an ArrayIterator object. Warning: This function is currently
   * not documented; only its argument list is available.
   *
   * @array      mixed   The array or object to be iterated on.
   *
   * @return     mixed   An ArrayIterator object.
   */
  public function __construct(mixed $array, ?int $flags = null) {
    if ($array is ArrayIterator) {
      $this->keys = $array->keys;
      $this->vals = $array->vals;
      $this->flags = ($flags === null) ? $array->getFlags() : $flags;
      return;
    }

    if (HH\is_any_array($array)) {
      $this->vals = $array;
    } else if (gettype($array) === 'object') {
      $this->vals = get_object_vars($array);
    } else {
      throw new InvalidArgumentException(
        "ArrayIterator takes an array or object input.",
      );
    }

    // Maintain the invariants on $keys and $vals described above.
    if (!HH\is_list_like($this->vals)) {
      $this->keys = vec[];
      foreach ($this->vals as $key => $_) {
        $this->keys[] = $key;
      }
      $this->vals = vec($this->vals);
    }
    $this->flags = ($flags === null) ? 0 : $flags;
  }

  // This doc comment block generated by idl/sysdoc.php
  /**
   * ( excerpt from http://php.net/manual/en/arrayiterator.current.php )
   *
   * Get the current array entry.
   *
   * @return     mixed   The current array entry.
   */
  public function current(): mixed {
    return $this->vals[$this->index] ?? null;
  }

  // This doc comment block generated by idl/sysdoc.php
  /**
   * ( excerpt from http://php.net/manual/en/arrayiterator.getflags.php )
   *
   * Get the current flags. Warning: This function is currently not
   * documented; only its argument list is available.
   *
   * @return     mixed   The current flags.
   */
  public function getFlags(): int {
    return $this->flags;
  }

  // This doc comment block generated by idl/sysdoc.php
  /**
   * ( excerpt from http://php.net/manual/en/arrayiterator.key.php )
   *
   * This function returns the current array key
   *
   * @return     mixed   The current array key.
   */
  public function key(): ?arraykey {
    $index = $this->index;
    if ($index < count($this->vals)) {
      $keys = $this->keys;
      return $keys is nonnull ? $keys[$index] : $index;
    }
    return null;
  }

  // This doc comment block generated by idl/sysdoc.php
  /**
   * ( excerpt from http://php.net/manual/en/arrayiterator.next.php )
   *
   * The iterator to the next entry.
   *
   * @return     mixed   No value is returned.
   */
  public function next(): void {
    if ($this->index < count($this->vals)) $this->index++;
  }

  // This doc comment block generated by idl/sysdoc.php
  /**
   * ( excerpt from http://php.net/manual/en/arrayiterator.rewind.php )
   *
   * This rewinds the iterator to the beginning.
   *
   * @return     mixed   No value is returned.
   */
  public function rewind(): void {
    $this->index = 0;
  }

  // This doc comment block generated by idl/sysdoc.php
  /**
   * ( excerpt from http://php.net/manual/en/arrayiterator.setflags.php )
   *
   * Sets behaviour flags. Warning: This function is currently not
   * documented; only its argument list is available.
   *
   * @flags      mixed   A bitmask as follows: 0 = Properties of the object
   *                     have their normal functionality when accessed as
   *                     list (var_dump, foreach, etc.). 1 = Array indices
   *                     can be accessed as properties in read/write.
   *
   * @return     mixed   No value is returned.
   */
  public function setFlags(int $flags): void {
    $this->flags = $flags;
  }

  // This doc comment block generated by idl/sysdoc.php
  /**
   * ( excerpt from http://php.net/manual/en/arrayiterator.valid.php )
   *
   * Checks if the array contains any more entries.
   *
   * @return     mixed   No value is returned.
   */
  public function valid(): bool {
    return $this->index < count($this->vals);
  }
}
