<?php 

/*
$time = (object) [
  'y' => date('Y'),
  'm' => date('m'),
  'd' => date('d'),
  'h' => date('H'),
  'i' => date('i'),
  'n' => date('N')
];
*/

$time = (object) [
  'y' => date('Y'),
  'm' => date('m'),
  'd' => '07', // date('d')
  'h' => '22', // date('H')
  'i' => '30', // date('i')
  'n' => '3' // date('N')
];

echo json_encode($time);