<?php
// abrimos la sesión cURL
$ch = curl_init();
  
// definimos la URL a la que hacemos la petición
curl_setopt($ch, CURLOPT_URL,"https://sonic.dattalive.com/cp/widgets/player/single/nowplay.php");
// indicamos el tipo de petición: POST
curl_setopt($ch, CURLOPT_POST, TRUE);
// definimos cada uno de los parámetros
curl_setopt($ch, CURLOPT_POSTFIELDS, "rsys=scv1&port=8634&NoCache=" . time());

curl_setopt($ch,CURLOPT_HTTPHEADER,array('Origin: https://sonic.dattalive.com'));
 
// recibimos la respuesta y la guardamos en una variable
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$remote_server_output = curl_exec ($ch);
 
// cerramos la sesión cURL
curl_close ($ch);
 
// hacemos lo que queramos con los datos recibidos
// por ejemplo, los mostramos
print_r($remote_server_output);
?>