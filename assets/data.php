<?php
    header("Access-Control-Allow-Origin: *");
    include("main.php");
    
    if (!array_key_exists("domain",$MAIN) or !array_key_exists("stream",$MAIN)) {
        die("ERROR");
    }
    if (!array_key_exists("password",$MAIN)) {
        $MAIN["password"] = "";
    }
    
    $domain = $MAIN["domain"];
    $stream = strtolower($MAIN["stream"]);
    $password = $MAIN["password"];
    
    if (!streamExists($domain,$stream)) {
        die("NOEXIST");
    } elseif (!checkPassword($domain,$stream,$password)) {
        die("PASSWORD");
    } else {
        die(json_encode(getStream($domain,$stream,$password)));
    }