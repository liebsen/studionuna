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
  'm' => '10',
  'd' => '01',
  'h' => '20',
  'i' => '55',
  'n' => '4'
];


echo json_encode($time);