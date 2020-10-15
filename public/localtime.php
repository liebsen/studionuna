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
  'd' => '15', // date('d')
  'h' => '00', // date('H')
  'i' => '01', // date('i')
  'n' => '4' // date('N')
];

echo json_encode($time);