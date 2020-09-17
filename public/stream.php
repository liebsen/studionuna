<?php

header('Content-type: audio/mpeg');
header("Content-Transfer-Encoding: binary");
header("Pragma: no-cache");

$file = "https://sonic.dattalive.com/8634/;";
readfile($file);
