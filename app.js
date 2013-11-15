#!/usr/local/bin/node

/*
         __                            ___             
        /\ \                     __  /'___\            
        \ \ \         __     __ /\_\/\ \__/  __  __    
         \ \ \  __  /'__`\ /'_ `\/\ \ \ ,__\/\ \/\ \   
          \ \ \L\ \/\  __//\ \L\ \ \ \ \ \_/\ \ \_\ \  
           \ \____/\ \____\ \____ \ \_\ \_\  \/`____ \ 
            \/___/  \/____/\/___L\ \/_/\/_/   `/___/> \
                             /\____/             /\___/
                             \_/__/              \/__/
 
        Copyright (c) 2013 by Legify UG. All Rights Reserved.
 
        Permission is hereby granted, free of charge, to any person obtaining a copy
        of this software and associated documentation files (the "Software"), to deal
        in the Software without restriction, including without limitation the rights
        to use, copy, modify, merge, publish, distribute, sublicense and to permit
        persons to whom the Software is furnished to do so, subject to the following
        conditions:
 
        The above copyright notice and this permission notice shall be included in
        all copies, substantial portions or derivates of the Software.
 
        THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
        IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
        FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
        AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
        LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
        OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
        THE SOFTWARE.
*/

var canvas = require('canvas')

var kec32 = (function() {
        var permute, RC, r, circ, hex, output_fn;
        permute = [0, 10, 20, 5, 15, 16, 1, 11, 21, 6, 7, 17, 2, 12, 22, 23, 8, 18, 3, 13, 14, 24, 9, 19, 4];
        RC = "1,8082,808a,80008000,808b,80000001,80008081,8009,8a,88,80008009,8000000a,8000808b,8b,8089,8003,8002,80,800a,8000000a,80008081,8080"
                .split(",").map(function(i) {
                        return parseInt(i, 16);
                });
        r = [0, 1, 30, 28, 27, 4, 12, 6, 23, 20, 3, 10, 11, 25, 7, 9, 13, 15, 21, 8, 18, 2, 29, 24, 14];
        circ = function(s, n) {
                return (s << n) | (s >>> (32 - n));
        };
        hex = function(n) {
                return ("00" + n.toString(16)).slice(-2);
        };
        output_fn = function(n) {
                return hex(n & 255) + hex(n >>> 8) + hex(n >>> 16) + hex(n >>> 24);
        };
        return function(m) {
                var i, b, k, x, y, C, D, round, next, state;
                state = [];
                for (i = 0; i < 25; i += 1) {
                        state[i] = 0;
                }
                C = [];
                D = [];
                next = [];
                if (m.length % 16 === 15) {
                        m += "\u8001";
                } else {
                        m += "\x01";
                        while (m.length % 16 !== 15) {
                                m += "\0";
                        }
                        m += "\u8000";
                }
                for (b = 0; b < m.length; b += 16) {
                        for (k = 0; k < 16; k += 2) {
                                state[k / 2] ^= m.charCodeAt(b + k) + m.charCodeAt(b + k + 1) * 65536;
                        }
                        for (round = 0; round < 22; round += 1) {
                                for (x = 0; x < 5; x += 1) {
                                        C[x] = state[x] ^ state[x + 5] ^ state[x + 10] ^ state[x + 15] ^ state[x + 20];
                                }
                                for (x = 0; x < 5; x += 1) {
                                        D[x] = C[(x + 4) % 5] ^ circ(C[(x + 1) % 5], 1);
                                }
                                for (i = 0; i < 25; i += 1) {
                                        next[permute[i]] = circ(state[i] ^ D[i % 5], r[i]);
                                }
                                for (x = 0; x < 5; x += 1) {
                                        for (y = 0; y < 25; y += 5) {
                                                state[y + x] = next[y + x] ^ ((~next[y + (x + 1) % 5]) & (next[y + (x + 2) % 5]));
                                        }
                                }
                                state[0] ^= RC[round];
                        }
                }
                return state.slice(0, 8).map(output_fn).join("");
        };
}());

module.exports = function(key, options) {
        // Defaults
                // Keep RGB components in visible space [r, g, b];
                // Default: r + g + b = ]300|690[

                        // Max value for a color component
                        var rgb_max = 230;

                        // Min value for a color component
                        var rgb_min = 100;

                // Size of a grid square in pixels; Default: 40
                var square = 40;

                // DO NOT CHANGE THIS WITHOUT
                // CHANGING THE UNDERLYING HASHING
                // ALGORITHM ACCORDINGLY.

                        // Number of squares width and height; Default: 5
                        var grid = 5;

                // Padding on the edge of the canvas in px; Default: 20
                var padding = square / 2;

                // Size of the canvas; Default: 240wh; 57600 Pixel
                var size = square * grid + padding * 2;

        if ( options && options.constructor === Object ) {
                var self = this; Object.keys(options).forEach(function (v) {
                        // Override the defaults
                        self[v] = options[v]
                })
        }

        var cvs = new canvas(size, size);
        var ctx = cvs.getContext('2d');
        cvs.width = size, cvs.height = size;

        var cipher = kec32(key).substr(-50);

        var ntpls = [];

        for (var i = 0; i < 50; ++i, i++)
                ntpls.push(parseInt(cipher.substr(i, 2), 16));

        // Draw the background
        ctx.beginPath();
        ctx.rect(0, 0, size, size);
        ctx.fillStyle = '#F0ECE6';
        ctx.fill();

        // determine color based on hash;
        // Default: ntpls[8, 16, 24]
        // with 50 chars and 2-tuples
                var rgb = [];
                for (var i = 0, pntr = ~~(ntpls.length / 3); i < 3; i++) {
                        var val = ntpls[pntr * i];
                        var minEnforced = Math.max(rgb_min, val);
                        var maxEnforced = Math.min(rgb_max, minEnforced);
                        rgb.push(maxEnforced);
                }
                var color = rgb;

        // draw blocks
                for (var x = 0; x < grid; x++) {
                        for (var y = 0; y < grid; y++) {
                                // since we're using a hex hash
                                // the two-char max can be FF
                                // and we need a decision
                                // so we draw when the 2-tuple
                                // is >= 127
                                if (ntpls[x + y] >= 127) {
                                        ctx.beginPath();
                                        ctx.rect(
                                                padding + x * square,
                                                padding + y * square,
                                                square,
                                                square
                                        );
                                        ctx.fillStyle = 'rgb(' + color.join(',') + ')';
                                        ctx.fill();
                                }
                        }
                }

        return {
                // Blobs
                        toDataURL: cvs.toDataURL.bind(cvs),
                        toBuffer: cvs.toBuffer.bind(cvs),

                // Streams
                        pngStream: cvs.pngStream.bind(cvs),
                        jpegStream: cvs.jpegStream.bind(cvs),
                        syncJPEGStream: cvs.syncJPEGStream.bind(cvs)
        };
};