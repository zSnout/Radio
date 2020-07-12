# Radio
Radio is a JavaScript library that gives you the ability to transfer data between devices in a simple manner.

## The `Radio(stream [, password])` Class
The `Radio` class is where all of the magic happens.

`stream` is the name of the stream to connect to. If it doesn't exist, it is created.
If provided, `password` is the password of the stream to connect to/create.

Note that `stream`s are unique to your domain. For example, the stream `chat` on `example.com` is not the same as `chat` on `mywebsite.com`. Also note that streams differ for subdomains. Ex: `chat` on `example.com` is not the same as `chat` on `chat.example.com`.

Once the `Radio` object is created, you can start sending and recieving messages.

## `.connect()`
The `.connect()` method is useful for making sure that you are connected properly. It will return a `Promise` that will:
 - Resolve with `true` if the connection is successful,
 - Resolve with `false` if the password is incorrect or a server error occurred, or
 - Reject with `false` if a JavaScript error occurred.

This is a good first method to use, to make sure that you have successfully connected to Radio.

## `.sendMessage([message])`
The `.sendMessage()` method allows you to send a message across the stream. It will return a `Promise` that will:
 - Resolve with `true` if the message was sent.
 - Resolve with `false` if the connection is bad or a server error occurred.
 - Reject with the error if a JavaScript error occurred.

Note that `.sendMessage()` can only send text, and anything other that text is converted to text. If you are sending a non-text object, it is best to change it to a JSON with `JSON.stringify()`.

## `.getAllData()`
The `.getAllData()` method allows you to get all the messages in the stream. It will returns a `Promise` that will:
 - Resolve with an array containing all the messages sent if the request was successful, or
 - Reject with the error if a JavaScript error occurred.

## `.getNewData()`
The `.getNewData()` method is like the `.getAllData()` method, but it only returns messages that have not been gotten before.

## `.waitForNew([time])`
The `.waitForNew()` method checks every `time` milliseconds for new data. Note that values of `time` less than `5000` will be changed to `5000`.

It returns a `Promise` that will:
 - Resolve with an array containing the new data once new data is successfully found, or
 - Reject with the error if a JavaScript error occurred.

## `.onNewData(callback [, time])`
The `.onNewData()` acts like the `.waitForNew()` method, except it calls the function `callback` each time new data is found, instead of once. It is the only method that does not return a promise.

# zSnout Example
We have created an example of Radio available at [radio.zsnout.com](https://radio.zsnout.com/).
