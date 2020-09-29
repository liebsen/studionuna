<?php 

$time = (object) [
  'y' => date('Y'),
  'm' => date('m'),
  'd' => date('d'),
  'h' => date('H'),
  'i' => date('i'),
  'n' => date('N')
];

/*
$time = (object) [
  'y' => date('Y'),
  'm' => date('m'),
  'd' => '30',
  'h' => '00',
  'i' => '00',
  'n' => '3'
]; */

echo json_encode($time);