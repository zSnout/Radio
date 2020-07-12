# Table of Contents

 - [Radio](#radio)
 - [Example](#example)
 - [Security](#security)

# Radio
Radio is a JavaScript library that gives you the ability to transfer data between devices in a simple manner.

## The `Radio` Class
The `Radio` class is where all of the magic happens. It can take anywhere from one to four parameters.

### Parameters

The first parameter, `stream`, is the name of the stream to connect to. If a stream doesn't exist, it is created.
Note that `stream`s are unique to your domain. For example, the stream `chat` on `example.com` is not the same as `chat` on `mywebsite.com`. Also note that streams differ for subdomains. Ex: `chat` on `example.com` is not the same as `chat` on `chat.example.com`.

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

## The Database

We store the results of radio in a database containing five columns: `id`, `domain`, `stream`, `password`, and `data`. Three of these are unencrypted: `id`, `domain`, and `stream`.

However, we use PHP's [`password_hash()`](https://www.php.net/manual/en/function.password-hash.php) function to hash your password, and SODIUM to encrypt the data of the stream. The data is encrypted with your plain text password as the key, which can't be derived from the other columns. The only way to know your data is to have the right password.
