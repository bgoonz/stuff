<?php

function countZeros($number) {
	return strlen($number) - strlen(str_replace("0", "", $number));
}

var_dump(countZeros(1000) === 3); // TRUE
var_dump(countZeros(1100) === 2); // TRUE
var_dump(countZeros(9999) === 0); // TRUE
var_dump(countZeros(1000000) === 6); // TRUE
var_dump(countZeros(111111111111111111111) === 0); // FALSE! WHY?!?