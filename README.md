# Legify Legicon

Node.js-based GitHub-like Identicon implementation using Keccak32.

![Client-side](http://f.cl.ly/items/13352W0z3O3e2x3z3M42/Legicon.gif)

![CLI](http://f.cl.ly/items/3m2M2Y2G3V3f3Z3g141w/Untitled321.gif)

## Installation

    $ npm install legicon

Unless previously installed you'll _need_ __Cairo__.

## Example

```javascript
var Legicon = require('legicon');

var UserLegicon = Legicon("userid");

console.log('<img src="' + UserLegicon.toDataURL() + '" />');
```

## API

Legicon exposes some API-functions from the underlying Canvas module.

### Legicon#pngStream()

  To create a `PNGStream` simply call `Legicon.pngStream()`, and the stream will start to emit _data_ events, finally emitting _end_ when finished. If an exception occurs the _error_ event is emitted. See `examples/TCP/pngStream.js` for an example.

```javascript
var fs = require('fs')
  , out = fs.createWriteStream(__dirname + '/text.png')
  , stream = Legicon.pngStream();

stream.on('data', function(chunk){
  out.write(chunk);
});

stream.on('end', function(){
  console.log('saved png');
});
```

Currently _only_ sync streaming is supported, however we plan on supporting async streaming as well (of course :) ). Until then the `Legicon#toBuffer(callback)` alternative is async utilizing `eio_custom()`.

### Legicon#jpegStream() and Legicon#syncJPEGStream()

You can likewise create a `JPEGStream` by calling `Legicon.jpegStream()` with
some optional parameters; functionality is otherwise identical to
`pngStream()`.  See `examples/TCP/jpegStream.js` for an example.

_Note: At the moment, `jpegStream()` is the same as `syncJPEGStream()`, both
are synchronous_

```javascript
var stream = Legicon.jpegStream({
    bufsize: 4096 // output buffer size in bytes, default: 4096 
  , quality: 75 // JPEG quality (0-100) default: 75
  , progressive: false // true for progressive compression, default: fals
});
```

### Legicon#toBuffer()

A call to `Legicon#toBuffer()` will return a node `Buffer` instance containing all of the PNG data.  See `examples/TCP/buffer.js` for an example.

```javascript
Legicon.toBuffer();
```

### Legicon#toBuffer() async

Optionally we may pass a callback function to `Legicon#toBuffer()`, and this process will be performed asynchronously, and will `callback(err, buf)`.

```javascript
Legicon.toBuffer(function(err, buf){

});
```

## License

Copyright (c) 2013 by Legify UG. All Rights Reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies, substantial portions or derivates of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
