<?php
    header("Access-Control-Allow-Origin: *");
    include("../config.php");
    $database = $database;
    
    $MAIN = $_GET;
    
    function encrypt($text,$key) {
        $nonce = random_bytes(SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);
        
        $bytes = SODIUM_CRYPTO_SECRETBOX_KEYBYTES;
        if (strlen($key) < $bytes) {
            $key .= str_repeat("=",$bytes - strlen($key));
        } elseif (strlen($key) > $bytes) {
            $key = substr($key,0,$bytes);
        }
        
        return base64_encode($nonce . sodium_crypto_secretbox($text,$nonce,$key));
    }
    function decrypt($encrypted,$key) {
        $bytes = SODIUM_CRYPTO_SECRETBOX_KEYBYTES;
        if (strlen($key) < $bytes) {
            $key .= str_repeat("=",$bytes - strlen($key));
        } elseif (strlen($key) > $bytes) {
            $key = substr($key,0,$bytes);
        }
        
        $decoded = base64_decode($encrypted);
        $nonce = mb_substr($decoded,0,SODIUM_CRYPTO_SECRETBOX_NONCEBYTES,"8bit");
        $text = mb_substr($decoded,SODIUM_CRYPTO_SECRETBOX_NONCEBYTES,null,"8bit");
        return sodium_crypto_secretbox_open($text,$nonce,$key);
    }
    
    function getAllStreams($domain) {
        global $database;
        
        $sql = $database->prepare("SELECT id, domain, stream, password, data FROM radio WHERE domain = ?");
        $sql->bind_param("s",$domain);
        $sql->execute();
        
        $result = $sql->get_result();
        if ($result->num_rows == 0) {
            return array();
        } else {
            $all = array();
            
            while ($row = $result->fetch_assoc()) {
                $all[$row["stream"]] = array(
                    "id" => $row["id"],
                    "domain" => $row["domain"],
                    "stream" => $row["stream"],
                    "password" => $row["password"],
                    "data" => json_decode($row["data"],true)
                );
            }
            
            return $all;
        }
    }
    function getStream($domain,$stream,$password = "") {
        $stream = strtolower($stream);
        
        if (!checkPassword($domain,$stream,$password)) {
            return false;
        }
        
        $data = getAllStreams($domain)[$stream]["data"];
        foreach ($data as $i => $elem) {
            $data[$i] = decrypt($elem,$password);
        }
        
        return $data;
    }
    
    function createStream($domain,$stream,$password = "") {
        $stream = strtolower($stream);
        global $database;
        
        if (streamExists($domain,$stream) or $stream == "") {
            return false;
        }
        
        $sql = $database->prepare("INSERT INTO radio (domain, stream, password) VALUES (?, ?, ?)");
        $sql->bind_param("sss",$domain,$stream,password_hash($password,PASSWORD_BCRYPT));
        $sql->execute();
        
        return true;
    }
    function streamExists($domain,$stream) {
        $stream = strtolower($stream);
        
        $all = getAllStreams($domain);
        if (array_key_exists($stream,$all)) {
            return true;
        } else {
            return false;
        }
    }
    function checkPassword($domain,$stream,$password = "") {
        $stream = strtolower($stream);
        
        if (!streamExists($domain,$stream)) {
            return false;
        }
        
        $all = getAllStreams($domain)[$stream];
        if (password_verify($password,$all["password"])) {
            return true;
        } else {
            return false;
        }
    }
    
    function sendMessage($message,$domain,$stream,$password = "") {
        $stream = strtolower($stream);
        global $database;
        
        $arr = getStream($domain,$stream,$password);
        if ($arr === false) {
            return false;
        }
        $arr[] = encrypt($message,$password);
        
        $sql = $database->prepare("UPDATE radio SET data = ? WHERE domain = ? AND stream = ?");
        $sql->bind_param("sss",json_encode($arr),$domain,$stream);
        $sql->execute();
        
        return true;
    }