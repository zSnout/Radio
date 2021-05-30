# Table of Contents

 - [Setting Up](#setting-up)
   - [zSnout Hosting](#zsnout-hosting)
   - [Personal Hosting](#personal-hosting)
 - [The `Radio` Class](#the-radio-class)
   - [`.send(message)`](#sendmessage)
   - [`.getAll()`](#getall)
   - [`.getNew()`](#getnew)
   - [`.wait()`](#wait)
 - [Example](#example)
 - [Security](#security)
   - [Password Encryption](#password-encryption)
   - [Data Encryption](#data-encryption)
   - [Get your Data](#get-your-data)

# Setting Up

To set up Radio, you can either use zSnout Hosting or host Radio yourself.

## zSnout Hosting
To use zSnout hosting, all you need to do is include the `main.js` file into your webpage.
``` html
<script src="https://zsnout.com/radio/main.js"></script>
```

## Personal Hosting
If you are a large business, you may want to host your own copy of Radio. Here's how.

 1. Download a copy of the [`assets`](/assets/) folder. You can rename it if you want.
 2. Make sure that your server has PHP and MySQL, and has the PHP [Sodium](https://php.net/manual/en/book.sodium.php) extension enabled.
   - If your server is missing any of the above, just use zSnout Hosting.
 3. In the [`main.php`](/assets/main.php) file on line 3, change the `$database` variable to the MySQL database you're using for Radio.
 4. Run the following command on your MySQL server in the database stored in `$database`.
 ``` mysql
 CREATE TABLE `chats`.`radio` ( `id` INT NOT NULL AUTO_INCREMENT , `domain` TEXT NOT NULL DEFAULT '' , `stream` TEXT NOT NULL DEFAULT '' , `password` TEXT NOT NULL DEFAULT '' , `data` TEXT NOT NULL DEFAULT '[]' , PRIMARY KEY (`id`)) ENGINE = InnoDB;
 ```
 5. In the [`main.php`](/assets/main.php) file on line 4, change the `$MAIN` variable to the superglobal you're retrieving from. zSnout uses GET requests, so we use `$_GET`. However, if you prefer POST requests, use `$_POST`, or any other superglobal like them.
 6. In the [`main.js`](/assets/main.js) file on line 3, change the `return` value to the number of seconds before `.wait()` refreshes. Lower values will mean that you'll get a response sooner, but too low might overload your server.
 7. In the [`main.js`](/assets/main.js) file on line 7, change the `return` value to the path to the PHP and JavaScript files.
 8. Make sure to load `main.js` from your location, not ours.

# The `Radio` Class
The `Radio` class is where all of the magic happens. It can take anywhere from one to four parameters.

The first parameter, `stream`, is the name of the stream to connect to. If a stream doesn't exist, it is created.
Note that `stream`s are unique to your domain. For example, the stream `chat` on `example.com` is not the same as `chat` on `mywebsite.com`. Also note that streams differ for subdomains. Ex: `chat` on `example.com` is not the same as `chat` on `chat.example.com`.
Also note that `stream`s are stored in lowercase, so `zSnout` "redirects" to `zsnout`.

The second parameter, `password`, is the password of the stream to connect to/create. You can use `""` for no password.

The third parameter, `callback`, is a function accepting one argument. If provided, it is called whenever a new message is found, with the message as the parameter.

The fourth parameter, `current`, is a function accepting one argument. If provided, it is called on each message already sent, in order of time sent, with the message as the parameter.

You can leave any of these except `stream` as `undefined` to skip it.

Once the `Radio` object is created, you can start sending and recieving messages.

## `.send(message)`
The `.send()` method allows you to send a message across the stream. It does not return anything.

Note that `.send()` can only send text, so to send an array or object, convert it to a JSON string first with `JSON.stringify()`.

## `.getAll()`
The `.getAll()` method allows you to get all the messages in the stream. It will returns a `Promise` that will:
 - Resolve with an array containing all the messages sent if the request was successful, or
 - Reject if a JavaScript error occurred.

## `.getNew()`
The `.getNew()` method is like the `.getAll()` method, but it only resolves with messages that have not been fetched before.

## `.wait()`
The `.wait()` method checks every 5 seconds for new data.

It returns a `Promise` that will:
 - Resolve with an array containing the new data once new data is successfully found, or
 - Reject with the error if a JavaScript error occurred.

# Example
We at zSnout have created an example of Radio publicly available at [radio.zsnout.com](https://radio.zsnout.com/) in the form of a chat website. It is entirely built on Radio.

# Security
zSnout's Radio team wants you to know that we care about your security, so here's how we keep your data safe and secure.

We store the content of Radio in a database containing five columns: `id`, `domain`, `stream`, `password`, and `data`.
Three of these columns are unencrypted: `id`, `domain`, and `stream`. However, the other two are fully encrypted.

## Password Encryption
We use [PHP](https://php.net/)'s [`password_hash()`](https://www.php.net/manual/en/function.password-hash.php) function with BCrypt to hash your password. Hashing is a one-way algorithm, so there's no way for us to know your password.

## Data Encryption
We use PHP's [Sodium](https://www.php.net/manual/en/book.sodium.php) extension to encrypt the data of your stream. The data is encrypted with your plain text password as the key, which can't be derived from the other columns in the database. The only way to know your data correctly is to have the right password.

## Get your Data
If you would like to view the internal data we store, go to
``` html
https://zsnout.com/radio/content?host=<domain>&stream=<stream>&password=<password>
```

It will either print:
 - `NOEXIST` if the stream does not exist,
 - `PASSWORD` if the stream exists but you have the wrong password, or
 - A JSON string containing:
   - `id`: The ID of the row in the database.
   - `domain`: The domain of the row.
   - `stream`: The stream name.
   - `password`: The stream's password as it's stored in the database.
   - `data`: An array containing the stream's data as it's stored in the database.

We recommend that you view the source instead of the output, as the JSON is pretty-printed.
