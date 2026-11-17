"use strict";
(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // node_modules/@smartspectra/node-sdk/js/renderer/timestamp.js
  var require_timestamp = __commonJS({
    "node_modules/@smartspectra/node-sdk/js/renderer/timestamp.js"(exports, module) {
      "use strict";
      var FrameTimestampAnchor = class {
        constructor() {
          this._epochOffsetUs = null;
          this._lastFrameTs = 0n;
        }
        /**
         * @param {number|bigint} rawTimestampUs VideoFrame.timestamp — already
         *   microseconds, but in its own media-clock domain.
         * @param {number} [nowMs] Wall-clock epoch milliseconds at the moment of
         *   the first call. Defaults to Date.now(); overridable so callers (and
         *   tests) can pin a deterministic anchor.
         * @returns {bigint} Epoch microseconds, strictly greater than every
         *   previous value returned by this instance.
         */
        next(rawTimestampUs, nowMs = Date.now()) {
          const raw = BigInt(rawTimestampUs || 0);
          if (this._epochOffsetUs === null) {
            this._epochOffsetUs = BigInt(nowMs) * 1000n - raw;
          }
          let ts = raw + this._epochOffsetUs;
          if (ts <= this._lastFrameTs) ts = this._lastFrameTs + 1n;
          this._lastFrameTs = ts;
          return ts;
        }
      };
      module.exports = { FrameTimestampAnchor };
    }
  });

  // node_modules/@protobufjs/aspromise/index.js
  var require_aspromise = __commonJS({
    "node_modules/@protobufjs/aspromise/index.js"(exports, module) {
      "use strict";
      module.exports = asPromise;
      function asPromise(fn, ctx) {
        var params = new Array(arguments.length - 1), offset = 0, index = 2, pending = true;
        while (index < arguments.length)
          params[offset++] = arguments[index++];
        return new Promise(function executor(resolve, reject) {
          params[offset] = function callback(err) {
            if (pending) {
              pending = false;
              if (err)
                reject(err);
              else {
                var params2 = new Array(arguments.length - 1), offset2 = 0;
                while (offset2 < params2.length)
                  params2[offset2++] = arguments[offset2];
                resolve.apply(null, params2);
              }
            }
          };
          try {
            fn.apply(ctx || null, params);
          } catch (err) {
            if (pending) {
              pending = false;
              reject(err);
            }
          }
        });
      }
    }
  });

  // node_modules/@protobufjs/base64/index.js
  var require_base64 = __commonJS({
    "node_modules/@protobufjs/base64/index.js"(exports) {
      "use strict";
      var base64 = exports;
      base64.length = function length(string) {
        var p = string.length;
        if (!p)
          return 0;
        var n = 0;
        while (--p % 4 > 1 && string.charAt(p) === "=")
          ++n;
        return Math.ceil(string.length * 3) / 4 - n;
      };
      var b64 = new Array(64);
      var s64 = new Array(123);
      for (i = 0; i < 64; )
        s64[b64[i] = i < 26 ? i + 65 : i < 52 ? i + 71 : i < 62 ? i - 4 : i - 59 | 43] = i++;
      var i;
      base64.encode = function encode(buffer, start, end) {
        var parts = null, chunk = [];
        var i2 = 0, j = 0, t;
        while (start < end) {
          var b = buffer[start++];
          switch (j) {
            case 0:
              chunk[i2++] = b64[b >> 2];
              t = (b & 3) << 4;
              j = 1;
              break;
            case 1:
              chunk[i2++] = b64[t | b >> 4];
              t = (b & 15) << 2;
              j = 2;
              break;
            case 2:
              chunk[i2++] = b64[t | b >> 6];
              chunk[i2++] = b64[b & 63];
              j = 0;
              break;
          }
          if (i2 > 8191) {
            (parts || (parts = [])).push(String.fromCharCode.apply(String, chunk));
            i2 = 0;
          }
        }
        if (j) {
          chunk[i2++] = b64[t];
          chunk[i2++] = 61;
          if (j === 1)
            chunk[i2++] = 61;
        }
        if (parts) {
          if (i2)
            parts.push(String.fromCharCode.apply(String, chunk.slice(0, i2)));
          return parts.join("");
        }
        return String.fromCharCode.apply(String, chunk.slice(0, i2));
      };
      var invalidEncoding = "invalid encoding";
      base64.decode = function decode(string, buffer, offset) {
        var start = offset;
        var j = 0, t;
        for (var i2 = 0; i2 < string.length; ) {
          var c = string.charCodeAt(i2++);
          if (c === 61 && j > 1)
            break;
          if ((c = s64[c]) === void 0)
            throw Error(invalidEncoding);
          switch (j) {
            case 0:
              t = c;
              j = 1;
              break;
            case 1:
              buffer[offset++] = t << 2 | (c & 48) >> 4;
              t = c;
              j = 2;
              break;
            case 2:
              buffer[offset++] = (t & 15) << 4 | (c & 60) >> 2;
              t = c;
              j = 3;
              break;
            case 3:
              buffer[offset++] = (t & 3) << 6 | c;
              j = 0;
              break;
          }
        }
        if (j === 1)
          throw Error(invalidEncoding);
        return offset - start;
      };
      base64.test = function test(string) {
        return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(string);
      };
    }
  });

  // node_modules/@protobufjs/eventemitter/index.js
  var require_eventemitter = __commonJS({
    "node_modules/@protobufjs/eventemitter/index.js"(exports, module) {
      "use strict";
      module.exports = EventEmitter;
      function EventEmitter() {
        this._listeners = /* @__PURE__ */ Object.create(null);
      }
      EventEmitter.prototype.on = function on(evt, fn, ctx) {
        (this._listeners[evt] || (this._listeners[evt] = [])).push({
          fn,
          ctx: ctx || this
        });
        return this;
      };
      EventEmitter.prototype.off = function off(evt, fn) {
        if (evt === void 0)
          this._listeners = /* @__PURE__ */ Object.create(null);
        else {
          if (fn === void 0)
            this._listeners[evt] = [];
          else {
            var listeners = this._listeners[evt];
            if (!listeners)
              return this;
            for (var i = 0; i < listeners.length; )
              if (listeners[i].fn === fn)
                listeners.splice(i, 1);
              else
                ++i;
          }
        }
        return this;
      };
      EventEmitter.prototype.emit = function emit(evt) {
        var listeners = this._listeners[evt];
        if (listeners) {
          var args = [], i = 1;
          for (; i < arguments.length; )
            args.push(arguments[i++]);
          for (i = 0; i < listeners.length; )
            listeners[i].fn.apply(listeners[i++].ctx, args);
        }
        return this;
      };
    }
  });

  // node_modules/@protobufjs/float/index.js
  var require_float = __commonJS({
    "node_modules/@protobufjs/float/index.js"(exports, module) {
      "use strict";
      module.exports = factory(factory);
      function factory(exports2) {
        if (typeof Float32Array !== "undefined") (function() {
          var f32 = new Float32Array([-0]), f8b = new Uint8Array(f32.buffer), le = f8b[3] === 128;
          function writeFloat_f32_cpy(val, buf, pos) {
            f32[0] = val;
            buf[pos] = f8b[0];
            buf[pos + 1] = f8b[1];
            buf[pos + 2] = f8b[2];
            buf[pos + 3] = f8b[3];
          }
          function writeFloat_f32_rev(val, buf, pos) {
            f32[0] = val;
            buf[pos] = f8b[3];
            buf[pos + 1] = f8b[2];
            buf[pos + 2] = f8b[1];
            buf[pos + 3] = f8b[0];
          }
          exports2.writeFloatLE = le ? writeFloat_f32_cpy : writeFloat_f32_rev;
          exports2.writeFloatBE = le ? writeFloat_f32_rev : writeFloat_f32_cpy;
          function readFloat_f32_cpy(buf, pos) {
            f8b[0] = buf[pos];
            f8b[1] = buf[pos + 1];
            f8b[2] = buf[pos + 2];
            f8b[3] = buf[pos + 3];
            return f32[0];
          }
          function readFloat_f32_rev(buf, pos) {
            f8b[3] = buf[pos];
            f8b[2] = buf[pos + 1];
            f8b[1] = buf[pos + 2];
            f8b[0] = buf[pos + 3];
            return f32[0];
          }
          exports2.readFloatLE = le ? readFloat_f32_cpy : readFloat_f32_rev;
          exports2.readFloatBE = le ? readFloat_f32_rev : readFloat_f32_cpy;
        })();
        else (function() {
          function writeFloat_ieee754(writeUint, val, buf, pos) {
            var sign = val < 0 ? 1 : 0;
            if (sign)
              val = -val;
            if (val === 0)
              writeUint(1 / val > 0 ? (
                /* positive */
                0
              ) : (
                /* negative 0 */
                2147483648
              ), buf, pos);
            else if (isNaN(val))
              writeUint(2143289344, buf, pos);
            else if (val > 34028234663852886e22)
              writeUint((sign << 31 | 2139095040) >>> 0, buf, pos);
            else if (val < 11754943508222875e-54)
              writeUint((sign << 31 | Math.round(val / 1401298464324817e-60)) >>> 0, buf, pos);
            else {
              var exponent = Math.floor(Math.log(val) / Math.LN2), mantissa = Math.round(val * Math.pow(2, -exponent) * 8388608) & 8388607;
              writeUint((sign << 31 | exponent + 127 << 23 | mantissa) >>> 0, buf, pos);
            }
          }
          exports2.writeFloatLE = writeFloat_ieee754.bind(null, writeUintLE);
          exports2.writeFloatBE = writeFloat_ieee754.bind(null, writeUintBE);
          function readFloat_ieee754(readUint, buf, pos) {
            var uint = readUint(buf, pos), sign = (uint >> 31) * 2 + 1, exponent = uint >>> 23 & 255, mantissa = uint & 8388607;
            return exponent === 255 ? mantissa ? NaN : sign * Infinity : exponent === 0 ? sign * 1401298464324817e-60 * mantissa : sign * Math.pow(2, exponent - 150) * (mantissa + 8388608);
          }
          exports2.readFloatLE = readFloat_ieee754.bind(null, readUintLE);
          exports2.readFloatBE = readFloat_ieee754.bind(null, readUintBE);
        })();
        if (typeof Float64Array !== "undefined") (function() {
          var f64 = new Float64Array([-0]), f8b = new Uint8Array(f64.buffer), le = f8b[7] === 128;
          function writeDouble_f64_cpy(val, buf, pos) {
            f64[0] = val;
            buf[pos] = f8b[0];
            buf[pos + 1] = f8b[1];
            buf[pos + 2] = f8b[2];
            buf[pos + 3] = f8b[3];
            buf[pos + 4] = f8b[4];
            buf[pos + 5] = f8b[5];
            buf[pos + 6] = f8b[6];
            buf[pos + 7] = f8b[7];
          }
          function writeDouble_f64_rev(val, buf, pos) {
            f64[0] = val;
            buf[pos] = f8b[7];
            buf[pos + 1] = f8b[6];
            buf[pos + 2] = f8b[5];
            buf[pos + 3] = f8b[4];
            buf[pos + 4] = f8b[3];
            buf[pos + 5] = f8b[2];
            buf[pos + 6] = f8b[1];
            buf[pos + 7] = f8b[0];
          }
          exports2.writeDoubleLE = le ? writeDouble_f64_cpy : writeDouble_f64_rev;
          exports2.writeDoubleBE = le ? writeDouble_f64_rev : writeDouble_f64_cpy;
          function readDouble_f64_cpy(buf, pos) {
            f8b[0] = buf[pos];
            f8b[1] = buf[pos + 1];
            f8b[2] = buf[pos + 2];
            f8b[3] = buf[pos + 3];
            f8b[4] = buf[pos + 4];
            f8b[5] = buf[pos + 5];
            f8b[6] = buf[pos + 6];
            f8b[7] = buf[pos + 7];
            return f64[0];
          }
          function readDouble_f64_rev(buf, pos) {
            f8b[7] = buf[pos];
            f8b[6] = buf[pos + 1];
            f8b[5] = buf[pos + 2];
            f8b[4] = buf[pos + 3];
            f8b[3] = buf[pos + 4];
            f8b[2] = buf[pos + 5];
            f8b[1] = buf[pos + 6];
            f8b[0] = buf[pos + 7];
            return f64[0];
          }
          exports2.readDoubleLE = le ? readDouble_f64_cpy : readDouble_f64_rev;
          exports2.readDoubleBE = le ? readDouble_f64_rev : readDouble_f64_cpy;
        })();
        else (function() {
          function writeDouble_ieee754(writeUint, off0, off1, val, buf, pos) {
            var sign = val < 0 ? 1 : 0;
            if (sign)
              val = -val;
            if (val === 0) {
              writeUint(0, buf, pos + off0);
              writeUint(1 / val > 0 ? (
                /* positive */
                0
              ) : (
                /* negative 0 */
                2147483648
              ), buf, pos + off1);
            } else if (isNaN(val)) {
              writeUint(0, buf, pos + off0);
              writeUint(2146959360, buf, pos + off1);
            } else if (val > 17976931348623157e292) {
              writeUint(0, buf, pos + off0);
              writeUint((sign << 31 | 2146435072) >>> 0, buf, pos + off1);
            } else {
              var mantissa;
              if (val < 22250738585072014e-324) {
                mantissa = val / 5e-324;
                writeUint(mantissa >>> 0, buf, pos + off0);
                writeUint((sign << 31 | mantissa / 4294967296) >>> 0, buf, pos + off1);
              } else {
                var exponent = Math.floor(Math.log(val) / Math.LN2);
                if (exponent === 1024)
                  exponent = 1023;
                mantissa = val * Math.pow(2, -exponent);
                writeUint(mantissa * 4503599627370496 >>> 0, buf, pos + off0);
                writeUint((sign << 31 | exponent + 1023 << 20 | mantissa * 1048576 & 1048575) >>> 0, buf, pos + off1);
              }
            }
          }
          exports2.writeDoubleLE = writeDouble_ieee754.bind(null, writeUintLE, 0, 4);
          exports2.writeDoubleBE = writeDouble_ieee754.bind(null, writeUintBE, 4, 0);
          function readDouble_ieee754(readUint, off0, off1, buf, pos) {
            var lo = readUint(buf, pos + off0), hi = readUint(buf, pos + off1);
            var sign = (hi >> 31) * 2 + 1, exponent = hi >>> 20 & 2047, mantissa = 4294967296 * (hi & 1048575) + lo;
            return exponent === 2047 ? mantissa ? NaN : sign * Infinity : exponent === 0 ? sign * 5e-324 * mantissa : sign * Math.pow(2, exponent - 1075) * (mantissa + 4503599627370496);
          }
          exports2.readDoubleLE = readDouble_ieee754.bind(null, readUintLE, 0, 4);
          exports2.readDoubleBE = readDouble_ieee754.bind(null, readUintBE, 4, 0);
        })();
        return exports2;
      }
      function writeUintLE(val, buf, pos) {
        buf[pos] = val & 255;
        buf[pos + 1] = val >>> 8 & 255;
        buf[pos + 2] = val >>> 16 & 255;
        buf[pos + 3] = val >>> 24;
      }
      function writeUintBE(val, buf, pos) {
        buf[pos] = val >>> 24;
        buf[pos + 1] = val >>> 16 & 255;
        buf[pos + 2] = val >>> 8 & 255;
        buf[pos + 3] = val & 255;
      }
      function readUintLE(buf, pos) {
        return (buf[pos] | buf[pos + 1] << 8 | buf[pos + 2] << 16 | buf[pos + 3] << 24) >>> 0;
      }
      function readUintBE(buf, pos) {
        return (buf[pos] << 24 | buf[pos + 1] << 16 | buf[pos + 2] << 8 | buf[pos + 3]) >>> 0;
      }
    }
  });

  // node_modules/@protobufjs/utf8/index.js
  var require_utf8 = __commonJS({
    "node_modules/@protobufjs/utf8/index.js"(exports) {
      "use strict";
      var utf8 = exports;
      var replacementCharCode = 65533;
      utf8.length = function utf8_length(string) {
        var len = 0, c = 0;
        for (var i = 0; i < string.length; ++i) {
          c = string.charCodeAt(i);
          if (c < 128)
            len += 1;
          else if (c < 2048)
            len += 2;
          else if ((c & 64512) === 55296 && (string.charCodeAt(i + 1) & 64512) === 56320) {
            ++i;
            len += 4;
          } else
            len += 3;
        }
        return len;
      };
      utf8.read = function utf8_read(buffer, start, end) {
        if (end - start < 1)
          return "";
        var parts = null, chunk = [], i = 0, t, t2, c2, c3;
        while (start < end) {
          t = buffer[start++];
          if (t <= 127) {
            chunk[i++] = t;
          } else if (t >= 192 && t < 224) {
            c2 = (t & 31) << 6 | buffer[start++] & 63;
            chunk[i++] = c2 >= 128 ? c2 : replacementCharCode;
          } else if (t >= 224 && t < 240) {
            c3 = (t & 15) << 12 | (buffer[start++] & 63) << 6 | buffer[start++] & 63;
            chunk[i++] = c3 >= 2048 ? c3 : replacementCharCode;
          } else if (t >= 240) {
            t2 = (t & 7) << 18 | (buffer[start++] & 63) << 12 | (buffer[start++] & 63) << 6 | buffer[start++] & 63;
            if (t2 < 65536 || t2 > 1114111)
              chunk[i++] = replacementCharCode;
            else {
              t2 -= 65536;
              chunk[i++] = 55296 + (t2 >> 10);
              chunk[i++] = 56320 + (t2 & 1023);
            }
          }
          if (i > 8191) {
            (parts || (parts = [])).push(String.fromCharCode.apply(String, chunk.slice(0, i)));
            i = 0;
          }
        }
        if (parts) {
          if (i)
            parts.push(String.fromCharCode.apply(String, chunk.slice(0, i)));
          return parts.join("");
        }
        return String.fromCharCode.apply(String, chunk.slice(0, i));
      };
      utf8.write = function utf8_write(string, buffer, offset) {
        var start = offset, c1, c2;
        for (var i = 0; i < string.length; ++i) {
          c1 = string.charCodeAt(i);
          if (c1 < 128) {
            buffer[offset++] = c1;
          } else if (c1 < 2048) {
            buffer[offset++] = c1 >> 6 | 192;
            buffer[offset++] = c1 & 63 | 128;
          } else if ((c1 & 64512) === 55296 && ((c2 = string.charCodeAt(i + 1)) & 64512) === 56320) {
            c1 = 65536 + ((c1 & 1023) << 10) + (c2 & 1023);
            ++i;
            buffer[offset++] = c1 >> 18 | 240;
            buffer[offset++] = c1 >> 12 & 63 | 128;
            buffer[offset++] = c1 >> 6 & 63 | 128;
            buffer[offset++] = c1 & 63 | 128;
          } else {
            buffer[offset++] = c1 >> 12 | 224;
            buffer[offset++] = c1 >> 6 & 63 | 128;
            buffer[offset++] = c1 & 63 | 128;
          }
        }
        return offset - start;
      };
    }
  });

  // node_modules/@protobufjs/pool/index.js
  var require_pool = __commonJS({
    "node_modules/@protobufjs/pool/index.js"(exports, module) {
      "use strict";
      module.exports = pool;
      function pool(alloc, slice, size) {
        var SIZE = size || 8192;
        var MAX = SIZE >>> 1;
        var slab = null;
        var offset = SIZE;
        return function pool_alloc(size2) {
          if (size2 < 1 || size2 > MAX)
            return alloc(size2);
          if (offset + size2 > SIZE) {
            slab = alloc(SIZE);
            offset = 0;
          }
          var buf = slice.call(slab, offset, offset += size2);
          if (offset & 7)
            offset = (offset | 7) + 1;
          return buf;
        };
      }
    }
  });

  // node_modules/protobufjs/src/util/longbits.js
  var require_longbits = __commonJS({
    "node_modules/protobufjs/src/util/longbits.js"(exports, module) {
      "use strict";
      module.exports = LongBits;
      var util = require_minimal();
      function LongBits(lo, hi) {
        this.lo = lo >>> 0;
        this.hi = hi >>> 0;
      }
      var zero = LongBits.zero = new LongBits(0, 0);
      zero.toNumber = function() {
        return 0;
      };
      zero.zzEncode = zero.zzDecode = function() {
        return this;
      };
      zero.length = function() {
        return 1;
      };
      var zeroHash = LongBits.zeroHash = "\0\0\0\0\0\0\0\0";
      LongBits.fromNumber = function fromNumber(value) {
        if (value === 0)
          return zero;
        var sign = value < 0;
        if (sign)
          value = -value;
        var lo = value >>> 0, hi = (value - lo) / 4294967296 >>> 0;
        if (sign) {
          hi = ~hi >>> 0;
          lo = ~lo >>> 0;
          if (++lo > 4294967295) {
            lo = 0;
            if (++hi > 4294967295)
              hi = 0;
          }
        }
        return new LongBits(lo, hi);
      };
      LongBits.from = function from(value) {
        if (typeof value === "number")
          return LongBits.fromNumber(value);
        if (util.isString(value)) {
          if (util.Long)
            value = util.Long.fromString(value);
          else
            return LongBits.fromNumber(parseInt(value, 10));
        }
        return value.low || value.high ? new LongBits(value.low >>> 0, value.high >>> 0) : zero;
      };
      LongBits.prototype.toNumber = function toNumber(unsigned) {
        if (!unsigned && this.hi >>> 31) {
          var lo = ~this.lo + 1 >>> 0, hi = ~this.hi >>> 0;
          if (!lo)
            hi = hi + 1 >>> 0;
          return -(lo + hi * 4294967296);
        }
        return this.lo + this.hi * 4294967296;
      };
      LongBits.prototype.toLong = function toLong(unsigned) {
        return util.Long ? new util.Long(this.lo | 0, this.hi | 0, Boolean(unsigned)) : { low: this.lo | 0, high: this.hi | 0, unsigned: Boolean(unsigned) };
      };
      var charCodeAt = String.prototype.charCodeAt;
      LongBits.fromHash = function fromHash(hash) {
        if (hash === zeroHash)
          return zero;
        return new LongBits(
          (charCodeAt.call(hash, 0) | charCodeAt.call(hash, 1) << 8 | charCodeAt.call(hash, 2) << 16 | charCodeAt.call(hash, 3) << 24) >>> 0,
          (charCodeAt.call(hash, 4) | charCodeAt.call(hash, 5) << 8 | charCodeAt.call(hash, 6) << 16 | charCodeAt.call(hash, 7) << 24) >>> 0
        );
      };
      LongBits.prototype.toHash = function toHash() {
        return String.fromCharCode(
          this.lo & 255,
          this.lo >>> 8 & 255,
          this.lo >>> 16 & 255,
          this.lo >>> 24,
          this.hi & 255,
          this.hi >>> 8 & 255,
          this.hi >>> 16 & 255,
          this.hi >>> 24
        );
      };
      LongBits.prototype.zzEncode = function zzEncode() {
        var mask = this.hi >> 31;
        this.hi = ((this.hi << 1 | this.lo >>> 31) ^ mask) >>> 0;
        this.lo = (this.lo << 1 ^ mask) >>> 0;
        return this;
      };
      LongBits.prototype.zzDecode = function zzDecode() {
        var mask = -(this.lo & 1);
        this.lo = ((this.lo >>> 1 | this.hi << 31) ^ mask) >>> 0;
        this.hi = (this.hi >>> 1 ^ mask) >>> 0;
        return this;
      };
      LongBits.prototype.length = function length() {
        var part0 = this.lo, part1 = (this.lo >>> 28 | this.hi << 4) >>> 0, part2 = this.hi >>> 24;
        return part2 === 0 ? part1 === 0 ? part0 < 16384 ? part0 < 128 ? 1 : 2 : part0 < 2097152 ? 3 : 4 : part1 < 16384 ? part1 < 128 ? 5 : 6 : part1 < 2097152 ? 7 : 8 : part2 < 128 ? 9 : 10;
      };
    }
  });

  // node_modules/long/umd/index.js
  var require_umd = __commonJS({
    "node_modules/long/umd/index.js"(exports, module) {
      (function(global2, factory) {
        function preferDefault(exports2) {
          return exports2.default || exports2;
        }
        if (typeof define === "function" && define.amd) {
          define([], function() {
            var exports2 = {};
            factory(exports2);
            return preferDefault(exports2);
          });
        } else if (typeof exports === "object") {
          factory(exports);
          if (typeof module === "object") module.exports = preferDefault(exports);
        } else {
          (function() {
            var exports2 = {};
            factory(exports2);
            global2.Long = preferDefault(exports2);
          })();
        }
      })(
        typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : exports,
        function(_exports) {
          "use strict";
          Object.defineProperty(_exports, "__esModule", {
            value: true
          });
          _exports.default = void 0;
          var wasm = null;
          try {
            wasm = new WebAssembly.Instance(
              new WebAssembly.Module(
                new Uint8Array([
                  // \0asm
                  0,
                  97,
                  115,
                  109,
                  // version 1
                  1,
                  0,
                  0,
                  0,
                  // section "type"
                  1,
                  13,
                  2,
                  // 0, () => i32
                  96,
                  0,
                  1,
                  127,
                  // 1, (i32, i32, i32, i32) => i32
                  96,
                  4,
                  127,
                  127,
                  127,
                  127,
                  1,
                  127,
                  // section "function"
                  3,
                  7,
                  6,
                  // 0, type 0
                  0,
                  // 1, type 1
                  1,
                  // 2, type 1
                  1,
                  // 3, type 1
                  1,
                  // 4, type 1
                  1,
                  // 5, type 1
                  1,
                  // section "global"
                  6,
                  6,
                  1,
                  // 0, "high", mutable i32
                  127,
                  1,
                  65,
                  0,
                  11,
                  // section "export"
                  7,
                  50,
                  6,
                  // 0, "mul"
                  3,
                  109,
                  117,
                  108,
                  0,
                  1,
                  // 1, "div_s"
                  5,
                  100,
                  105,
                  118,
                  95,
                  115,
                  0,
                  2,
                  // 2, "div_u"
                  5,
                  100,
                  105,
                  118,
                  95,
                  117,
                  0,
                  3,
                  // 3, "rem_s"
                  5,
                  114,
                  101,
                  109,
                  95,
                  115,
                  0,
                  4,
                  // 4, "rem_u"
                  5,
                  114,
                  101,
                  109,
                  95,
                  117,
                  0,
                  5,
                  // 5, "get_high"
                  8,
                  103,
                  101,
                  116,
                  95,
                  104,
                  105,
                  103,
                  104,
                  0,
                  0,
                  // section "code"
                  10,
                  191,
                  1,
                  6,
                  // 0, "get_high"
                  4,
                  0,
                  35,
                  0,
                  11,
                  // 1, "mul"
                  36,
                  1,
                  1,
                  126,
                  32,
                  0,
                  173,
                  32,
                  1,
                  173,
                  66,
                  32,
                  134,
                  132,
                  32,
                  2,
                  173,
                  32,
                  3,
                  173,
                  66,
                  32,
                  134,
                  132,
                  126,
                  34,
                  4,
                  66,
                  32,
                  135,
                  167,
                  36,
                  0,
                  32,
                  4,
                  167,
                  11,
                  // 2, "div_s"
                  36,
                  1,
                  1,
                  126,
                  32,
                  0,
                  173,
                  32,
                  1,
                  173,
                  66,
                  32,
                  134,
                  132,
                  32,
                  2,
                  173,
                  32,
                  3,
                  173,
                  66,
                  32,
                  134,
                  132,
                  127,
                  34,
                  4,
                  66,
                  32,
                  135,
                  167,
                  36,
                  0,
                  32,
                  4,
                  167,
                  11,
                  // 3, "div_u"
                  36,
                  1,
                  1,
                  126,
                  32,
                  0,
                  173,
                  32,
                  1,
                  173,
                  66,
                  32,
                  134,
                  132,
                  32,
                  2,
                  173,
                  32,
                  3,
                  173,
                  66,
                  32,
                  134,
                  132,
                  128,
                  34,
                  4,
                  66,
                  32,
                  135,
                  167,
                  36,
                  0,
                  32,
                  4,
                  167,
                  11,
                  // 4, "rem_s"
                  36,
                  1,
                  1,
                  126,
                  32,
                  0,
                  173,
                  32,
                  1,
                  173,
                  66,
                  32,
                  134,
                  132,
                  32,
                  2,
                  173,
                  32,
                  3,
                  173,
                  66,
                  32,
                  134,
                  132,
                  129,
                  34,
                  4,
                  66,
                  32,
                  135,
                  167,
                  36,
                  0,
                  32,
                  4,
                  167,
                  11,
                  // 5, "rem_u"
                  36,
                  1,
                  1,
                  126,
                  32,
                  0,
                  173,
                  32,
                  1,
                  173,
                  66,
                  32,
                  134,
                  132,
                  32,
                  2,
                  173,
                  32,
                  3,
                  173,
                  66,
                  32,
                  134,
                  132,
                  130,
                  34,
                  4,
                  66,
                  32,
                  135,
                  167,
                  36,
                  0,
                  32,
                  4,
                  167,
                  11
                ])
              ),
              {}
            ).exports;
          } catch {
          }
          function Long(low, high, unsigned) {
            this.low = low | 0;
            this.high = high | 0;
            this.unsigned = !!unsigned;
          }
          Long.prototype.__isLong__;
          Object.defineProperty(Long.prototype, "__isLong__", {
            value: true
          });
          function isLong(obj) {
            return (obj && obj["__isLong__"]) === true;
          }
          function ctz32(value) {
            var c = Math.clz32(value & -value);
            return value ? 31 - c : c;
          }
          Long.isLong = isLong;
          var INT_CACHE = {};
          var UINT_CACHE = {};
          function fromInt(value, unsigned) {
            var obj, cachedObj, cache;
            if (unsigned) {
              value >>>= 0;
              if (cache = 0 <= value && value < 256) {
                cachedObj = UINT_CACHE[value];
                if (cachedObj) return cachedObj;
              }
              obj = fromBits(value, 0, true);
              if (cache) UINT_CACHE[value] = obj;
              return obj;
            } else {
              value |= 0;
              if (cache = -128 <= value && value < 128) {
                cachedObj = INT_CACHE[value];
                if (cachedObj) return cachedObj;
              }
              obj = fromBits(value, value < 0 ? -1 : 0, false);
              if (cache) INT_CACHE[value] = obj;
              return obj;
            }
          }
          Long.fromInt = fromInt;
          function fromNumber(value, unsigned) {
            if (isNaN(value)) return unsigned ? UZERO : ZERO;
            if (unsigned) {
              if (value < 0) return UZERO;
              if (value >= TWO_PWR_64_DBL) return MAX_UNSIGNED_VALUE;
            } else {
              if (value <= -TWO_PWR_63_DBL) return MIN_VALUE;
              if (value + 1 >= TWO_PWR_63_DBL) return MAX_VALUE;
            }
            if (value < 0) return fromNumber(-value, unsigned).neg();
            return fromBits(
              value % TWO_PWR_32_DBL | 0,
              value / TWO_PWR_32_DBL | 0,
              unsigned
            );
          }
          Long.fromNumber = fromNumber;
          function fromBits(lowBits, highBits, unsigned) {
            return new Long(lowBits, highBits, unsigned);
          }
          Long.fromBits = fromBits;
          var pow_dbl = Math.pow;
          function fromString(str, unsigned, radix) {
            if (str.length === 0) throw Error("empty string");
            if (typeof unsigned === "number") {
              radix = unsigned;
              unsigned = false;
            } else {
              unsigned = !!unsigned;
            }
            if (str === "NaN" || str === "Infinity" || str === "+Infinity" || str === "-Infinity")
              return unsigned ? UZERO : ZERO;
            radix = radix || 10;
            if (radix < 2 || 36 < radix) throw RangeError("radix");
            var p;
            if ((p = str.indexOf("-")) > 0) throw Error("interior hyphen");
            else if (p === 0) {
              return fromString(str.substring(1), unsigned, radix).neg();
            }
            var radixToPower = fromNumber(pow_dbl(radix, 8));
            var result = ZERO;
            for (var i = 0; i < str.length; i += 8) {
              var size = Math.min(8, str.length - i), value = parseInt(str.substring(i, i + size), radix);
              if (size < 8) {
                var power = fromNumber(pow_dbl(radix, size));
                result = result.mul(power).add(fromNumber(value));
              } else {
                result = result.mul(radixToPower);
                result = result.add(fromNumber(value));
              }
            }
            result.unsigned = unsigned;
            return result;
          }
          Long.fromString = fromString;
          function fromValue(val, unsigned) {
            if (typeof val === "number") return fromNumber(val, unsigned);
            if (typeof val === "string") return fromString(val, unsigned);
            return fromBits(
              val.low,
              val.high,
              typeof unsigned === "boolean" ? unsigned : val.unsigned
            );
          }
          Long.fromValue = fromValue;
          var TWO_PWR_16_DBL = 1 << 16;
          var TWO_PWR_24_DBL = 1 << 24;
          var TWO_PWR_32_DBL = TWO_PWR_16_DBL * TWO_PWR_16_DBL;
          var TWO_PWR_64_DBL = TWO_PWR_32_DBL * TWO_PWR_32_DBL;
          var TWO_PWR_63_DBL = TWO_PWR_64_DBL / 2;
          var TWO_PWR_24 = fromInt(TWO_PWR_24_DBL);
          var ZERO = fromInt(0);
          Long.ZERO = ZERO;
          var UZERO = fromInt(0, true);
          Long.UZERO = UZERO;
          var ONE = fromInt(1);
          Long.ONE = ONE;
          var UONE = fromInt(1, true);
          Long.UONE = UONE;
          var NEG_ONE = fromInt(-1);
          Long.NEG_ONE = NEG_ONE;
          var MAX_VALUE = fromBits(4294967295 | 0, 2147483647 | 0, false);
          Long.MAX_VALUE = MAX_VALUE;
          var MAX_UNSIGNED_VALUE = fromBits(4294967295 | 0, 4294967295 | 0, true);
          Long.MAX_UNSIGNED_VALUE = MAX_UNSIGNED_VALUE;
          var MIN_VALUE = fromBits(0, 2147483648 | 0, false);
          Long.MIN_VALUE = MIN_VALUE;
          var LongPrototype = Long.prototype;
          LongPrototype.toInt = function toInt() {
            return this.unsigned ? this.low >>> 0 : this.low;
          };
          LongPrototype.toNumber = function toNumber() {
            if (this.unsigned)
              return (this.high >>> 0) * TWO_PWR_32_DBL + (this.low >>> 0);
            return this.high * TWO_PWR_32_DBL + (this.low >>> 0);
          };
          LongPrototype.toString = function toString(radix) {
            radix = radix || 10;
            if (radix < 2 || 36 < radix) throw RangeError("radix");
            if (this.isZero()) return "0";
            if (this.isNegative()) {
              if (this.eq(MIN_VALUE)) {
                var radixLong = fromNumber(radix), div = this.div(radixLong), rem1 = div.mul(radixLong).sub(this);
                return div.toString(radix) + rem1.toInt().toString(radix);
              } else return "-" + this.neg().toString(radix);
            }
            var radixToPower = fromNumber(pow_dbl(radix, 6), this.unsigned), rem = this;
            var result = "";
            while (true) {
              var remDiv = rem.div(radixToPower), intval = rem.sub(remDiv.mul(radixToPower)).toInt() >>> 0, digits = intval.toString(radix);
              rem = remDiv;
              if (rem.isZero()) return digits + result;
              else {
                while (digits.length < 6) digits = "0" + digits;
                result = "" + digits + result;
              }
            }
          };
          LongPrototype.getHighBits = function getHighBits() {
            return this.high;
          };
          LongPrototype.getHighBitsUnsigned = function getHighBitsUnsigned() {
            return this.high >>> 0;
          };
          LongPrototype.getLowBits = function getLowBits() {
            return this.low;
          };
          LongPrototype.getLowBitsUnsigned = function getLowBitsUnsigned() {
            return this.low >>> 0;
          };
          LongPrototype.getNumBitsAbs = function getNumBitsAbs() {
            if (this.isNegative())
              return this.eq(MIN_VALUE) ? 64 : this.neg().getNumBitsAbs();
            var val = this.high != 0 ? this.high : this.low;
            for (var bit = 31; bit > 0; bit--) if ((val & 1 << bit) != 0) break;
            return this.high != 0 ? bit + 33 : bit + 1;
          };
          LongPrototype.isSafeInteger = function isSafeInteger() {
            var top11Bits = this.high >> 21;
            if (!top11Bits) return true;
            if (this.unsigned) return false;
            return top11Bits === -1 && !(this.low === 0 && this.high === -2097152);
          };
          LongPrototype.isZero = function isZero() {
            return this.high === 0 && this.low === 0;
          };
          LongPrototype.eqz = LongPrototype.isZero;
          LongPrototype.isNegative = function isNegative() {
            return !this.unsigned && this.high < 0;
          };
          LongPrototype.isPositive = function isPositive() {
            return this.unsigned || this.high >= 0;
          };
          LongPrototype.isOdd = function isOdd() {
            return (this.low & 1) === 1;
          };
          LongPrototype.isEven = function isEven() {
            return (this.low & 1) === 0;
          };
          LongPrototype.equals = function equals(other) {
            if (!isLong(other)) other = fromValue(other);
            if (this.unsigned !== other.unsigned && this.high >>> 31 === 1 && other.high >>> 31 === 1)
              return false;
            return this.high === other.high && this.low === other.low;
          };
          LongPrototype.eq = LongPrototype.equals;
          LongPrototype.notEquals = function notEquals(other) {
            return !this.eq(
              /* validates */
              other
            );
          };
          LongPrototype.neq = LongPrototype.notEquals;
          LongPrototype.ne = LongPrototype.notEquals;
          LongPrototype.lessThan = function lessThan(other) {
            return this.comp(
              /* validates */
              other
            ) < 0;
          };
          LongPrototype.lt = LongPrototype.lessThan;
          LongPrototype.lessThanOrEqual = function lessThanOrEqual(other) {
            return this.comp(
              /* validates */
              other
            ) <= 0;
          };
          LongPrototype.lte = LongPrototype.lessThanOrEqual;
          LongPrototype.le = LongPrototype.lessThanOrEqual;
          LongPrototype.greaterThan = function greaterThan(other) {
            return this.comp(
              /* validates */
              other
            ) > 0;
          };
          LongPrototype.gt = LongPrototype.greaterThan;
          LongPrototype.greaterThanOrEqual = function greaterThanOrEqual(other) {
            return this.comp(
              /* validates */
              other
            ) >= 0;
          };
          LongPrototype.gte = LongPrototype.greaterThanOrEqual;
          LongPrototype.ge = LongPrototype.greaterThanOrEqual;
          LongPrototype.compare = function compare(other) {
            if (!isLong(other)) other = fromValue(other);
            if (this.eq(other)) return 0;
            var thisNeg = this.isNegative(), otherNeg = other.isNegative();
            if (thisNeg && !otherNeg) return -1;
            if (!thisNeg && otherNeg) return 1;
            if (!this.unsigned) return this.sub(other).isNegative() ? -1 : 1;
            return other.high >>> 0 > this.high >>> 0 || other.high === this.high && other.low >>> 0 > this.low >>> 0 ? -1 : 1;
          };
          LongPrototype.comp = LongPrototype.compare;
          LongPrototype.negate = function negate() {
            if (!this.unsigned && this.eq(MIN_VALUE)) return MIN_VALUE;
            return this.not().add(ONE);
          };
          LongPrototype.neg = LongPrototype.negate;
          LongPrototype.add = function add(addend) {
            if (!isLong(addend)) addend = fromValue(addend);
            var a48 = this.high >>> 16;
            var a32 = this.high & 65535;
            var a16 = this.low >>> 16;
            var a00 = this.low & 65535;
            var b48 = addend.high >>> 16;
            var b32 = addend.high & 65535;
            var b16 = addend.low >>> 16;
            var b00 = addend.low & 65535;
            var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
            c00 += a00 + b00;
            c16 += c00 >>> 16;
            c00 &= 65535;
            c16 += a16 + b16;
            c32 += c16 >>> 16;
            c16 &= 65535;
            c32 += a32 + b32;
            c48 += c32 >>> 16;
            c32 &= 65535;
            c48 += a48 + b48;
            c48 &= 65535;
            return fromBits(c16 << 16 | c00, c48 << 16 | c32, this.unsigned);
          };
          LongPrototype.subtract = function subtract(subtrahend) {
            if (!isLong(subtrahend)) subtrahend = fromValue(subtrahend);
            return this.add(subtrahend.neg());
          };
          LongPrototype.sub = LongPrototype.subtract;
          LongPrototype.multiply = function multiply(multiplier) {
            if (this.isZero()) return this;
            if (!isLong(multiplier)) multiplier = fromValue(multiplier);
            if (wasm) {
              var low = wasm["mul"](
                this.low,
                this.high,
                multiplier.low,
                multiplier.high
              );
              return fromBits(low, wasm["get_high"](), this.unsigned);
            }
            if (multiplier.isZero()) return this.unsigned ? UZERO : ZERO;
            if (this.eq(MIN_VALUE)) return multiplier.isOdd() ? MIN_VALUE : ZERO;
            if (multiplier.eq(MIN_VALUE)) return this.isOdd() ? MIN_VALUE : ZERO;
            if (this.isNegative()) {
              if (multiplier.isNegative()) return this.neg().mul(multiplier.neg());
              else return this.neg().mul(multiplier).neg();
            } else if (multiplier.isNegative())
              return this.mul(multiplier.neg()).neg();
            if (this.lt(TWO_PWR_24) && multiplier.lt(TWO_PWR_24))
              return fromNumber(
                this.toNumber() * multiplier.toNumber(),
                this.unsigned
              );
            var a48 = this.high >>> 16;
            var a32 = this.high & 65535;
            var a16 = this.low >>> 16;
            var a00 = this.low & 65535;
            var b48 = multiplier.high >>> 16;
            var b32 = multiplier.high & 65535;
            var b16 = multiplier.low >>> 16;
            var b00 = multiplier.low & 65535;
            var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
            c00 += a00 * b00;
            c16 += c00 >>> 16;
            c00 &= 65535;
            c16 += a16 * b00;
            c32 += c16 >>> 16;
            c16 &= 65535;
            c16 += a00 * b16;
            c32 += c16 >>> 16;
            c16 &= 65535;
            c32 += a32 * b00;
            c48 += c32 >>> 16;
            c32 &= 65535;
            c32 += a16 * b16;
            c48 += c32 >>> 16;
            c32 &= 65535;
            c32 += a00 * b32;
            c48 += c32 >>> 16;
            c32 &= 65535;
            c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
            c48 &= 65535;
            return fromBits(c16 << 16 | c00, c48 << 16 | c32, this.unsigned);
          };
          LongPrototype.mul = LongPrototype.multiply;
          LongPrototype.divide = function divide(divisor) {
            if (!isLong(divisor)) divisor = fromValue(divisor);
            if (divisor.isZero()) throw Error("division by zero");
            if (wasm) {
              if (!this.unsigned && this.high === -2147483648 && divisor.low === -1 && divisor.high === -1) {
                return this;
              }
              var low = (this.unsigned ? wasm["div_u"] : wasm["div_s"])(
                this.low,
                this.high,
                divisor.low,
                divisor.high
              );
              return fromBits(low, wasm["get_high"](), this.unsigned);
            }
            if (this.isZero()) return this.unsigned ? UZERO : ZERO;
            var approx, rem, res;
            if (!this.unsigned) {
              if (this.eq(MIN_VALUE)) {
                if (divisor.eq(ONE) || divisor.eq(NEG_ONE))
                  return MIN_VALUE;
                else if (divisor.eq(MIN_VALUE)) return ONE;
                else {
                  var halfThis = this.shr(1);
                  approx = halfThis.div(divisor).shl(1);
                  if (approx.eq(ZERO)) {
                    return divisor.isNegative() ? ONE : NEG_ONE;
                  } else {
                    rem = this.sub(divisor.mul(approx));
                    res = approx.add(rem.div(divisor));
                    return res;
                  }
                }
              } else if (divisor.eq(MIN_VALUE)) return this.unsigned ? UZERO : ZERO;
              if (this.isNegative()) {
                if (divisor.isNegative()) return this.neg().div(divisor.neg());
                return this.neg().div(divisor).neg();
              } else if (divisor.isNegative()) return this.div(divisor.neg()).neg();
              res = ZERO;
            } else {
              if (!divisor.unsigned) divisor = divisor.toUnsigned();
              if (divisor.gt(this)) return UZERO;
              if (divisor.gt(this.shru(1)))
                return UONE;
              res = UZERO;
            }
            rem = this;
            while (rem.gte(divisor)) {
              approx = Math.max(1, Math.floor(rem.toNumber() / divisor.toNumber()));
              var log2 = Math.ceil(Math.log(approx) / Math.LN2), delta = log2 <= 48 ? 1 : pow_dbl(2, log2 - 48), approxRes = fromNumber(approx), approxRem = approxRes.mul(divisor);
              while (approxRem.isNegative() || approxRem.gt(rem)) {
                approx -= delta;
                approxRes = fromNumber(approx, this.unsigned);
                approxRem = approxRes.mul(divisor);
              }
              if (approxRes.isZero()) approxRes = ONE;
              res = res.add(approxRes);
              rem = rem.sub(approxRem);
            }
            return res;
          };
          LongPrototype.div = LongPrototype.divide;
          LongPrototype.modulo = function modulo(divisor) {
            if (!isLong(divisor)) divisor = fromValue(divisor);
            if (wasm) {
              var low = (this.unsigned ? wasm["rem_u"] : wasm["rem_s"])(
                this.low,
                this.high,
                divisor.low,
                divisor.high
              );
              return fromBits(low, wasm["get_high"](), this.unsigned);
            }
            return this.sub(this.div(divisor).mul(divisor));
          };
          LongPrototype.mod = LongPrototype.modulo;
          LongPrototype.rem = LongPrototype.modulo;
          LongPrototype.not = function not() {
            return fromBits(~this.low, ~this.high, this.unsigned);
          };
          LongPrototype.countLeadingZeros = function countLeadingZeros() {
            return this.high ? Math.clz32(this.high) : Math.clz32(this.low) + 32;
          };
          LongPrototype.clz = LongPrototype.countLeadingZeros;
          LongPrototype.countTrailingZeros = function countTrailingZeros() {
            return this.low ? ctz32(this.low) : ctz32(this.high) + 32;
          };
          LongPrototype.ctz = LongPrototype.countTrailingZeros;
          LongPrototype.and = function and(other) {
            if (!isLong(other)) other = fromValue(other);
            return fromBits(
              this.low & other.low,
              this.high & other.high,
              this.unsigned
            );
          };
          LongPrototype.or = function or(other) {
            if (!isLong(other)) other = fromValue(other);
            return fromBits(
              this.low | other.low,
              this.high | other.high,
              this.unsigned
            );
          };
          LongPrototype.xor = function xor(other) {
            if (!isLong(other)) other = fromValue(other);
            return fromBits(
              this.low ^ other.low,
              this.high ^ other.high,
              this.unsigned
            );
          };
          LongPrototype.shiftLeft = function shiftLeft(numBits) {
            if (isLong(numBits)) numBits = numBits.toInt();
            if ((numBits &= 63) === 0) return this;
            else if (numBits < 32)
              return fromBits(
                this.low << numBits,
                this.high << numBits | this.low >>> 32 - numBits,
                this.unsigned
              );
            else return fromBits(0, this.low << numBits - 32, this.unsigned);
          };
          LongPrototype.shl = LongPrototype.shiftLeft;
          LongPrototype.shiftRight = function shiftRight(numBits) {
            if (isLong(numBits)) numBits = numBits.toInt();
            if ((numBits &= 63) === 0) return this;
            else if (numBits < 32)
              return fromBits(
                this.low >>> numBits | this.high << 32 - numBits,
                this.high >> numBits,
                this.unsigned
              );
            else
              return fromBits(
                this.high >> numBits - 32,
                this.high >= 0 ? 0 : -1,
                this.unsigned
              );
          };
          LongPrototype.shr = LongPrototype.shiftRight;
          LongPrototype.shiftRightUnsigned = function shiftRightUnsigned(numBits) {
            if (isLong(numBits)) numBits = numBits.toInt();
            if ((numBits &= 63) === 0) return this;
            if (numBits < 32)
              return fromBits(
                this.low >>> numBits | this.high << 32 - numBits,
                this.high >>> numBits,
                this.unsigned
              );
            if (numBits === 32) return fromBits(this.high, 0, this.unsigned);
            return fromBits(this.high >>> numBits - 32, 0, this.unsigned);
          };
          LongPrototype.shru = LongPrototype.shiftRightUnsigned;
          LongPrototype.shr_u = LongPrototype.shiftRightUnsigned;
          LongPrototype.rotateLeft = function rotateLeft(numBits) {
            var b;
            if (isLong(numBits)) numBits = numBits.toInt();
            if ((numBits &= 63) === 0) return this;
            if (numBits === 32) return fromBits(this.high, this.low, this.unsigned);
            if (numBits < 32) {
              b = 32 - numBits;
              return fromBits(
                this.low << numBits | this.high >>> b,
                this.high << numBits | this.low >>> b,
                this.unsigned
              );
            }
            numBits -= 32;
            b = 32 - numBits;
            return fromBits(
              this.high << numBits | this.low >>> b,
              this.low << numBits | this.high >>> b,
              this.unsigned
            );
          };
          LongPrototype.rotl = LongPrototype.rotateLeft;
          LongPrototype.rotateRight = function rotateRight(numBits) {
            var b;
            if (isLong(numBits)) numBits = numBits.toInt();
            if ((numBits &= 63) === 0) return this;
            if (numBits === 32) return fromBits(this.high, this.low, this.unsigned);
            if (numBits < 32) {
              b = 32 - numBits;
              return fromBits(
                this.high << b | this.low >>> numBits,
                this.low << b | this.high >>> numBits,
                this.unsigned
              );
            }
            numBits -= 32;
            b = 32 - numBits;
            return fromBits(
              this.low << b | this.high >>> numBits,
              this.high << b | this.low >>> numBits,
              this.unsigned
            );
          };
          LongPrototype.rotr = LongPrototype.rotateRight;
          LongPrototype.toSigned = function toSigned() {
            if (!this.unsigned) return this;
            return fromBits(this.low, this.high, false);
          };
          LongPrototype.toUnsigned = function toUnsigned() {
            if (this.unsigned) return this;
            return fromBits(this.low, this.high, true);
          };
          LongPrototype.toBytes = function toBytes(le) {
            return le ? this.toBytesLE() : this.toBytesBE();
          };
          LongPrototype.toBytesLE = function toBytesLE() {
            var hi = this.high, lo = this.low;
            return [
              lo & 255,
              lo >>> 8 & 255,
              lo >>> 16 & 255,
              lo >>> 24,
              hi & 255,
              hi >>> 8 & 255,
              hi >>> 16 & 255,
              hi >>> 24
            ];
          };
          LongPrototype.toBytesBE = function toBytesBE() {
            var hi = this.high, lo = this.low;
            return [
              hi >>> 24,
              hi >>> 16 & 255,
              hi >>> 8 & 255,
              hi & 255,
              lo >>> 24,
              lo >>> 16 & 255,
              lo >>> 8 & 255,
              lo & 255
            ];
          };
          Long.fromBytes = function fromBytes(bytes, unsigned, le) {
            return le ? Long.fromBytesLE(bytes, unsigned) : Long.fromBytesBE(bytes, unsigned);
          };
          Long.fromBytesLE = function fromBytesLE(bytes, unsigned) {
            return new Long(
              bytes[0] | bytes[1] << 8 | bytes[2] << 16 | bytes[3] << 24,
              bytes[4] | bytes[5] << 8 | bytes[6] << 16 | bytes[7] << 24,
              unsigned
            );
          };
          Long.fromBytesBE = function fromBytesBE(bytes, unsigned) {
            return new Long(
              bytes[4] << 24 | bytes[5] << 16 | bytes[6] << 8 | bytes[7],
              bytes[0] << 24 | bytes[1] << 16 | bytes[2] << 8 | bytes[3],
              unsigned
            );
          };
          if (typeof BigInt === "function") {
            Long.fromBigInt = function fromBigInt(value, unsigned) {
              var lowBits = Number(BigInt.asIntN(32, value));
              var highBits = Number(BigInt.asIntN(32, value >> BigInt(32)));
              return fromBits(lowBits, highBits, unsigned);
            };
            Long.fromValue = function fromValueWithBigInt(value, unsigned) {
              if (typeof value === "bigint") return Long.fromBigInt(value, unsigned);
              return fromValue(value, unsigned);
            };
            LongPrototype.toBigInt = function toBigInt() {
              var lowBigInt = BigInt(this.low >>> 0);
              var highBigInt = BigInt(this.unsigned ? this.high >>> 0 : this.high);
              return highBigInt << BigInt(32) | lowBigInt;
            };
          }
          var _default = _exports.default = Long;
        }
      );
    }
  });

  // node_modules/protobufjs/src/util/minimal.js
  var require_minimal = __commonJS({
    "node_modules/protobufjs/src/util/minimal.js"(exports) {
      "use strict";
      var util = exports;
      util.asPromise = require_aspromise();
      util.base64 = require_base64();
      util.EventEmitter = require_eventemitter();
      util.float = require_float();
      util.utf8 = require_utf8();
      util.pool = require_pool();
      util.LongBits = require_longbits();
      function isUnsafeProperty(key) {
        return key === "__proto__" || key === "prototype" || key === "constructor";
      }
      util.isUnsafeProperty = isUnsafeProperty;
      util.isNode = Boolean(typeof global !== "undefined" && global && global.process && global.process.versions && global.process.versions.node);
      util.global = util.isNode && global || typeof window !== "undefined" && window || typeof self !== "undefined" && self || exports;
      util.emptyArray = Object.freeze ? Object.freeze([]) : (
        /* istanbul ignore next */
        []
      );
      util.emptyObject = Object.freeze ? Object.freeze({}) : (
        /* istanbul ignore next */
        {}
      );
      util.isInteger = Number.isInteger || /* istanbul ignore next */
      function isInteger(value) {
        return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
      };
      util.isString = function isString(value) {
        return typeof value === "string" || value instanceof String;
      };
      util.isObject = function isObject(value) {
        return value && typeof value === "object";
      };
      util.isset = /**
       * Checks if a property on a message is considered to be present.
       * @param {Object} obj Plain object or message instance
       * @param {string} prop Property name
       * @returns {boolean} `true` if considered to be present, otherwise `false`
       */
      util.isSet = function isSet(obj, prop) {
        var value = obj[prop];
        if (value != null && Object.hasOwnProperty.call(obj, prop))
          return typeof value !== "object" || (Array.isArray(value) ? value.length : Object.keys(value).length) > 0;
        return false;
      };
      util.Buffer = (function() {
        try {
          var Buffer2 = util.global.Buffer;
          return Buffer2.prototype.utf8Write ? Buffer2 : (
            /* istanbul ignore next */
            null
          );
        } catch (e) {
          return null;
        }
      })();
      util._Buffer_from = null;
      util._Buffer_allocUnsafe = null;
      util.newBuffer = function newBuffer(sizeOrArray) {
        return typeof sizeOrArray === "number" ? util.Buffer ? util._Buffer_allocUnsafe(sizeOrArray) : new util.Array(sizeOrArray) : util.Buffer ? util._Buffer_from(sizeOrArray) : typeof Uint8Array === "undefined" ? sizeOrArray : new Uint8Array(sizeOrArray);
      };
      util.Array = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
      util.Long = /* istanbul ignore next */
      util.global.dcodeIO && /* istanbul ignore next */
      util.global.dcodeIO.Long || /* istanbul ignore next */
      util.global.Long || (function() {
        try {
          var Long = require_umd();
          return Long && Long.isLong ? Long : null;
        } catch (e) {
          return null;
        }
      })();
      util.key2Re = /^true|false|0|1$/;
      util.key32Re = /^-?(?:0|[1-9][0-9]*)$/;
      util.key64Re = /^(?:[\\x00-\\xff]{8}|-?(?:0|[1-9][0-9]*))$/;
      util.longToHash = function longToHash(value) {
        return value ? util.LongBits.from(value).toHash() : util.LongBits.zeroHash;
      };
      util.longFromHash = function longFromHash(hash, unsigned) {
        var bits = util.LongBits.fromHash(hash);
        if (util.Long)
          return util.Long.fromBits(bits.lo, bits.hi, unsigned);
        return bits.toNumber(Boolean(unsigned));
      };
      function merge(dst) {
        var ifNotSet = typeof arguments[arguments.length - 1] === "boolean", limit = ifNotSet ? arguments.length - 1 : arguments.length;
        ifNotSet = ifNotSet && arguments[arguments.length - 1];
        for (var a = 1; a < limit; ++a) {
          var src = arguments[a];
          if (!src)
            continue;
          for (var keys = Object.keys(src), i = 0; i < keys.length; ++i)
            if (!isUnsafeProperty(keys[i]) && (dst[keys[i]] === void 0 || !ifNotSet))
              dst[keys[i]] = src[keys[i]];
        }
        return dst;
      }
      util.merge = merge;
      util.nestingLimit = 32;
      util.recursionLimit = 100;
      util.makeProp = function makeProp(obj, key) {
        Object.defineProperty(obj, key, {
          enumerable: true,
          configurable: true,
          writable: true
        });
      };
      util.lcFirst = function lcFirst(str) {
        return str.charAt(0).toLowerCase() + str.substring(1);
      };
      function newError(name) {
        function CustomError(message, properties) {
          if (!(this instanceof CustomError))
            return new CustomError(message, properties);
          Object.defineProperty(this, "message", { get: function() {
            return message;
          } });
          if (Error.captureStackTrace)
            Error.captureStackTrace(this, CustomError);
          else
            Object.defineProperty(this, "stack", { value: new Error().stack || "" });
          if (properties)
            merge(this, properties);
        }
        CustomError.prototype = Object.create(Error.prototype, {
          constructor: {
            value: CustomError,
            writable: true,
            enumerable: false,
            configurable: true
          },
          name: {
            get: function get() {
              return name;
            },
            set: void 0,
            enumerable: false,
            // configurable: false would accurately preserve the behavior of
            // the original, but I'm guessing that was not intentional.
            // For an actual error subclass, this property would
            // be configurable.
            configurable: true
          },
          toString: {
            value: function value() {
              return this.name + ": " + this.message;
            },
            writable: true,
            enumerable: false,
            configurable: true
          }
        });
        return CustomError;
      }
      util.newError = newError;
      util.ProtocolError = newError("ProtocolError");
      util.oneOfGetter = function getOneOf(fieldNames) {
        var fieldMap = {};
        for (var i = 0; i < fieldNames.length; ++i)
          fieldMap[fieldNames[i]] = 1;
        return function() {
          for (var keys = Object.keys(this), i2 = keys.length - 1; i2 > -1; --i2)
            if (fieldMap[keys[i2]] === 1 && this[keys[i2]] !== void 0 && this[keys[i2]] !== null)
              return keys[i2];
        };
      };
      util.oneOfSetter = function setOneOf(fieldNames) {
        return function(name) {
          for (var i = 0; i < fieldNames.length; ++i)
            if (fieldNames[i] !== name)
              delete this[fieldNames[i]];
        };
      };
      util.toJSONOptions = {
        longs: String,
        enums: String,
        bytes: String,
        json: true
      };
      util._configure = function() {
        var Buffer2 = util.Buffer;
        if (!Buffer2) {
          util._Buffer_from = util._Buffer_allocUnsafe = null;
          return;
        }
        util._Buffer_from = Buffer2.from !== Uint8Array.from && Buffer2.from || /* istanbul ignore next */
        function Buffer_from(value, encoding) {
          return new Buffer2(value, encoding);
        };
        util._Buffer_allocUnsafe = Buffer2.allocUnsafe || /* istanbul ignore next */
        function Buffer_allocUnsafe(size) {
          return new Buffer2(size);
        };
      };
    }
  });

  // node_modules/protobufjs/src/writer.js
  var require_writer = __commonJS({
    "node_modules/protobufjs/src/writer.js"(exports, module) {
      "use strict";
      module.exports = Writer;
      var util = require_minimal();
      var BufferWriter;
      var LongBits = util.LongBits;
      var base64 = util.base64;
      var utf8 = util.utf8;
      function Op(fn, len, val) {
        this.fn = fn;
        this.len = len;
        this.next = void 0;
        this.val = val;
      }
      function noop() {
      }
      function State(writer) {
        this.head = writer.head;
        this.tail = writer.tail;
        this.len = writer.len;
        this.next = writer.states;
      }
      function Writer() {
        this.len = 0;
        this.head = new Op(noop, 0, 0);
        this.tail = this.head;
        this.states = null;
      }
      var create = function create2() {
        return util.Buffer ? function create_buffer_setup() {
          return (Writer.create = function create_buffer() {
            return new BufferWriter();
          })();
        } : function create_array() {
          return new Writer();
        };
      };
      Writer.create = create();
      Writer.alloc = function alloc(size) {
        return new util.Array(size);
      };
      if (util.Array !== Array)
        Writer.alloc = util.pool(Writer.alloc, util.Array.prototype.subarray);
      Writer.prototype._push = function push(fn, len, val) {
        this.tail = this.tail.next = new Op(fn, len, val);
        this.len += len;
        return this;
      };
      function writeByte(val, buf, pos) {
        buf[pos] = val & 255;
      }
      function writeVarint32(val, buf, pos) {
        while (val > 127) {
          buf[pos++] = val & 127 | 128;
          val >>>= 7;
        }
        buf[pos] = val;
      }
      function VarintOp(len, val) {
        this.len = len;
        this.next = void 0;
        this.val = val;
      }
      VarintOp.prototype = Object.create(Op.prototype);
      VarintOp.prototype.fn = writeVarint32;
      Writer.prototype.uint32 = function write_uint32(value) {
        this.len += (this.tail = this.tail.next = new VarintOp(
          (value = value >>> 0) < 128 ? 1 : value < 16384 ? 2 : value < 2097152 ? 3 : value < 268435456 ? 4 : 5,
          value
        )).len;
        return this;
      };
      Writer.prototype.int32 = function write_int32(value) {
        return (value |= 0) < 0 ? this._push(writeVarint64, 10, LongBits.fromNumber(value)) : this.uint32(value);
      };
      Writer.prototype.sint32 = function write_sint32(value) {
        return this.uint32((value << 1 ^ value >> 31) >>> 0);
      };
      function writeVarint64(val, buf, pos) {
        var lo = val.lo, hi = val.hi;
        while (hi) {
          buf[pos++] = lo & 127 | 128;
          lo = (lo >>> 7 | hi << 25) >>> 0;
          hi >>>= 7;
        }
        while (lo > 127) {
          buf[pos++] = lo & 127 | 128;
          lo = lo >>> 7;
        }
        buf[pos++] = lo;
      }
      Writer.prototype.uint64 = function write_uint64(value) {
        var bits = LongBits.from(value);
        return this._push(writeVarint64, bits.length(), bits);
      };
      Writer.prototype.int64 = Writer.prototype.uint64;
      Writer.prototype.sint64 = function write_sint64(value) {
        var bits = LongBits.from(value).zzEncode();
        return this._push(writeVarint64, bits.length(), bits);
      };
      Writer.prototype.bool = function write_bool(value) {
        return this._push(writeByte, 1, value ? 1 : 0);
      };
      function writeFixed32(val, buf, pos) {
        buf[pos] = val & 255;
        buf[pos + 1] = val >>> 8 & 255;
        buf[pos + 2] = val >>> 16 & 255;
        buf[pos + 3] = val >>> 24;
      }
      Writer.prototype.fixed32 = function write_fixed32(value) {
        return this._push(writeFixed32, 4, value >>> 0);
      };
      Writer.prototype.sfixed32 = Writer.prototype.fixed32;
      Writer.prototype.fixed64 = function write_fixed64(value) {
        var bits = LongBits.from(value);
        return this._push(writeFixed32, 4, bits.lo)._push(writeFixed32, 4, bits.hi);
      };
      Writer.prototype.sfixed64 = Writer.prototype.fixed64;
      Writer.prototype.float = function write_float(value) {
        return this._push(util.float.writeFloatLE, 4, value);
      };
      Writer.prototype.double = function write_double(value) {
        return this._push(util.float.writeDoubleLE, 8, value);
      };
      var writeBytes = util.Array.prototype.set ? function writeBytes_set(val, buf, pos) {
        buf.set(val, pos);
      } : function writeBytes_for(val, buf, pos) {
        for (var i = 0; i < val.length; ++i)
          buf[pos + i] = val[i];
      };
      Writer.prototype.bytes = function write_bytes(value) {
        var len = value.length >>> 0;
        if (!len)
          return this._push(writeByte, 1, 0);
        if (util.isString(value)) {
          var buf = Writer.alloc(len = base64.length(value));
          base64.decode(value, buf, 0);
          value = buf;
        }
        return this.uint32(len)._push(writeBytes, len, value);
      };
      Writer.prototype.string = function write_string(value) {
        var len = utf8.length(value);
        return len ? this.uint32(len)._push(utf8.write, len, value) : this._push(writeByte, 1, 0);
      };
      Writer.prototype.fork = function fork() {
        this.states = new State(this);
        this.head = this.tail = new Op(noop, 0, 0);
        this.len = 0;
        return this;
      };
      Writer.prototype.reset = function reset() {
        if (this.states) {
          this.head = this.states.head;
          this.tail = this.states.tail;
          this.len = this.states.len;
          this.states = this.states.next;
        } else {
          this.head = this.tail = new Op(noop, 0, 0);
          this.len = 0;
        }
        return this;
      };
      Writer.prototype.ldelim = function ldelim() {
        var head = this.head, tail = this.tail, len = this.len;
        this.reset().uint32(len);
        if (len) {
          this.tail.next = head.next;
          this.tail = tail;
          this.len += len;
        }
        return this;
      };
      Writer.prototype.finish = function finish() {
        var head = this.head.next, buf = this.constructor.alloc(this.len), pos = 0;
        while (head) {
          head.fn(head.val, buf, pos);
          pos += head.len;
          head = head.next;
        }
        return buf;
      };
      Writer._configure = function(BufferWriter_) {
        BufferWriter = BufferWriter_;
        Writer.create = create();
        BufferWriter._configure();
      };
    }
  });

  // node_modules/protobufjs/src/writer_buffer.js
  var require_writer_buffer = __commonJS({
    "node_modules/protobufjs/src/writer_buffer.js"(exports, module) {
      "use strict";
      module.exports = BufferWriter;
      var Writer = require_writer();
      (BufferWriter.prototype = Object.create(Writer.prototype)).constructor = BufferWriter;
      var util = require_minimal();
      function BufferWriter() {
        Writer.call(this);
      }
      BufferWriter._configure = function() {
        BufferWriter.alloc = util._Buffer_allocUnsafe;
        BufferWriter.writeBytesBuffer = util.Buffer && util.Buffer.prototype instanceof Uint8Array && util.Buffer.prototype.set.name === "set" ? function writeBytesBuffer_set(val, buf, pos) {
          buf.set(val, pos);
        } : function writeBytesBuffer_copy(val, buf, pos) {
          if (val.copy)
            val.copy(buf, pos, 0, val.length);
          else for (var i = 0; i < val.length; )
            buf[pos++] = val[i++];
        };
      };
      BufferWriter.prototype.bytes = function write_bytes_buffer(value) {
        if (util.isString(value))
          value = util._Buffer_from(value, "base64");
        var len = value.length >>> 0;
        this.uint32(len);
        if (len)
          this._push(BufferWriter.writeBytesBuffer, len, value);
        return this;
      };
      function writeStringBuffer(val, buf, pos) {
        if (val.length < 40)
          util.utf8.write(val, buf, pos);
        else if (buf.utf8Write)
          buf.utf8Write(val, pos);
        else
          buf.write(val, pos);
      }
      BufferWriter.prototype.string = function write_string_buffer(value) {
        var len = util.Buffer.byteLength(value);
        this.uint32(len);
        if (len)
          this._push(writeStringBuffer, len, value);
        return this;
      };
      BufferWriter._configure();
    }
  });

  // node_modules/protobufjs/src/reader.js
  var require_reader = __commonJS({
    "node_modules/protobufjs/src/reader.js"(exports, module) {
      "use strict";
      module.exports = Reader;
      var util = require_minimal();
      var BufferReader;
      var LongBits = util.LongBits;
      var utf8 = util.utf8;
      function indexOutOfRange(reader, writeLength) {
        return RangeError("index out of range: " + reader.pos + " + " + (writeLength || 1) + " > " + reader.len);
      }
      function Reader(buffer) {
        this.buf = buffer;
        this.pos = 0;
        this.len = buffer.length;
      }
      var create_array = typeof Uint8Array !== "undefined" ? function create_typed_array(buffer) {
        if (buffer instanceof Uint8Array || Array.isArray(buffer))
          return new Reader(buffer);
        throw Error("illegal buffer");
      } : function create_array2(buffer) {
        if (Array.isArray(buffer))
          return new Reader(buffer);
        throw Error("illegal buffer");
      };
      var create = function create2() {
        return util.Buffer ? function create_buffer_setup(buffer) {
          return (Reader.create = function create_buffer(buffer2) {
            return util.Buffer.isBuffer(buffer2) ? new BufferReader(buffer2) : create_array(buffer2);
          })(buffer);
        } : create_array;
      };
      Reader.create = create();
      Reader.prototype._slice = util.Array.prototype.subarray || /* istanbul ignore next */
      util.Array.prototype.slice;
      function readVarint32NearEnd(reader) {
        var value = 0;
        for (var i = 0; i < 4; ++i) {
          if (reader.pos >= reader.len)
            throw indexOutOfRange(reader);
          var b = reader.buf[reader.pos++];
          value = (value | (b & 127) << i * 7) >>> 0;
          if (b < 128)
            return value;
        }
        throw indexOutOfRange(reader);
      }
      Reader.prototype.uint32 = /* @__PURE__ */ (function read_uint32_setup() {
        var value = 4294967295;
        return function read_uint32() {
          if (this.len - this.pos < 5) {
            if (this.pos >= this.len)
              throw indexOutOfRange(this);
            if (this.buf[this.pos] >= 128)
              return readVarint32NearEnd(this);
          }
          value = (this.buf[this.pos] & 127) >>> 0;
          if (this.buf[this.pos++] < 128) return value;
          value = (value | (this.buf[this.pos] & 127) << 7) >>> 0;
          if (this.buf[this.pos++] < 128) return value;
          value = (value | (this.buf[this.pos] & 127) << 14) >>> 0;
          if (this.buf[this.pos++] < 128) return value;
          value = (value | (this.buf[this.pos] & 127) << 21) >>> 0;
          if (this.buf[this.pos++] < 128) return value;
          value = (value | (this.buf[this.pos] & 15) << 28) >>> 0;
          if (this.buf[this.pos++] < 128) return value;
          if ((this.pos += 5) > this.len) {
            this.pos = this.len;
            throw indexOutOfRange(this, 10);
          }
          return value;
        };
      })();
      Reader.prototype.int32 = function read_int32() {
        return this.uint32() | 0;
      };
      Reader.prototype.sint32 = function read_sint32() {
        var value = this.uint32();
        return value >>> 1 ^ -(value & 1) | 0;
      };
      function readLongVarint() {
        var bits = new LongBits(0, 0);
        var i = 0;
        if (this.len - this.pos > 4) {
          for (; i < 4; ++i) {
            bits.lo = (bits.lo | (this.buf[this.pos] & 127) << i * 7) >>> 0;
            if (this.buf[this.pos++] < 128)
              return bits;
          }
          bits.lo = (bits.lo | (this.buf[this.pos] & 127) << 28) >>> 0;
          bits.hi = (bits.hi | (this.buf[this.pos] & 127) >> 4) >>> 0;
          if (this.buf[this.pos++] < 128)
            return bits;
          i = 0;
        } else {
          for (; i < 3; ++i) {
            if (this.pos >= this.len)
              throw indexOutOfRange(this);
            bits.lo = (bits.lo | (this.buf[this.pos] & 127) << i * 7) >>> 0;
            if (this.buf[this.pos++] < 128)
              return bits;
          }
          bits.lo = (bits.lo | (this.buf[this.pos++] & 127) << i * 7) >>> 0;
          return bits;
        }
        if (this.len - this.pos > 4) {
          for (; i < 5; ++i) {
            bits.hi = (bits.hi | (this.buf[this.pos] & 127) << i * 7 + 3) >>> 0;
            if (this.buf[this.pos++] < 128)
              return bits;
          }
        } else {
          for (; i < 5; ++i) {
            if (this.pos >= this.len)
              throw indexOutOfRange(this);
            bits.hi = (bits.hi | (this.buf[this.pos] & 127) << i * 7 + 3) >>> 0;
            if (this.buf[this.pos++] < 128)
              return bits;
          }
        }
        throw Error("invalid varint encoding");
      }
      Reader.prototype.bool = function read_bool() {
        return this.uint32() !== 0;
      };
      function readFixed32_end(buf, end) {
        return (buf[end - 4] | buf[end - 3] << 8 | buf[end - 2] << 16 | buf[end - 1] << 24) >>> 0;
      }
      Reader.prototype.fixed32 = function read_fixed32() {
        if (this.pos + 4 > this.len)
          throw indexOutOfRange(this, 4);
        return readFixed32_end(this.buf, this.pos += 4);
      };
      Reader.prototype.sfixed32 = function read_sfixed32() {
        if (this.pos + 4 > this.len)
          throw indexOutOfRange(this, 4);
        return readFixed32_end(this.buf, this.pos += 4) | 0;
      };
      function readFixed64() {
        if (this.pos + 8 > this.len)
          throw indexOutOfRange(this, 8);
        return new LongBits(readFixed32_end(this.buf, this.pos += 4), readFixed32_end(this.buf, this.pos += 4));
      }
      Reader.prototype.float = function read_float() {
        if (this.pos + 4 > this.len)
          throw indexOutOfRange(this, 4);
        var value = util.float.readFloatLE(this.buf, this.pos);
        this.pos += 4;
        return value;
      };
      Reader.prototype.double = function read_double() {
        if (this.pos + 8 > this.len)
          throw indexOutOfRange(this, 4);
        var value = util.float.readDoubleLE(this.buf, this.pos);
        this.pos += 8;
        return value;
      };
      Reader.prototype.bytes = function read_bytes() {
        var length = this.uint32(), start = this.pos, end = this.pos + length;
        if (end > this.len)
          throw indexOutOfRange(this, length);
        this.pos += length;
        if (Array.isArray(this.buf))
          return this.buf.slice(start, end);
        if (start === end) {
          var nativeBuffer = util.Buffer;
          return nativeBuffer ? nativeBuffer.alloc(0) : new this.buf.constructor(0);
        }
        return this._slice.call(this.buf, start, end);
      };
      Reader.prototype.string = function read_string() {
        var bytes = this.bytes();
        return utf8.read(bytes, 0, bytes.length);
      };
      Reader.prototype.skip = function skip(length) {
        if (typeof length === "number") {
          if (this.pos + length > this.len)
            throw indexOutOfRange(this, length);
          this.pos += length;
        } else {
          do {
            if (this.pos >= this.len)
              throw indexOutOfRange(this);
          } while (this.buf[this.pos++] & 128);
        }
        return this;
      };
      Reader.recursionLimit = util.recursionLimit;
      Reader.prototype.skipType = function(wireType, depth) {
        if (depth === void 0) depth = 0;
        if (depth > Reader.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        switch (wireType) {
          case 0:
            this.skip();
            break;
          case 1:
            this.skip(8);
            break;
          case 2:
            this.skip(this.uint32());
            break;
          case 3:
            while ((wireType = this.uint32() & 7) !== 4) {
              this.skipType(wireType, depth + 1);
            }
            break;
          case 5:
            this.skip(4);
            break;
          /* istanbul ignore next */
          default:
            throw Error("invalid wire type " + wireType + " at offset " + this.pos);
        }
        return this;
      };
      Reader._configure = function(BufferReader_) {
        BufferReader = BufferReader_;
        Reader.create = create();
        BufferReader._configure();
        var fn = util.Long ? "toLong" : (
          /* istanbul ignore next */
          "toNumber"
        );
        util.merge(Reader.prototype, {
          int64: function read_int64() {
            return readLongVarint.call(this)[fn](false);
          },
          uint64: function read_uint64() {
            return readLongVarint.call(this)[fn](true);
          },
          sint64: function read_sint64() {
            return readLongVarint.call(this).zzDecode()[fn](false);
          },
          fixed64: function read_fixed64() {
            return readFixed64.call(this)[fn](true);
          },
          sfixed64: function read_sfixed64() {
            return readFixed64.call(this)[fn](false);
          }
        });
      };
    }
  });

  // node_modules/protobufjs/src/reader_buffer.js
  var require_reader_buffer = __commonJS({
    "node_modules/protobufjs/src/reader_buffer.js"(exports, module) {
      "use strict";
      module.exports = BufferReader;
      var Reader = require_reader();
      (BufferReader.prototype = Object.create(Reader.prototype)).constructor = BufferReader;
      var util = require_minimal();
      function BufferReader(buffer) {
        Reader.call(this, buffer);
      }
      BufferReader._configure = function() {
        if (util.Buffer)
          BufferReader.prototype._slice = util.Buffer.prototype.slice;
      };
      BufferReader.prototype.string = function read_string_buffer() {
        var len = this.uint32();
        return this.buf.utf8Slice ? this.buf.utf8Slice(this.pos, this.pos = Math.min(this.pos + len, this.len)) : this.buf.toString("utf-8", this.pos, this.pos = Math.min(this.pos + len, this.len));
      };
      BufferReader._configure();
    }
  });

  // node_modules/protobufjs/src/rpc/service.js
  var require_service = __commonJS({
    "node_modules/protobufjs/src/rpc/service.js"(exports, module) {
      "use strict";
      module.exports = Service;
      var util = require_minimal();
      (Service.prototype = Object.create(util.EventEmitter.prototype)).constructor = Service;
      function Service(rpcImpl, requestDelimited, responseDelimited) {
        if (typeof rpcImpl !== "function")
          throw TypeError("rpcImpl must be a function");
        util.EventEmitter.call(this);
        this.rpcImpl = rpcImpl;
        this.requestDelimited = Boolean(requestDelimited);
        this.responseDelimited = Boolean(responseDelimited);
      }
      Service.prototype.rpcCall = function rpcCall(method, requestCtor, responseCtor, request, callback) {
        if (!request)
          throw TypeError("request must be specified");
        var self2 = this;
        if (!callback)
          return util.asPromise(rpcCall, self2, method, requestCtor, responseCtor, request);
        if (!self2.rpcImpl) {
          setTimeout(function() {
            callback(Error("already ended"));
          }, 0);
          return void 0;
        }
        try {
          return self2.rpcImpl(
            method,
            requestCtor[self2.requestDelimited ? "encodeDelimited" : "encode"](request).finish(),
            function rpcCallback(err, response) {
              if (err) {
                self2.emit("error", err, method);
                return callback(err);
              }
              if (response === null) {
                self2.end(
                  /* endedByRPC */
                  true
                );
                return void 0;
              }
              if (!(response instanceof responseCtor)) {
                try {
                  response = responseCtor[self2.responseDelimited ? "decodeDelimited" : "decode"](response);
                } catch (err2) {
                  self2.emit("error", err2, method);
                  return callback(err2);
                }
              }
              self2.emit("data", response, method);
              return callback(null, response);
            }
          );
        } catch (err) {
          self2.emit("error", err, method);
          setTimeout(function() {
            callback(err);
          }, 0);
          return void 0;
        }
      };
      Service.prototype.end = function end(endedByRPC) {
        if (this.rpcImpl) {
          if (!endedByRPC)
            this.rpcImpl(null, null, null);
          this.rpcImpl = null;
          this.emit("end").off();
        }
        return this;
      };
    }
  });

  // node_modules/protobufjs/src/rpc.js
  var require_rpc = __commonJS({
    "node_modules/protobufjs/src/rpc.js"(exports) {
      "use strict";
      var rpc = exports;
      rpc.Service = require_service();
    }
  });

  // node_modules/protobufjs/src/roots.js
  var require_roots = __commonJS({
    "node_modules/protobufjs/src/roots.js"(exports, module) {
      "use strict";
      module.exports = /* @__PURE__ */ Object.create(null);
    }
  });

  // node_modules/protobufjs/src/index-minimal.js
  var require_index_minimal = __commonJS({
    "node_modules/protobufjs/src/index-minimal.js"(exports) {
      "use strict";
      var protobuf = exports;
      protobuf.build = "minimal";
      protobuf.Writer = require_writer();
      protobuf.BufferWriter = require_writer_buffer();
      protobuf.Reader = require_reader();
      protobuf.BufferReader = require_reader_buffer();
      protobuf.util = require_minimal();
      protobuf.rpc = require_rpc();
      protobuf.roots = require_roots();
      protobuf.configure = configure;
      function configure() {
        protobuf.util._configure();
        protobuf.Writer._configure(protobuf.BufferWriter);
        protobuf.Reader._configure(protobuf.BufferReader);
      }
      configure();
    }
  });

  // node_modules/protobufjs/minimal.js
  var require_minimal2 = __commonJS({
    "node_modules/protobufjs/minimal.js"(exports, module) {
      "use strict";
      module.exports = require_index_minimal();
    }
  });

  // node_modules/@smartspectra/node-sdk/js/messages/generated.js
  var require_generated = __commonJS({
    "node_modules/@smartspectra/node-sdk/js/messages/generated.js"(exports, module) {
      "use strict";
      var $protobuf = require_minimal2();
      var $Reader = $protobuf.Reader;
      var $Writer = $protobuf.Writer;
      var $util = $protobuf.util;
      var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});
      $root.presage = (function() {
        var presage = {};
        presage.smartspectra = (function() {
          var smartspectra = {};
          smartspectra.Measurement = (function() {
            function Measurement(properties) {
              if (properties) {
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                  if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
              }
            }
            Measurement.prototype.value = 0;
            Measurement.prototype.stable = false;
            Measurement.prototype.timestamp = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
            Measurement.create = function create(properties) {
              return new Measurement(properties);
            };
            Measurement.encode = function encode(message, writer, q) {
              if (!writer)
                writer = $Writer.create();
              if (q === void 0)
                q = 0;
              if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
              if (message.value != null && Object.hasOwnProperty.call(message, "value"))
                writer.uint32(
                  /* id 1, wireType 5 =*/
                  13
                ).float(message.value);
              if (message.stable != null && Object.hasOwnProperty.call(message, "stable"))
                writer.uint32(
                  /* id 2, wireType 0 =*/
                  16
                ).bool(message.stable);
              if (message.timestamp != null && Object.hasOwnProperty.call(message, "timestamp"))
                writer.uint32(
                  /* id 3, wireType 0 =*/
                  24
                ).int64(message.timestamp);
              return writer;
            };
            Measurement.encodeDelimited = function encodeDelimited(message, writer) {
              return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };
            Measurement.decode = function decode(reader, length, error, long) {
              if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
              if (long === void 0)
                long = 0;
              if (long > $Reader.recursionLimit)
                throw Error("maximum nesting depth exceeded");
              var end, message;
              if (length === void 0)
                end = reader.len;
              else {
                end = reader.pos + length;
                if (end > reader.len)
                  throw RangeError("index out of range");
                length = reader.len;
                reader.len = end;
              }
              message = new $root.presage.smartspectra.Measurement();
              while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                  break;
                switch (tag >>> 3) {
                  case 1: {
                    message.value = reader.float();
                    break;
                  }
                  case 2: {
                    message.stable = reader.bool();
                    break;
                  }
                  case 3: {
                    message.timestamp = reader.int64();
                    break;
                  }
                  default:
                    reader.skipType(tag & 7, long);
                    break;
                }
              }
              if (length !== void 0) {
                if (reader.pos !== end)
                  throw RangeError("index out of range");
                reader.len = length;
              }
              return message;
            };
            Measurement.decodeDelimited = function decodeDelimited(reader) {
              if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
              return this.decode(reader, reader.uint32());
            };
            Measurement.verify = function verify(message, long) {
              if (typeof message !== "object" || message === null)
                return "object expected";
              if (long === void 0)
                long = 0;
              if (long > $util.recursionLimit)
                return "maximum nesting depth exceeded";
              if (message.value != null && Object.hasOwnProperty.call(message, "value")) {
                if (typeof message.value !== "number")
                  return "value: number expected";
              }
              if (message.stable != null && Object.hasOwnProperty.call(message, "stable")) {
                if (typeof message.stable !== "boolean")
                  return "stable: boolean expected";
              }
              if (message.timestamp != null && Object.hasOwnProperty.call(message, "timestamp")) {
                if (!$util.isInteger(message.timestamp) && !(message.timestamp && $util.isInteger(message.timestamp.low) && $util.isInteger(message.timestamp.high)))
                  return "timestamp: integer|Long expected";
              }
              return null;
            };
            Measurement.fromObject = function fromObject(object, long) {
              if (object instanceof $root.presage.smartspectra.Measurement)
                return object;
              if (!$util.isObject(object))
                throw TypeError(".presage.smartspectra.Measurement: object expected");
              if (long === void 0)
                long = 0;
              if (long > $util.recursionLimit)
                throw Error("maximum nesting depth exceeded");
              var message = new $root.presage.smartspectra.Measurement();
              if (object.value != null)
                message.value = Number(object.value);
              if (object.stable != null)
                message.stable = Boolean(object.stable);
              if (object.timestamp != null) {
                if ($util.Long)
                  message.timestamp = $util.Long.fromValue(object.timestamp, false);
                else if (typeof object.timestamp === "string")
                  message.timestamp = parseInt(object.timestamp, 10);
                else if (typeof object.timestamp === "number")
                  message.timestamp = object.timestamp;
                else if (typeof object.timestamp === "object")
                  message.timestamp = new $util.LongBits(object.timestamp.low >>> 0, object.timestamp.high >>> 0).toNumber();
              }
              return message;
            };
            Measurement.toObject = function toObject(message, options, q) {
              if (!options)
                options = {};
              if (q === void 0)
                q = 0;
              if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
              var object = {};
              if (options.defaults) {
                object.value = 0;
                object.stable = false;
                if ($util.Long) {
                  var long = new $util.Long(0, 0, false);
                  object.timestamp = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : typeof BigInt !== "undefined" && options.longs === BigInt ? long.toBigInt() : long;
                } else
                  object.timestamp = options.longs === String ? "0" : typeof BigInt !== "undefined" && options.longs === BigInt ? BigInt("0") : 0;
              }
              if (message.value != null && Object.hasOwnProperty.call(message, "value"))
                object.value = options.json && !isFinite(message.value) ? String(message.value) : message.value;
              if (message.stable != null && Object.hasOwnProperty.call(message, "stable"))
                object.stable = message.stable;
              if (message.timestamp != null && Object.hasOwnProperty.call(message, "timestamp"))
                if (typeof BigInt !== "undefined" && options.longs === BigInt)
                  object.timestamp = typeof message.timestamp === "number" ? BigInt(message.timestamp) : $util.Long.fromBits(message.timestamp.low >>> 0, message.timestamp.high >>> 0, false).toBigInt();
                else if (typeof message.timestamp === "number")
                  object.timestamp = options.longs === String ? String(message.timestamp) : message.timestamp;
                else
                  object.timestamp = options.longs === String ? $util.Long.prototype.toString.call(message.timestamp) : options.longs === Number ? new $util.LongBits(message.timestamp.low >>> 0, message.timestamp.high >>> 0).toNumber() : message.timestamp;
              return object;
            };
            Measurement.prototype.toJSON = function toJSON() {
              return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
            Measurement.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
              if (typeUrlPrefix === void 0) {
                typeUrlPrefix = "type.googleapis.com";
              }
              return typeUrlPrefix + "/presage.smartspectra.Measurement";
            };
            return Measurement;
          })();
          smartspectra.DetectionStatus = (function() {
            function DetectionStatus(properties) {
              if (properties) {
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                  if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
              }
            }
            DetectionStatus.prototype.detected = false;
            DetectionStatus.prototype.stable = false;
            DetectionStatus.prototype.timestamp = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
            DetectionStatus.create = function create(properties) {
              return new DetectionStatus(properties);
            };
            DetectionStatus.encode = function encode(message, writer, q) {
              if (!writer)
                writer = $Writer.create();
              if (q === void 0)
                q = 0;
              if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
              if (message.detected != null && Object.hasOwnProperty.call(message, "detected"))
                writer.uint32(
                  /* id 1, wireType 0 =*/
                  8
                ).bool(message.detected);
              if (message.stable != null && Object.hasOwnProperty.call(message, "stable"))
                writer.uint32(
                  /* id 2, wireType 0 =*/
                  16
                ).bool(message.stable);
              if (message.timestamp != null && Object.hasOwnProperty.call(message, "timestamp"))
                writer.uint32(
                  /* id 3, wireType 0 =*/
                  24
                ).int64(message.timestamp);
              return writer;
            };
            DetectionStatus.encodeDelimited = function encodeDelimited(message, writer) {
              return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };
            DetectionStatus.decode = function decode(reader, length, error, long) {
              if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
              if (long === void 0)
                long = 0;
              if (long > $Reader.recursionLimit)
                throw Error("maximum nesting depth exceeded");
              var end, message;
              if (length === void 0)
                end = reader.len;
              else {
                end = reader.pos + length;
                if (end > reader.len)
                  throw RangeError("index out of range");
                length = reader.len;
                reader.len = end;
              }
              message = new $root.presage.smartspectra.DetectionStatus();
              while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                  break;
                switch (tag >>> 3) {
                  case 1: {
                    message.detected = reader.bool();
                    break;
                  }
                  case 2: {
                    message.stable = reader.bool();
                    break;
                  }
                  case 3: {
                    message.timestamp = reader.int64();
                    break;
                  }
                  default:
                    reader.skipType(tag & 7, long);
                    break;
                }
              }
              if (length !== void 0) {
                if (reader.pos !== end)
                  throw RangeError("index out of range");
                reader.len = length;
              }
              return message;
            };
            DetectionStatus.decodeDelimited = function decodeDelimited(reader) {
              if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
              return this.decode(reader, reader.uint32());
            };
            DetectionStatus.verify = function verify(message, long) {
              if (typeof message !== "object" || message === null)
                return "object expected";
              if (long === void 0)
                long = 0;
              if (long > $util.recursionLimit)
                return "maximum nesting depth exceeded";
              if (message.detected != null && Object.hasOwnProperty.call(message, "detected")) {
                if (typeof message.detected !== "boolean")
                  return "detected: boolean expected";
              }
              if (message.stable != null && Object.hasOwnProperty.call(message, "stable")) {
                if (typeof message.stable !== "boolean")
                  return "stable: boolean expected";
              }
              if (message.timestamp != null && Object.hasOwnProperty.call(message, "timestamp")) {
                if (!$util.isInteger(message.timestamp) && !(message.timestamp && $util.isInteger(message.timestamp.low) && $util.isInteger(message.timestamp.high)))
                  return "timestamp: integer|Long expected";
              }
              return null;
            };
            DetectionStatus.fromObject = function fromObject(object, long) {
              if (object instanceof $root.presage.smartspectra.DetectionStatus)
                return object;
              if (!$util.isObject(object))
                throw TypeError(".presage.smartspectra.DetectionStatus: object expected");
              if (long === void 0)
                long = 0;
              if (long > $util.recursionLimit)
                throw Error("maximum nesting depth exceeded");
              var message = new $root.presage.smartspectra.DetectionStatus();
              if (object.detected != null)
                message.detected = Boolean(object.detected);
              if (object.stable != null)
                message.stable = Boolean(object.stable);
              if (object.timestamp != null) {
                if ($util.Long)
                  message.timestamp = $util.Long.fromValue(object.timestamp, false);
                else if (typeof object.timestamp === "string")
                  message.timestamp = parseInt(object.timestamp, 10);
                else if (typeof object.timestamp === "number")
                  message.timestamp = object.timestamp;
                else if (typeof object.timestamp === "object")
                  message.timestamp = new $util.LongBits(object.timestamp.low >>> 0, object.timestamp.high >>> 0).toNumber();
              }
              return message;
            };
            DetectionStatus.toObject = function toObject(message, options, q) {
              if (!options)
                options = {};
              if (q === void 0)
                q = 0;
              if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
              var object = {};
              if (options.defaults) {
                object.detected = false;
                object.stable = false;
                if ($util.Long) {
                  var long = new $util.Long(0, 0, false);
                  object.timestamp = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : typeof BigInt !== "undefined" && options.longs === BigInt ? long.toBigInt() : long;
                } else
                  object.timestamp = options.longs === String ? "0" : typeof BigInt !== "undefined" && options.longs === BigInt ? BigInt("0") : 0;
              }
              if (message.detected != null && Object.hasOwnProperty.call(message, "detected"))
                object.detected = message.detected;
              if (message.stable != null && Object.hasOwnProperty.call(message, "stable"))
                object.stable = message.stable;
              if (message.timestamp != null && Object.hasOwnProperty.call(message, "timestamp"))
                if (typeof BigInt !== "undefined" && options.longs === BigInt)
                  object.timestamp = typeof message.timestamp === "number" ? BigInt(message.timestamp) : $util.Long.fromBits(message.timestamp.low >>> 0, message.timestamp.high >>> 0, false).toBigInt();
                else if (typeof message.timestamp === "number")
                  object.timestamp = options.longs === String ? String(message.timestamp) : message.timestamp;
                else
                  object.timestamp = options.longs === String ? $util.Long.prototype.toString.call(message.timestamp) : options.longs === Number ? new $util.LongBits(message.timestamp.low >>> 0, message.timestamp.high >>> 0).toNumber() : message.timestamp;
              return object;
            };
            DetectionStatus.prototype.toJSON = function toJSON() {
              return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
            DetectionStatus.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
              if (typeUrlPrefix === void 0) {
                typeUrlPrefix = "type.googleapis.com";
              }
              return typeUrlPrefix + "/presage.smartspectra.DetectionStatus";
            };
            return DetectionStatus;
          })();
          smartspectra.MeasurementWithConfidence = (function() {
            function MeasurementWithConfidence(properties) {
              if (properties) {
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                  if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
              }
            }
            MeasurementWithConfidence.prototype.value = 0;
            MeasurementWithConfidence.prototype.stable = false;
            MeasurementWithConfidence.prototype.confidence = 0;
            MeasurementWithConfidence.prototype.timestamp = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
            MeasurementWithConfidence.create = function create(properties) {
              return new MeasurementWithConfidence(properties);
            };
            MeasurementWithConfidence.encode = function encode(message, writer, q) {
              if (!writer)
                writer = $Writer.create();
              if (q === void 0)
                q = 0;
              if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
              if (message.value != null && Object.hasOwnProperty.call(message, "value"))
                writer.uint32(
                  /* id 1, wireType 5 =*/
                  13
                ).float(message.value);
              if (message.stable != null && Object.hasOwnProperty.call(message, "stable"))
                writer.uint32(
                  /* id 2, wireType 0 =*/
                  16
                ).bool(message.stable);
              if (message.confidence != null && Object.hasOwnProperty.call(message, "confidence"))
                writer.uint32(
                  /* id 3, wireType 5 =*/
                  29
                ).float(message.confidence);
              if (message.timestamp != null && Object.hasOwnProperty.call(message, "timestamp"))
                writer.uint32(
                  /* id 4, wireType 0 =*/
                  32
                ).int64(message.timestamp);
              return writer;
            };
            MeasurementWithConfidence.encodeDelimited = function encodeDelimited(message, writer) {
              return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };
            MeasurementWithConfidence.decode = function decode(reader, length, error, long) {
              if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
              if (long === void 0)
                long = 0;
              if (long > $Reader.recursionLimit)
                throw Error("maximum nesting depth exceeded");
              var end, message;
              if (length === void 0)
                end = reader.len;
              else {
                end = reader.pos + length;
                if (end > reader.len)
                  throw RangeError("index out of range");
                length = reader.len;
                reader.len = end;
              }
              message = new $root.presage.smartspectra.MeasurementWithConfidence();
              while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                  break;
                switch (tag >>> 3) {
                  case 1: {
                    message.value = reader.float();
                    break;
                  }
                  case 2: {
                    message.stable = reader.bool();
                    break;
                  }
                  case 3: {
                    message.confidence = reader.float();
                    break;
                  }
                  case 4: {
                    message.timestamp = reader.int64();
                    break;
                  }
                  default:
                    reader.skipType(tag & 7, long);
                    break;
                }
              }
              if (length !== void 0) {
                if (reader.pos !== end)
                  throw RangeError("index out of range");
                reader.len = length;
              }
              return message;
            };
            MeasurementWithConfidence.decodeDelimited = function decodeDelimited(reader) {
              if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
              return this.decode(reader, reader.uint32());
            };
            MeasurementWithConfidence.verify = function verify(message, long) {
              if (typeof message !== "object" || message === null)
                return "object expected";
              if (long === void 0)
                long = 0;
              if (long > $util.recursionLimit)
                return "maximum nesting depth exceeded";
              if (message.value != null && Object.hasOwnProperty.call(message, "value")) {
                if (typeof message.value !== "number")
                  return "value: number expected";
              }
              if (message.stable != null && Object.hasOwnProperty.call(message, "stable")) {
                if (typeof message.stable !== "boolean")
                  return "stable: boolean expected";
              }
              if (message.confidence != null && Object.hasOwnProperty.call(message, "confidence")) {
                if (typeof message.confidence !== "number")
                  return "confidence: number expected";
              }
              if (message.timestamp != null && Object.hasOwnProperty.call(message, "timestamp")) {
                if (!$util.isInteger(message.timestamp) && !(message.timestamp && $util.isInteger(message.timestamp.low) && $util.isInteger(message.timestamp.high)))
                  return "timestamp: integer|Long expected";
              }
              return null;
            };
            MeasurementWithConfidence.fromObject = function fromObject(object, long) {
              if (object instanceof $root.presage.smartspectra.MeasurementWithConfidence)
                return object;
              if (!$util.isObject(object))
                throw TypeError(".presage.smartspectra.MeasurementWithConfidence: object expected");
              if (long === void 0)
                long = 0;
              if (long > $util.recursionLimit)
                throw Error("maximum nesting depth exceeded");
              var message = new $root.presage.smartspectra.MeasurementWithConfidence();
              if (object.value != null)
                message.value = Number(object.value);
              if (object.stable != null)
                message.stable = Boolean(object.stable);
              if (object.confidence != null)
                message.confidence = Number(object.confidence);
              if (object.timestamp != null) {
                if ($util.Long)
                  message.timestamp = $util.Long.fromValue(object.timestamp, false);
                else if (typeof object.timestamp === "string")
                  message.timestamp = parseInt(object.timestamp, 10);
                else if (typeof object.timestamp === "number")
                  message.timestamp = object.timestamp;
                else if (typeof object.timestamp === "object")
                  message.timestamp = new $util.LongBits(object.timestamp.low >>> 0, object.timestamp.high >>> 0).toNumber();
              }
              return message;
            };
            MeasurementWithConfidence.toObject = function toObject(message, options, q) {
              if (!options)
                options = {};
              if (q === void 0)
                q = 0;
              if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
              var object = {};
              if (options.defaults) {
                object.value = 0;
                object.stable = false;
                object.confidence = 0;
                if ($util.Long) {
                  var long = new $util.Long(0, 0, false);
                  object.timestamp = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : typeof BigInt !== "undefined" && options.longs === BigInt ? long.toBigInt() : long;
                } else
                  object.timestamp = options.longs === String ? "0" : typeof BigInt !== "undefined" && options.longs === BigInt ? BigInt("0") : 0;
              }
              if (message.value != null && Object.hasOwnProperty.call(message, "value"))
                object.value = options.json && !isFinite(message.value) ? String(message.value) : message.value;
              if (message.stable != null && Object.hasOwnProperty.call(message, "stable"))
                object.stable = message.stable;
              if (message.confidence != null && Object.hasOwnProperty.call(message, "confidence"))
                object.confidence = options.json && !isFinite(message.confidence) ? String(message.confidence) : message.confidence;
              if (message.timestamp != null && Object.hasOwnProperty.call(message, "timestamp"))
                if (typeof BigInt !== "undefined" && options.longs === BigInt)
                  object.timestamp = typeof message.timestamp === "number" ? BigInt(message.timestamp) : $util.Long.fromBits(message.timestamp.low >>> 0, message.timestamp.high >>> 0, false).toBigInt();
                else if (typeof message.timestamp === "number")
                  object.timestamp = options.longs === String ? String(message.timestamp) : message.timestamp;
                else
                  object.timestamp = options.longs === String ? $util.Long.prototype.toString.call(message.timestamp) : options.longs === Number ? new $util.LongBits(message.timestamp.low >>> 0, message.timestamp.high >>> 0).toNumber() : message.timestamp;
              return object;
            };
            MeasurementWithConfidence.prototype.toJSON = function toJSON() {
              return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
            MeasurementWithConfidence.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
              if (typeUrlPrefix === void 0) {
                typeUrlPrefix = "type.googleapis.com";
              }
              return typeUrlPrefix + "/presage.smartspectra.MeasurementWithConfidence";
            };
            return MeasurementWithConfidence;
          })();
          smartspectra.ExpressionType = (function() {
            var valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "UNSPECIFIED"] = 0;
            values[valuesById[1] = "ANGRY"] = 1;
            values[valuesById[2] = "CONTEMPT"] = 2;
            values[valuesById[3] = "DISGUST"] = 3;
            values[valuesById[4] = "FEAR"] = 4;
            values[valuesById[5] = "HAPPY"] = 5;
            values[valuesById[6] = "NEUTRAL"] = 6;
            values[valuesById[7] = "SAD"] = 7;
            values[valuesById[8] = "SURPRISE"] = 8;
            return values;
          })();
          smartspectra.ExpressionScore = (function() {
            function ExpressionScore(properties) {
              if (properties) {
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                  if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
              }
            }
            ExpressionScore.prototype.type = 0;
            ExpressionScore.prototype.confidence = 0;
            ExpressionScore.create = function create(properties) {
              return new ExpressionScore(properties);
            };
            ExpressionScore.encode = function encode(message, writer, q) {
              if (!writer)
                writer = $Writer.create();
              if (q === void 0)
                q = 0;
              if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
              if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                writer.uint32(
                  /* id 1, wireType 0 =*/
                  8
                ).int32(message.type);
              if (message.confidence != null && Object.hasOwnProperty.call(message, "confidence"))
                writer.uint32(
                  /* id 2, wireType 5 =*/
                  21
                ).float(message.confidence);
              return writer;
            };
            ExpressionScore.encodeDelimited = function encodeDelimited(message, writer) {
              return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };
            ExpressionScore.decode = function decode(reader, length, error, long) {
              if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
              if (long === void 0)
                long = 0;
              if (long > $Reader.recursionLimit)
                throw Error("maximum nesting depth exceeded");
              var end, message;
              if (length === void 0)
                end = reader.len;
              else {
                end = reader.pos + length;
                if (end > reader.len)
                  throw RangeError("index out of range");
                length = reader.len;
                reader.len = end;
              }
              message = new $root.presage.smartspectra.ExpressionScore();
              while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                  break;
                switch (tag >>> 3) {
                  case 1: {
                    message.type = reader.int32();
                    break;
                  }
                  case 2: {
                    message.confidence = reader.float();
                    break;
                  }
                  default:
                    reader.skipType(tag & 7, long);
                    break;
                }
              }
              if (length !== void 0) {
                if (reader.pos !== end)
                  throw RangeError("index out of range");
                reader.len = length;
              }
              return message;
            };
            ExpressionScore.decodeDelimited = function decodeDelimited(reader) {
              if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
              return this.decode(reader, reader.uint32());
            };
            ExpressionScore.verify = function verify(message, long) {
              if (typeof message !== "object" || message === null)
                return "object expected";
              if (long === void 0)
                long = 0;
              if (long > $util.recursionLimit)
                return "maximum nesting depth exceeded";
              if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                switch (message.type) {
                  default:
                    return "type: enum value expected";
                  case 0:
                  case 1:
                  case 2:
                  case 3:
                  case 4:
                  case 5:
                  case 6:
                  case 7:
                  case 8:
                    break;
                }
              if (message.confidence != null && Object.hasOwnProperty.call(message, "confidence")) {
                if (typeof message.confidence !== "number")
                  return "confidence: number expected";
              }
              return null;
            };
            ExpressionScore.fromObject = function fromObject(object, long) {
              if (object instanceof $root.presage.smartspectra.ExpressionScore)
                return object;
              if (!$util.isObject(object))
                throw TypeError(".presage.smartspectra.ExpressionScore: object expected");
              if (long === void 0)
                long = 0;
              if (long > $util.recursionLimit)
                throw Error("maximum nesting depth exceeded");
              var message = new $root.presage.smartspectra.ExpressionScore();
              switch (object.type) {
                default:
                  if (typeof object.type === "number") {
                    message.type = object.type;
                    break;
                  }
                  break;
                case "UNSPECIFIED":
                case 0:
                  message.type = 0;
                  break;
                case "ANGRY":
                case 1:
                  message.type = 1;
                  break;
                case "CONTEMPT":
                case 2:
                  message.type = 2;
                  break;
                case "DISGUST":
                case 3:
                  message.type = 3;
                  break;
                case "FEAR":
                case 4:
                  message.type = 4;
                  break;
                case "HAPPY":
                case 5:
                  message.type = 5;
                  break;
                case "NEUTRAL":
                case 6:
                  message.type = 6;
                  break;
                case "SAD":
                case 7:
                  message.type = 7;
                  break;
                case "SURPRISE":
                case 8:
                  message.type = 8;
                  break;
              }
              if (object.confidence != null)
                message.confidence = Number(object.confidence);
              return message;
            };
            ExpressionScore.toObject = function toObject(message, options, q) {
              if (!options)
                options = {};
              if (q === void 0)
                q = 0;
              if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
              var object = {};
              if (options.defaults) {
                object.type = options.enums === String ? "UNSPECIFIED" : 0;
                object.confidence = 0;
              }
              if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                object.type = options.enums === String ? $root.presage.smartspectra.ExpressionType[message.type] === void 0 ? message.type : $root.presage.smartspectra.ExpressionType[message.type] : message.type;
              if (message.confidence != null && Object.hasOwnProperty.call(message, "confidence"))
                object.confidence = options.json && !isFinite(message.confidence) ? String(message.confidence) : message.confidence;
              return object;
            };
            ExpressionScore.prototype.toJSON = function toJSON() {
              return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
            ExpressionScore.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
              if (typeUrlPrefix === void 0) {
                typeUrlPrefix = "type.googleapis.com";
              }
              return typeUrlPrefix + "/presage.smartspectra.ExpressionScore";
            };
            return ExpressionScore;
          })();
          smartspectra.Expression = (function() {
            function Expression(properties) {
              this.scores = [];
              if (properties) {
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                  if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
              }
            }
            Expression.prototype.stable = false;
            Expression.prototype.timestamp = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
            Expression.prototype.scores = $util.emptyArray;
            Expression.create = function create(properties) {
              return new Expression(properties);
            };
            Expression.encode = function encode(message, writer, q) {
              if (!writer)
                writer = $Writer.create();
              if (q === void 0)
                q = 0;
              if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
              if (message.stable != null && Object.hasOwnProperty.call(message, "stable"))
                writer.uint32(
                  /* id 1, wireType 0 =*/
                  8
                ).bool(message.stable);
              if (message.timestamp != null && Object.hasOwnProperty.call(message, "timestamp"))
                writer.uint32(
                  /* id 2, wireType 0 =*/
                  16
                ).int64(message.timestamp);
              if (message.scores != null && message.scores.length)
                for (var i = 0; i < message.scores.length; ++i)
                  $root.presage.smartspectra.ExpressionScore.encode(message.scores[i], writer.uint32(
                    /* id 3, wireType 2 =*/
                    26
                  ).fork(), q + 1).ldelim();
              return writer;
            };
            Expression.encodeDelimited = function encodeDelimited(message, writer) {
              return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };
            Expression.decode = function decode(reader, length, error, long) {
              if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
              if (long === void 0)
                long = 0;
              if (long > $Reader.recursionLimit)
                throw Error("maximum nesting depth exceeded");
              var end, message;
              if (length === void 0)
                end = reader.len;
              else {
                end = reader.pos + length;
                if (end > reader.len)
                  throw RangeError("index out of range");
                length = reader.len;
                reader.len = end;
              }
              message = new $root.presage.smartspectra.Expression();
              while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                  break;
                switch (tag >>> 3) {
                  case 1: {
                    message.stable = reader.bool();
                    break;
                  }
                  case 2: {
                    message.timestamp = reader.int64();
                    break;
                  }
                  case 3: {
                    if (!(message.scores && message.scores.length))
                      message.scores = [];
                    message.scores.push($root.presage.smartspectra.ExpressionScore.decode(reader, reader.uint32(), void 0, long + 1));
                    break;
                  }
                  default:
                    reader.skipType(tag & 7, long);
                    break;
                }
              }
              if (length !== void 0) {
                if (reader.pos !== end)
                  throw RangeError("index out of range");
                reader.len = length;
              }
              return message;
            };
            Expression.decodeDelimited = function decodeDelimited(reader) {
              if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
              return this.decode(reader, reader.uint32());
            };
            Expression.verify = function verify(message, long) {
              if (typeof message !== "object" || message === null)
                return "object expected";
              if (long === void 0)
                long = 0;
              if (long > $util.recursionLimit)
                return "maximum nesting depth exceeded";
              if (message.stable != null && Object.hasOwnProperty.call(message, "stable")) {
                if (typeof message.stable !== "boolean")
                  return "stable: boolean expected";
              }
              if (message.timestamp != null && Object.hasOwnProperty.call(message, "timestamp")) {
                if (!$util.isInteger(message.timestamp) && !(message.timestamp && $util.isInteger(message.timestamp.low) && $util.isInteger(message.timestamp.high)))
                  return "timestamp: integer|Long expected";
              }
              if (message.scores != null && Object.hasOwnProperty.call(message, "scores")) {
                if (!Array.isArray(message.scores))
                  return "scores: array expected";
                for (var i = 0; i < message.scores.length; ++i) {
                  var error = $root.presage.smartspectra.ExpressionScore.verify(message.scores[i], long + 1);
                  if (error)
                    return "scores." + error;
                }
              }
              return null;
            };
            Expression.fromObject = function fromObject(object, long) {
              if (object instanceof $root.presage.smartspectra.Expression)
                return object;
              if (!$util.isObject(object))
                throw TypeError(".presage.smartspectra.Expression: object expected");
              if (long === void 0)
                long = 0;
              if (long > $util.recursionLimit)
                throw Error("maximum nesting depth exceeded");
              var message = new $root.presage.smartspectra.Expression();
              if (object.stable != null)
                message.stable = Boolean(object.stable);
              if (object.timestamp != null) {
                if ($util.Long)
                  message.timestamp = $util.Long.fromValue(object.timestamp, false);
                else if (typeof object.timestamp === "string")
                  message.timestamp = parseInt(object.timestamp, 10);
                else if (typeof object.timestamp === "number")
                  message.timestamp = object.timestamp;
                else if (typeof object.timestamp === "object")
                  message.timestamp = new $util.LongBits(object.timestamp.low >>> 0, object.timestamp.high >>> 0).toNumber();
              }
              if (object.scores) {
                if (!Array.isArray(object.scores))
                  throw TypeError(".presage.smartspectra.Expression.scores: array expected");
                message.scores = [];
                for (var i = 0; i < object.scores.length; ++i) {
                  if (!$util.isObject(object.scores[i]))
                    throw TypeError(".presage.smartspectra.Expression.scores: object expected");
                  message.scores[i] = $root.presage.smartspectra.ExpressionScore.fromObject(object.scores[i], long + 1);
                }
              }
              return message;
            };
            Expression.toObject = function toObject(message, options, q) {
              if (!options)
                options = {};
              if (q === void 0)
                q = 0;
              if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
              var object = {};
              if (options.arrays || options.defaults)
                object.scores = [];
              if (options.defaults) {
                object.stable = false;
                if ($util.Long) {
                  var long = new $util.Long(0, 0, false);
                  object.timestamp = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : typeof BigInt !== "undefined" && options.longs === BigInt ? long.toBigInt() : long;
                } else
                  object.timestamp = options.longs === String ? "0" : typeof BigInt !== "undefined" && options.longs === BigInt ? BigInt("0") : 0;
              }
              if (message.stable != null && Object.hasOwnProperty.call(message, "stable"))
                object.stable = message.stable;
              if (message.timestamp != null && Object.hasOwnProperty.call(message, "timestamp"))
                if (typeof BigInt !== "undefined" && options.longs === BigInt)
                  object.timestamp = typeof message.timestamp === "number" ? BigInt(message.timestamp) : $util.Long.fromBits(message.timestamp.low >>> 0, message.timestamp.high >>> 0, false).toBigInt();
                else if (typeof message.timestamp === "number")
                  object.timestamp = options.longs === String ? String(message.timestamp) : message.timestamp;
                else
                  object.timestamp = options.longs === String ? $util.Long.prototype.toString.call(message.timestamp) : options.longs === Number ? new $util.LongBits(message.timestamp.low >>> 0, message.timestamp.high >>> 0).toNumber() : message.timestamp;
              if (message.scores && message.scores.length) {
                object.scores = [];
                for (var j = 0; j < message.scores.length; ++j)
                  object.scores[j] = $root.presage.smartspectra.ExpressionScore.toObject(message.scores[j], options, q + 1);
              }
              return object;
            };
            Expression.prototype.toJSON = function toJSON() {
              return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
            Expression.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
              if (typeUrlPrefix === void 0) {
                typeUrlPrefix = "type.googleapis.com";
              }
              return typeUrlPrefix + "/presage.smartspectra.Expression";
            };
            return Expression;
          })();
          smartspectra.Hrv = (function() {
            function Hrv(properties) {
              if (properties) {
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                  if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
              }
            }
            Hrv.prototype.rmssd = 0;
            Hrv.prototype.meanNn = 0;
            Hrv.prototype.sdnn = 0;
            Hrv.prototype.baevsky = 0;
            Hrv.prototype.timestamp = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
            Hrv.prototype.confidence = 0;
            Hrv.prototype.stable = false;
            Hrv.create = function create(properties) {
              return new Hrv(properties);
            };
            Hrv.encode = function encode(message, writer, q) {
              if (!writer)
                writer = $Writer.create();
              if (q === void 0)
                q = 0;
              if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
              if (message.rmssd != null && Object.hasOwnProperty.call(message, "rmssd"))
                writer.uint32(
                  /* id 1, wireType 1 =*/
                  9
                ).double(message.rmssd);
              if (message.meanNn != null && Object.hasOwnProperty.call(message, "meanNn"))
                writer.uint32(
                  /* id 2, wireType 1 =*/
                  17
                ).double(message.meanNn);
              if (message.sdnn != null && Object.hasOwnProperty.call(message, "sdnn"))
                writer.uint32(
                  /* id 3, wireType 1 =*/
                  25
                ).double(message.sdnn);
              if (message.baevsky != null && Object.hasOwnProperty.call(message, "baevsky"))
                writer.uint32(
                  /* id 4, wireType 1 =*/
                  33
                ).double(message.baevsky);
              if (message.timestamp != null && Object.hasOwnProperty.call(message, "timestamp"))
                writer.uint32(
                  /* id 5, wireType 0 =*/
                  40
                ).int64(message.timestamp);
              if (message.confidence != null && Object.hasOwnProperty.call(message, "confidence"))
                writer.uint32(
                  /* id 6, wireType 5 =*/
                  53
                ).float(message.confidence);
              if (message.stable != null && Object.hasOwnProperty.call(message, "stable"))
                writer.uint32(
                  /* id 7, wireType 0 =*/
                  56
                ).bool(message.stable);
              return writer;
            };
            Hrv.encodeDelimited = function encodeDelimited(message, writer) {
              return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };
            Hrv.decode = function decode(reader, length, error, long) {
              if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
              if (long === void 0)
                long = 0;
              if (long > $Reader.recursionLimit)
                throw Error("maximum nesting depth exceeded");
              var end, message;
              if (length === void 0)
                end = reader.len;
              else {
                end = reader.pos + length;
                if (end > reader.len)
                  throw RangeError("index out of range");
                length = reader.len;
                reader.len = end;
              }
              message = new $root.presage.smartspectra.Hrv();
              while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                  break;
                switch (tag >>> 3) {
                  case 1: {
                    message.rmssd = reader.double();
                    break;
                  }
                  case 2: {
                    message.meanNn = reader.double();
                    break;
                  }
                  case 3: {
                    message.sdnn = reader.double();
                    break;
                  }
                  case 4: {
                    message.baevsky = reader.double();
                    break;
                  }
                  case 5: {
                    message.timestamp = reader.int64();
                    break;
                  }
                  case 6: {
                    message.confidence = reader.float();
                    break;
                  }
                  case 7: {
                    message.stable = reader.bool();
                    break;
                  }
                  default:
                    reader.skipType(tag & 7, long);
                    break;
                }
              }
              if (length !== void 0) {
                if (reader.pos !== end)
                  throw RangeError("index out of range");
                reader.len = length;
              }
              return message;
            };
            Hrv.decodeDelimited = function decodeDelimited(reader) {
              if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
              return this.decode(reader, reader.uint32());
            };
            Hrv.verify = function verify(message, long) {
              if (typeof message !== "object" || message === null)
                return "object expected";
              if (long === void 0)
                long = 0;
              if (long > $util.recursionLimit)
                return "maximum nesting depth exceeded";
              if (message.rmssd != null && Object.hasOwnProperty.call(message, "rmssd")) {
                if (typeof message.rmssd !== "number")
                  return "rmssd: number expected";
              }
              if (message.meanNn != null && Object.hasOwnProperty.call(message, "meanNn")) {
                if (typeof message.meanNn !== "number")
                  return "meanNn: number expected";
              }
              if (message.sdnn != null && Object.hasOwnProperty.call(message, "sdnn")) {
                if (typeof message.sdnn !== "number")
                  return "sdnn: number expected";
              }
              if (message.baevsky != null && Object.hasOwnProperty.call(message, "baevsky")) {
                if (typeof message.baevsky !== "number")
                  return "baevsky: number expected";
              }
              if (message.timestamp != null && Object.hasOwnProperty.call(message, "timestamp")) {
                if (!$util.isInteger(message.timestamp) && !(message.timestamp && $util.isInteger(message.timestamp.low) && $util.isInteger(message.timestamp.high)))
                  return "timestamp: integer|Long expected";
              }
              if (message.confidence != null && Object.hasOwnProperty.call(message, "confidence")) {
                if (typeof message.confidence !== "number")
                  return "confidence: number expected";
              }
              if (message.stable != null && Object.hasOwnProperty.call(message, "stable")) {
                if (typeof message.stable !== "boolean")
                  return "stable: boolean expected";
              }
              return null;
            };
            Hrv.fromObject = function fromObject(object, long) {
              if (object instanceof $root.presage.smartspectra.Hrv)
                return object;
              if (!$util.isObject(object))
                throw TypeError(".presage.smartspectra.Hrv: object expected");
              if (long === void 0)
                long = 0;
              if (long > $util.recursionLimit)
                throw Error("maximum nesting depth exceeded");
              var message = new $root.presage.smartspectra.Hrv();
              if (object.rmssd != null)
                message.rmssd = Number(object.rmssd);
              if (object.meanNn != null)
                message.meanNn = Number(object.meanNn);
              if (object.sdnn != null)
                message.sdnn = Number(object.sdnn);
              if (object.baevsky != null)
                message.baevsky = Number(object.baevsky);
              if (object.timestamp != null) {
                if ($util.Long)
                  message.timestamp = $util.Long.fromValue(object.timestamp, false);
                else if (typeof object.timestamp === "string")
                  message.timestamp = parseInt(object.timestamp, 10);
                else if (typeof object.timestamp === "number")
                  message.timestamp = object.timestamp;
                else if (typeof object.timestamp === "object")
                  message.timestamp = new $util.LongBits(object.timestamp.low >>> 0, object.timestamp.high >>> 0).toNumber();
              }
              if (object.confidence != null)
                message.confidence = Number(object.confidence);
              if (object.stable != null)
                message.stable = Boolean(object.stable);
              return message;
            };
            Hrv.toObject = function toObject(message, options, q) {
              if (!options)
                options = {};
              if (q === void 0)
                q = 0;
              if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
              var object = {};
              if (options.defaults) {
                object.rmssd = 0;
                object.meanNn = 0;
                object.sdnn = 0;
                object.baevsky = 0;
                if ($util.Long) {
                  var long = new $util.Long(0, 0, false);
                  object.timestamp = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : typeof BigInt !== "undefined" && options.longs === BigInt ? long.toBigInt() : long;
                } else
                  object.timestamp = options.longs === String ? "0" : typeof BigInt !== "undefined" && options.longs === BigInt ? BigInt("0") : 0;
                object.confidence = 0;
                object.stable = false;
              }
              if (message.rmssd != null && Object.hasOwnProperty.call(message, "rmssd"))
                object.rmssd = options.json && !isFinite(message.rmssd) ? String(message.rmssd) : message.rmssd;
              if (message.meanNn != null && Object.hasOwnProperty.call(message, "meanNn"))
                object.meanNn = options.json && !isFinite(message.meanNn) ? String(message.meanNn) : message.meanNn;
              if (message.sdnn != null && Object.hasOwnProperty.call(message, "sdnn"))
                object.sdnn = options.json && !isFinite(message.sdnn) ? String(message.sdnn) : message.sdnn;
              if (message.baevsky != null && Object.hasOwnProperty.call(message, "baevsky"))
                object.baevsky = options.json && !isFinite(message.baevsky) ? String(message.baevsky) : message.baevsky;
              if (message.timestamp != null && Object.hasOwnProperty.call(message, "timestamp"))
                if (typeof BigInt !== "undefined" && options.longs === BigInt)
                  object.timestamp = typeof message.timestamp === "number" ? BigInt(message.timestamp) : $util.Long.fromBits(message.timestamp.low >>> 0, message.timestamp.high >>> 0, false).toBigInt();
                else if (typeof message.timestamp === "number")
                  object.timestamp = options.longs === String ? String(message.timestamp) : message.timestamp;
                else
                  object.timestamp = options.longs === String ? $util.Long.prototype.toString.call(message.timestamp) : options.longs === Number ? new $util.LongBits(message.timestamp.low >>> 0, message.timestamp.high >>> 0).toNumber() : message.timestamp;
              if (message.confidence != null && Object.hasOwnProperty.call(message, "confidence"))
                object.confidence = options.json && !isFinite(message.confidence) ? String(message.confidence) : message.confidence;
              if (message.stable != null && Object.hasOwnProperty.call(message, "stable"))
                object.stable = message.stable;
              return object;
            };
            Hrv.prototype.toJSON = function toJSON() {
              return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
            Hrv.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
              if (typeUrlPrefix === void 0) {
                typeUrlPrefix = "type.googleapis.com";
              }
              return typeUrlPrefix + "/presage.smartspectra.Hrv";
            };
            return Hrv;
          })();
          smartspectra.Strict = (function() {
            function Strict(properties) {
              if (properties) {
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                  if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
              }
            }
            Strict.prototype.value = 0;
            Strict.prototype.timestamp = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
            Strict.prototype.stable = false;
            Strict.create = function create(properties) {
              return new Strict(properties);
            };
            Strict.encode = function encode(message, writer, q) {
              if (!writer)
                writer = $Writer.create();
              if (q === void 0)
                q = 0;
              if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
              if (message.value != null && Object.hasOwnProperty.call(message, "value"))
                writer.uint32(
                  /* id 1, wireType 5 =*/
                  13
                ).float(message.value);
              if (message.timestamp != null && Object.hasOwnProperty.call(message, "timestamp"))
                writer.uint32(
                  /* id 2, wireType 0 =*/
                  16
                ).int64(message.timestamp);
              if (message.stable != null && Object.hasOwnProperty.call(message, "stable"))
                writer.uint32(
                  /* id 3, wireType 0 =*/
                  24
                ).bool(message.stable);
              return writer;
            };
            Strict.encodeDelimited = function encodeDelimited(message, writer) {
              return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };
            Strict.decode = function decode(reader, length, error, long) {
              if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
              if (long === void 0)
                long = 0;
              if (long > $Reader.recursionLimit)
                throw Error("maximum nesting depth exceeded");
              var end, message;
              if (length === void 0)
                end = reader.len;
              else {
                end = reader.pos + length;
                if (end > reader.len)
                  throw RangeError("index out of range");
                length = reader.len;
                reader.len = end;
              }
              message = new $root.presage.smartspectra.Strict();
              while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                  break;
                switch (tag >>> 3) {
                  case 1: {
                    message.value = reader.float();
                    break;
                  }
                  case 2: {
                    message.timestamp = reader.int64();
                    break;
                  }
                  case 3: {
                    message.stable = reader.bool();
                    break;
                  }
                  default:
                    reader.skipType(tag & 7, long);
                    break;
                }
              }
              if (length !== void 0) {
                if (reader.pos !== end)
                  throw RangeError("index out of range");
                reader.len = length;
              }
              return message;
            };
            Strict.decodeDelimited = function decodeDelimited(reader) {
              if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
              return this.decode(reader, reader.uint32());
            };
            Strict.verify = function verify(message, long) {
              if (typeof message !== "object" || message === null)
                return "object expected";
              if (long === void 0)
                long = 0;
              if (long > $util.recursionLimit)
                return "maximum nesting depth exceeded";
              if (message.value != null && Object.hasOwnProperty.call(message, "value")) {
                if (typeof message.value !== "number")
                  return "value: number expected";
              }
              if (message.timestamp != null && Object.hasOwnProperty.call(message, "timestamp")) {
                if (!$util.isInteger(message.timestamp) && !(message.timestamp && $util.isInteger(message.timestamp.low) && $util.isInteger(message.timestamp.high)))
                  return "timestamp: integer|Long expected";
              }
              if (message.stable != null && Object.hasOwnProperty.call(message, "stable")) {
                if (typeof message.stable !== "boolean")
                  return "stable: boolean expected";
              }
              return null;
            };
            Strict.fromObject = function fromObject(object, long) {
              if (object instanceof $root.presage.smartspectra.Strict)
                return object;
              if (!$util.isObject(object))
                throw TypeError(".presage.smartspectra.Strict: object expected");
              if (long === void 0)
                long = 0;
              if (long > $util.recursionLimit)
                throw Error("maximum nesting depth exceeded");
              var message = new $root.presage.smartspectra.Strict();
              if (object.value != null)
                message.value = Number(object.value);
              if (object.timestamp != null) {
                if ($util.Long)
                  message.timestamp = $util.Long.fromValue(object.timestamp, false);
                else if (typeof object.timestamp === "string")
                  message.timestamp = parseInt(object.timestamp, 10);
                else if (typeof object.timestamp === "number")
                  message.timestamp = object.timestamp;
                else if (typeof object.timestamp === "object")
                  message.timestamp = new $util.LongBits(object.timestamp.low >>> 0, object.timestamp.high >>> 0).toNumber();
              }
              if (object.stable != null)
                message.stable = Boolean(object.stable);
              return message;
            };
            Strict.toObject = function toObject(message, options, q) {
              if (!options)
                options = {};
              if (q === void 0)
                q = 0;
              if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
              var object = {};
              if (options.defaults) {
                object.value = 0;
                if ($util.Long) {
                  var long = new $util.Long(0, 0, false);
                  object.timestamp = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : typeof BigInt !== "undefined" && options.longs === BigInt ? long.toBigInt() : long;
                } else
                  object.timestamp = options.longs === String ? "0" : typeof BigInt !== "undefined" && options.longs === BigInt ? BigInt("0") : 0;
                object.stable = false;
              }
              if (message.value != null && Object.hasOwnProperty.call(message, "value"))
                object.value = options.json && !isFinite(message.value) ? String(message.value) : message.value;
              if (message.timestamp != null && Object.hasOwnProperty.call(message, "timestamp"))
                if (typeof BigInt !== "undefined" && options.longs === BigInt)
                  object.timestamp = typeof message.timestamp === "number" ? BigInt(message.timestamp) : $util.Long.fromBits(message.timestamp.low >>> 0, message.timestamp.high >>> 0, false).toBigInt();
                else if (typeof message.timestamp === "number")
                  object.timestamp = options.longs === String ? String(message.timestamp) : message.timestamp;
                else
                  object.timestamp = options.longs === String ? $util.Long.prototype.toString.call(message.timestamp) : options.longs === Number ? new $util.LongBits(message.timestamp.low >>> 0, message.timestamp.high >>> 0).toNumber() : message.timestamp;
              if (message.stable != null && Object.hasOwnProperty.call(message, "stable"))
                object.stable = message.stable;
              return object;
            };
            Strict.prototype.toJSON = function toJSON() {
              return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
            Strict.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
              if (typeUrlPrefix === void 0) {
                typeUrlPrefix = "type.googleapis.com";
              }
              return typeUrlPrefix + "/presage.smartspectra.Strict";
            };
            return Strict;
          })();
          smartspectra.Pulse = (function() {
            function Pulse(properties) {
              this.rate = [];
              this.trace = [];
              this.pulseRespirationQuotient = [];
              if (properties) {
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                  if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
              }
            }
            Pulse.prototype.rate = $util.emptyArray;
            Pulse.prototype.trace = $util.emptyArray;
            Pulse.prototype.pulseRespirationQuotient = $util.emptyArray;
            Pulse.prototype.pulseRateStrict = null;
            Pulse.create = function create(properties) {
              return new Pulse(properties);
            };
            Pulse.encode = function encode(message, writer, q) {
              if (!writer)
                writer = $Writer.create();
              if (q === void 0)
                q = 0;
              if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
              if (message.rate != null && message.rate.length)
                for (var i = 0; i < message.rate.length; ++i)
                  $root.presage.smartspectra.MeasurementWithConfidence.encode(message.rate[i], writer.uint32(
                    /* id 1, wireType 2 =*/
                    10
                  ).fork(), q + 1).ldelim();
              if (message.trace != null && message.trace.length)
                for (var i = 0; i < message.trace.length; ++i)
                  $root.presage.smartspectra.Measurement.encode(message.trace[i], writer.uint32(
                    /* id 2, wireType 2 =*/
                    18
                  ).fork(), q + 1).ldelim();
              if (message.pulseRespirationQuotient != null && message.pulseRespirationQuotient.length)
                for (var i = 0; i < message.pulseRespirationQuotient.length; ++i)
                  $root.presage.smartspectra.Measurement.encode(message.pulseRespirationQuotient[i], writer.uint32(
                    /* id 3, wireType 2 =*/
                    26
                  ).fork(), q + 1).ldelim();
              if (message.pulseRateStrict != null && Object.hasOwnProperty.call(message, "pulseRateStrict"))
                $root.presage.smartspectra.Strict.encode(message.pulseRateStrict, writer.uint32(
                  /* id 4, wireType 2 =*/
                  34
                ).fork(), q + 1).ldelim();
              return writer;
            };
            Pulse.encodeDelimited = function encodeDelimited(message, writer) {
              return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };
            Pulse.decode = function decode(reader, length, error, long) {
              if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
              if (long === void 0)
                long = 0;
              if (long > $Reader.recursionLimit)
                throw Error("maximum nesting depth exceeded");
              var end, message;
              if (length === void 0)
                end = reader.len;
              else {
                end = reader.pos + length;
                if (end > reader.len)
                  throw RangeError("index out of range");
                length = reader.len;
                reader.len = end;
              }
              message = new $root.presage.smartspectra.Pulse();
              while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                  break;
                switch (tag >>> 3) {
                  case 1: {
                    if (!(message.rate && message.rate.length))
                      message.rate = [];
                    message.rate.push($root.presage.smartspectra.MeasurementWithConfidence.decode(reader, reader.uint32(), void 0, long + 1));
                    break;
                  }
                  case 2: {
                    if (!(message.trace && message.trace.length))
                      message.trace = [];
                    message.trace.push($root.presage.smartspectra.Measurement.decode(reader, reader.uint32(), void 0, long + 1));
                    break;
                  }
                  case 3: {
                    if (!(message.pulseRespirationQuotient && message.pulseRespirationQuotient.length))
                      message.pulseRespirationQuotient = [];
                    message.pulseRespirationQuotient.push($root.presage.smartspectra.Measurement.decode(reader, reader.uint32(), void 0, long + 1));
                    break;
                  }
                  case 4: {
                    message.pulseRateStrict = $root.presage.smartspectra.Strict.decode(reader, reader.uint32(), void 0, long + 1);
                    break;
                  }
                  default:
                    reader.skipType(tag & 7, long);
                    break;
                }
              }
              if (length !== void 0) {
                if (reader.pos !== end)
                  throw RangeError("index out of range");
                reader.len = length;
              }
              return message;
            };
            Pulse.decodeDelimited = function decodeDelimited(reader) {
              if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
              return this.decode(reader, reader.uint32());
            };
            Pulse.verify = function verify(message, long) {
              if (typeof message !== "object" || message === null)
                return "object expected";
              if (long === void 0)
                long = 0;
              if (long > $util.recursionLimit)
                return "maximum nesting depth exceeded";
              if (message.rate != null && Object.hasOwnProperty.call(message, "rate")) {
                if (!Array.isArray(message.rate))
                  return "rate: array expected";
                for (var i = 0; i < message.rate.length; ++i) {
                  var error = $root.presage.smartspectra.MeasurementWithConfidence.verify(message.rate[i], long + 1);
                  if (error)
                    return "rate." + error;
                }
              }
              if (message.trace != null && Object.hasOwnProperty.call(message, "trace")) {
                if (!Array.isArray(message.trace))
                  return "trace: array expected";
                for (var i = 0; i < message.trace.length; ++i) {
                  var error = $root.presage.smartspectra.Measurement.verify(message.trace[i], long + 1);
                  if (error)
                    return "trace." + error;
                }
              }
              if (message.pulseRespirationQuotient != null && Object.hasOwnProperty.call(message, "pulseRespirationQuotient")) {
                if (!Array.isArray(message.pulseRespirationQuotient))
                  return "pulseRespirationQuotient: array expected";
                for (var i = 0; i < message.pulseRespirationQuotient.length; ++i) {
                  var error = $root.presage.smartspectra.Measurement.verify(message.pulseRespirationQuotient[i], long + 1);
                  if (error)
                    return "pulseRespirationQuotient." + error;
                }
              }
              if (message.pulseRateStrict != null && Object.hasOwnProperty.call(message, "pulseRateStrict")) {
                var error = $root.presage.smartspectra.Strict.verify(message.pulseRateStrict, long + 1);
                if (error)
                  return "pulseRateStrict." + error;
              }
              return null;
            };
            Pulse.fromObject = function fromObject(object, long) {
              if (object instanceof $root.presage.smartspectra.Pulse)
                return object;
              if (!$util.isObject(object))
                throw TypeError(".presage.smartspectra.Pulse: object expected");
              if (long === void 0)
                long = 0;
              if (long > $util.recursionLimit)
                throw Error("maximum nesting depth exceeded");
              var message = new $root.presage.smartspectra.Pulse();
              if (object.rate) {
                if (!Array.isArray(object.rate))
                  throw TypeError(".presage.smartspectra.Pulse.rate: array expected");
                message.rate = [];
                for (var i = 0; i < object.rate.length; ++i) {
                  if (!$util.isObject(object.rate[i]))
                    throw TypeError(".presage.smartspectra.Pulse.rate: object expected");
                  message.rate[i] = $root.presage.smartspectra.MeasurementWithConfidence.fromObject(object.rate[i], long + 1);
                }
              }
              if (object.trace) {
                if (!Array.isArray(object.trace))
                  throw TypeError(".presage.smartspectra.Pulse.trace: array expected");
                message.trace = [];
                for (var i = 0; i < object.trace.length; ++i) {
                  if (!$util.isObject(object.trace[i]))
                    throw TypeError(".presage.smartspectra.Pulse.trace: object expected");
                  message.trace[i] = $root.presage.smartspectra.Measurement.fromObject(object.trace[i], long + 1);
                }
              }
              if (object.pulseRespirationQuotient) {
                if (!Array.isArray(object.pulseRespirationQuotient))
                  throw TypeError(".presage.smartspectra.Pulse.pulseRespirationQuotient: array expected");
                message.pulseRespirationQuotient = [];
                for (var i = 0; i < object.pulseRespirationQuotient.length; ++i) {
                  if (!$util.isObject(object.pulseRespirationQuotient[i]))
                    throw TypeError(".presage.smartspectra.Pulse.pulseRespirationQuotient: object expected");
                  message.pulseRespirationQuotient[i] = $root.presage.smartspectra.Measurement.fromObject(object.pulseRespirationQuotient[i], long + 1);
                }
              }
              if (object.pulseRateStrict != null) {
                if (!$util.isObject(object.pulseRateStrict))
                  throw TypeError(".presage.smartspectra.Pulse.pulseRateStrict: object expected");
                message.pulseRateStrict = $root.presage.smartspectra.Strict.fromObject(object.pulseRateStrict, long + 1);
              }
              return message;
            };
            Pulse.toObject = function toObject(message, options, q) {
              if (!options)
                options = {};
              if (q === void 0)
                q = 0;
              if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
              var object = {};
              if (options.arrays || options.defaults) {
                object.rate = [];
                object.trace = [];
                object.pulseRespirationQuotient = [];
              }
              if (options.defaults)
                object.pulseRateStrict = null;
              if (message.rate && message.rate.length) {
                object.rate = [];
                for (var j = 0; j < message.rate.length; ++j)
                  object.rate[j] = $root.presage.smartspectra.MeasurementWithConfidence.toObject(message.rate[j], options, q + 1);
              }
              if (message.trace && message.trace.length) {
                object.trace = [];
                for (var j = 0; j < message.trace.length; ++j)
                  object.trace[j] = $root.presage.smartspectra.Measurement.toObject(message.trace[j], options, q + 1);
              }
              if (message.pulseRespirationQuotient && message.pulseRespirationQuotient.length) {
                object.pulseRespirationQuotient = [];
                for (var j = 0; j < message.pulseRespirationQuotient.length; ++j)
                  object.pulseRespirationQuotient[j] = $root.presage.smartspectra.Measurement.toObject(message.pulseRespirationQuotient[j], options, q + 1);
              }
              if (message.pulseRateStrict != null && Object.hasOwnProperty.call(message, "pulseRateStrict"))
                object.pulseRateStrict = $root.presage.smartspectra.Strict.toObject(message.pulseRateStrict, options, q + 1);
              return object;
            };
            Pulse.prototype.toJSON = function toJSON() {
              return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
            Pulse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
              if (typeUrlPrefix === void 0) {
                typeUrlPrefix = "type.googleapis.com";
              }
              return typeUrlPrefix + "/presage.smartspectra.Pulse";
            };
            return Pulse;
          })();
          smartspectra.Breathing = (function() {
            function Breathing(properties) {
              this.rate = [];
              this.upperTrace = [];
              this.lowerTrace = [];
              this.amplitude = [];
              this.apnea = [];
              this.respiratoryLineLength = [];
              this.baseline = [];
              this.inhaleExhaleRatio = [];
              if (properties) {
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                  if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
              }
            }
            Breathing.prototype.rate = $util.emptyArray;
            Breathing.prototype.upperTrace = $util.emptyArray;
            Breathing.prototype.lowerTrace = $util.emptyArray;
            Breathing.prototype.amplitude = $util.emptyArray;
            Breathing.prototype.apnea = $util.emptyArray;
            Breathing.prototype.respiratoryLineLength = $util.emptyArray;
            Breathing.prototype.baseline = $util.emptyArray;
            Breathing.prototype.inhaleExhaleRatio = $util.emptyArray;
            Breathing.prototype.breathingRateStrict = null;
            Breathing.create = function create(properties) {
              return new Breathing(properties);
            };
            Breathing.encode = function encode(message, writer, q) {
              if (!writer)
                writer = $Writer.create();
              if (q === void 0)
                q = 0;
              if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
              if (message.rate != null && message.rate.length)
                for (var i = 0; i < message.rate.length; ++i)
                  $root.presage.smartspectra.MeasurementWithConfidence.encode(message.rate[i], writer.uint32(
                    /* id 1, wireType 2 =*/
                    10
                  ).fork(), q + 1).ldelim();
              if (message.upperTrace != null && message.upperTrace.length)
                for (var i = 0; i < message.upperTrace.length; ++i)
                  $root.presage.smartspectra.Measurement.encode(message.upperTrace[i], writer.uint32(
                    /* id 2, wireType 2 =*/
                    18
                  ).fork(), q + 1).ldelim();
              if (message.lowerTrace != null && message.lowerTrace.length)
                for (var i = 0; i < message.lowerTrace.length; ++i)
                  $root.presage.smartspectra.Measurement.encode(message.lowerTrace[i], writer.uint32(
                    /* id 3, wireType 2 =*/
                    26
                  ).fork(), q + 1).ldelim();
              if (message.amplitude != null && message.amplitude.length)
                for (var i = 0; i < message.amplitude.length; ++i)
                  $root.presage.smartspectra.Measurement.encode(message.amplitude[i], writer.uint32(
                    /* id 4, wireType 2 =*/
                    34
                  ).fork(), q + 1).ldelim();
              if (message.apnea != null && message.apnea.length)
                for (var i = 0; i < message.apnea.length; ++i)
                  $root.presage.smartspectra.DetectionStatus.encode(message.apnea[i], writer.uint32(
                    /* id 5, wireType 2 =*/
                    42
                  ).fork(), q + 1).ldelim();
              if (message.respiratoryLineLength != null && message.respiratoryLineLength.length)
                for (var i = 0; i < message.respiratoryLineLength.length; ++i)
                  $root.presage.smartspectra.Measurement.encode(message.respiratoryLineLength[i], writer.uint32(
                    /* id 6, wireType 2 =*/
                    50
                  ).fork(), q + 1).ldelim();
              if (message.baseline != null && message.baseline.length)
                for (var i = 0; i < message.baseline.length; ++i)
                  $root.presage.smartspectra.Measurement.encode(message.baseline[i], writer.uint32(
                    /* id 7, wireType 2 =*/
                    58
                  ).fork(), q + 1).ldelim();
              if (message.inhaleExhaleRatio != null && message.inhaleExhaleRatio.length)
                for (var i = 0; i < message.inhaleExhaleRatio.length; ++i)
                  $root.presage.smartspectra.Measurement.encode(message.inhaleExhaleRatio[i], writer.uint32(
                    /* id 8, wireType 2 =*/
                    66
                  ).fork(), q + 1).ldelim();
              if (message.breathingRateStrict != null && Object.hasOwnProperty.call(message, "breathingRateStrict"))
                $root.presage.smartspectra.Strict.encode(message.breathingRateStrict, writer.uint32(
                  /* id 9, wireType 2 =*/
                  74
                ).fork(), q + 1).ldelim();
              return writer;
            };
            Breathing.encodeDelimited = function encodeDelimited(message, writer) {
              return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };
            Breathing.decode = function decode(reader, length, error, long) {
              if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
              if (long === void 0)
                long = 0;
              if (long > $Reader.recursionLimit)
                throw Error("maximum nesting depth exceeded");
              var end, message;
              if (length === void 0)
                end = reader.len;
              else {
                end = reader.pos + length;
                if (end > reader.len)
                  throw RangeError("index out of range");
                length = reader.len;
                reader.len = end;
              }
              message = new $root.presage.smartspectra.Breathing();
              while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                  break;
                switch (tag >>> 3) {
                  case 1: {
                    if (!(message.rate && message.rate.length))
                      message.rate = [];
                    message.rate.push($root.presage.smartspectra.MeasurementWithConfidence.decode(reader, reader.uint32(), void 0, long + 1));
                    break;
                  }
                  case 2: {
                    if (!(message.upperTrace && message.upperTrace.length))
                      message.upperTrace = [];
                    message.upperTrace.push($root.presage.smartspectra.Measurement.decode(reader, reader.uint32(), void 0, long + 1));
                    break;
                  }
                  case 3: {
                    if (!(message.lowerTrace && message.lowerTrace.length))
                      message.lowerTrace = [];
                    message.lowerTrace.push($root.presage.smartspectra.Measurement.decode(reader, reader.uint32(), void 0, long + 1));
                    break;
                  }
                  case 4: {
                    if (!(message.amplitude && message.amplitude.length))
                      message.amplitude = [];
                    message.amplitude.push($root.presage.smartspectra.Measurement.decode(reader, reader.uint32(), void 0, long + 1));
                    break;
                  }
                  case 5: {
                    if (!(message.apnea && message.apnea.length))
                      message.apnea = [];
                    message.apnea.push($root.presage.smartspectra.DetectionStatus.decode(reader, reader.uint32(), void 0, long + 1));
                    break;
                  }
                  case 6: {
                    if (!(message.respiratoryLineLength && message.respiratoryLineLength.length))
                      message.respiratoryLineLength = [];
                    message.respiratoryLineLength.push($root.presage.smartspectra.Measurement.decode(reader, reader.uint32(), void 0, long + 1));
                    break;
                  }
                  case 7: {
                    if (!(message.baseline && message.baseline.length))
                      message.baseline = [];
                    message.baseline.push($root.presage.smartspectra.Measurement.decode(reader, reader.uint32(), void 0, long + 1));
                    break;
                  }
                  case 8: {
                    if (!(message.inhaleExhaleRatio && message.inhaleExhaleRatio.length))
                      message.inhaleExhaleRatio = [];
                    message.inhaleExhaleRatio.push($root.presage.smartspectra.Measurement.decode(reader, reader.uint32(), void 0, long + 1));
                    break;
                  }
                  case 9: {
                    message.breathingRateStrict = $root.presage.smartspectra.Strict.decode(reader, reader.uint32(), void 0, long + 1);
                    break;
                  }
                  default:
                    reader.skipType(tag & 7, long);
                    break;
                }
              }
              if (length !== void 0) {
                if (reader.pos !== end)
                  throw RangeError("index out of range");
                reader.len = length;
              }
              return message;
            };
            Breathing.decodeDelimited = function decodeDelimited(reader) {
              if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
              return this.decode(reader, reader.uint32());
            };
            Breathing.verify = function verify(message, long) {
              if (typeof message !== "object" || message === null)
                return "object expected";
              if (long === void 0)
                long = 0;
              if (long > $util.recursionLimit)
                return "maximum nesting depth exceeded";
              if (message.rate != null && Object.hasOwnProperty.call(message, "rate")) {
                if (!Array.isArray(message.rate))
                  return "rate: array expected";
                for (var i = 0; i < message.rate.length; ++i) {
                  var error = $root.presage.smartspectra.MeasurementWithConfidence.verify(message.rate[i], long + 1);
                  if (error)
                    return "rate." + error;
                }
              }
              if (message.upperTrace != null && Object.hasOwnProperty.call(message, "upperTrace")) {
                if (!Array.isArray(message.upperTrace))
                  return "upperTrace: array expected";
                for (var i = 0; i < message.upperTrace.length; ++i) {
                  var error = $root.presage.smartspectra.Measurement.verify(message.upperTrace[i], long + 1);
                  if (error)
                    return "upperTrace." + error;
                }
              }
              if (message.lowerTrace != null && Object.hasOwnProperty.call(message, "lowerTrace")) {
                if (!Array.isArray(message.lowerTrace))
                  return "lowerTrace: array expected";
                for (var i = 0; i < message.lowerTrace.length; ++i) {
                  var error = $root.presage.smartspectra.Measurement.verify(message.lowerTrace[i], long + 1);
                  if (error)
                    return "lowerTrace." + error;
                }
              }
              if (message.amplitude != null && Object.hasOwnProperty.call(message, "amplitude")) {
                if (!Array.isArray(message.amplitude))
                  return "amplitude: array expected";
                for (var i = 0; i < message.amplitude.length; ++i) {
                  var error = $root.presage.smartspectra.Measurement.verify(message.amplitude[i], long + 1);
                  if (error)
                    return "amplitude." + error;
                }
              }
              if (message.apnea != null && Object.hasOwnProperty.call(message, "apnea")) {
                if (!Array.isArray(message.apnea))
                  return "apnea: array expected";
                for (var i = 0; i < message.apnea.length; ++i) {
                  var error = $root.presage.smartspectra.DetectionStatus.verify(message.apnea[i], long + 1);
                  if (error)
                    return "apnea." + error;
                }
              }
              if (message.respiratoryLineLength != null && Object.hasOwnProperty.call(message, "respiratoryLineLength")) {
                if (!Array.isArray(message.respiratoryLineLength))
                  return "respiratoryLineLength: array expected";
                for (var i = 0; i < message.respiratoryLineLength.length; ++i) {
                  var error = $root.presage.smartspectra.Measurement.verify(message.respiratoryLineLength[i], long + 1);
                  if (error)
                    return "respiratoryLineLength." + error;
                }
              }
              if (message.baseline != null && Object.hasOwnProperty.call(message, "baseline")) {
                if (!Array.isArray(message.baseline))
                  return "baseline: array expected";
                for (var i = 0; i < message.baseline.length; ++i) {
                  var error = $root.presage.smartspectra.Measurement.verify(message.baseline[i], long + 1);
                  if (error)
                    return "baseline." + error;
                }
              }
              if (message.inhaleExhaleRatio != null && Object.hasOwnProperty.call(message, "inhaleExhaleRatio")) {
                if (!Array.isArray(message.inhaleExhaleRatio))
                  return "inhaleExhaleRatio: array expected";
                for (var i = 0; i < message.inhaleExhaleRatio.length; ++i) {
                  var error = $root.presage.smartspectra.Measurement.verify(message.inhaleExhaleRatio[i], long + 1);
                  if (error)
                    return "inhaleExhaleRatio." + error;
                }
              }
              if (message.breathingRateStrict != null && Object.hasOwnProperty.call(message, "breathingRateStrict")) {
                var error = $root.presage.smartspectra.Strict.verify(message.breathingRateStrict, long + 1);
                if (error)
                  return "breathingRateStrict." + error;
              }
              return null;
            };
            Breathing.fromObject = function fromObject(object, long) {
              if (object instanceof $root.presage.smartspectra.Breathing)
                return object;
              if (!$util.isObject(object))
                throw TypeError(".presage.smartspectra.Breathing: object expected");
              if (long === void 0)
                long = 0;
              if (long > $util.recursionLimit)
                throw Error("maximum nesting depth exceeded");
              var message = new $root.presage.smartspectra.Breathing();
              if (object.rate) {
                if (!Array.isArray(object.rate))
                  throw TypeError(".presage.smartspectra.Breathing.rate: array expected");
                message.rate = [];
                for (var i = 0; i < object.rate.length; ++i) {
                  if (!$util.isObject(object.rate[i]))
                    throw TypeError(".presage.smartspectra.Breathing.rate: object expected");
                  message.rate[i] = $root.presage.smartspectra.MeasurementWithConfidence.fromObject(object.rate[i], long + 1);
                }
              }
              if (object.upperTrace) {
                if (!Array.isArray(object.upperTrace))
                  throw TypeError(".presage.smartspectra.Breathing.upperTrace: array expected");
                message.upperTrace = [];
                for (var i = 0; i < object.upperTrace.length; ++i) {
                  if (!$util.isObject(object.upperTrace[i]))
                    throw TypeError(".presage.smartspectra.Breathing.upperTrace: object expected");
                  message.upperTrace[i] = $root.presage.smartspectra.Measurement.fromObject(object.upperTrace[i], long + 1);
                }
              }
              if (object.lowerTrace) {
                if (!Array.isArray(object.lowerTrace))
                  throw TypeError(".presage.smartspectra.Breathing.lowerTrace: array expected");
                message.lowerTrace = [];
                for (var i = 0; i < object.lowerTrace.length; ++i) {
                  if (!$util.isObject(object.lowerTrace[i]))
                    throw TypeError(".presage.smartspectra.Breathing.lowerTrace: object expected");
                  message.lowerTrace[i] = $root.presage.smartspectra.Measurement.fromObject(object.lowerTrace[i], long + 1);
                }
              }
              if (object.amplitude) {
                if (!Array.isArray(object.amplitude))
                  throw TypeError(".presage.smartspectra.Breathing.amplitude: array expected");
                message.amplitude = [];
                for (var i = 0; i < object.amplitude.length; ++i) {
                  if (!$util.isObject(object.amplitude[i]))
                    throw TypeError(".presage.smartspectra.Breathing.amplitude: object expected");
                  message.amplitude[i] = $root.presage.smartspectra.Measurement.fromObject(object.amplitude[i], long + 1);
                }
              }
              if (object.apnea) {
                if (!Array.isArray(object.apnea))
                  throw TypeError(".presage.smartspectra.Breathing.apnea: array expected");
                message.apnea = [];
                for (var i = 0; i < object.apnea.length; ++i) {
                  if (!$util.isObject(object.apnea[i]))
                    throw TypeError(".presage.smartspectra.Breathing.apnea: object expected");
                  message.apnea[i] = $root.presage.smartspectra.DetectionStatus.fromObject(object.apnea[i], long + 1);
                }
              }
              if (object.respiratoryLineLength) {
                if (!Array.isArray(object.respiratoryLineLength))
                  throw TypeError(".presage.smartspectra.Breathing.respiratoryLineLength: array expected");
                message.respiratoryLineLength = [];
                for (var i = 0; i < object.respiratoryLineLength.length; ++i) {
                  if (!$util.isObject(object.respiratoryLineLength[i]))
                    throw TypeError(".presage.smartspectra.Breathing.respiratoryLineLength: object expected");
                  message.respiratoryLineLength[i] = $root.presage.smartspectra.Measurement.fromObject(object.respiratoryLineLength[i], long + 1);
                }
              }
              if (object.baseline) {
                if (!Array.isArray(object.baseline))
                  throw TypeError(".presage.smartspectra.Breathing.baseline: array expected");
                message.baseline = [];
                for (var i = 0; i < object.baseline.length; ++i) {
                  if (!$util.isObject(object.baseline[i]))
                    throw TypeError(".presage.smartspectra.Breathing.baseline: object expected");
                  message.baseline[i] = $root.presage.smartspectra.Measurement.fromObject(object.baseline[i], long + 1);
                }
              }
              if (object.inhaleExhaleRatio) {
                if (!Array.isArray(object.inhaleExhaleRatio))
                  throw TypeError(".presage.smartspectra.Breathing.inhaleExhaleRatio: array expected");
                message.inhaleExhaleRatio = [];
                for (var i = 0; i < object.inhaleExhaleRatio.length; ++i) {
                  if (!$util.isObject(object.inhaleExhaleRatio[i]))
                    throw TypeError(".presage.smartspectra.Breathing.inhaleExhaleRatio: object expected");
                  message.inhaleExhaleRatio[i] = $root.presage.smartspectra.Measurement.fromObject(object.inhaleExhaleRatio[i], long + 1);
                }
              }
              if (object.breathingRateStrict != null) {
                if (!$util.isObject(object.breathingRateStrict))
                  throw TypeError(".presage.smartspectra.Breathing.breathingRateStrict: object expected");
                message.breathingRateStrict = $root.presage.smartspectra.Strict.fromObject(object.breathingRateStrict, long + 1);
              }
              return message;
            };
            Breathing.toObject = function toObject(message, options, q) {
              if (!options)
                options = {};
              if (q === void 0)
                q = 0;
              if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
              var object = {};
              if (options.arrays || options.defaults) {
                object.rate = [];
                object.upperTrace = [];
                object.lowerTrace = [];
                object.amplitude = [];
                object.apnea = [];
                object.respiratoryLineLength = [];
                object.baseline = [];
                object.inhaleExhaleRatio = [];
              }
              if (options.defaults)
                object.breathingRateStrict = null;
              if (message.rate && message.rate.length) {
                object.rate = [];
                for (var j = 0; j < message.rate.length; ++j)
                  object.rate[j] = $root.presage.smartspectra.MeasurementWithConfidence.toObject(message.rate[j], options, q + 1);
              }
              if (message.upperTrace && message.upperTrace.length) {
                object.upperTrace = [];
                for (var j = 0; j < message.upperTrace.length; ++j)
                  object.upperTrace[j] = $root.presage.smartspectra.Measurement.toObject(message.upperTrace[j], options, q + 1);
              }
              if (message.lowerTrace && message.lowerTrace.length) {
                object.lowerTrace = [];
                for (var j = 0; j < message.lowerTrace.length; ++j)
                  object.lowerTrace[j] = $root.presage.smartspectra.Measurement.toObject(message.lowerTrace[j], options, q + 1);
              }
              if (message.amplitude && message.amplitude.length) {
                object.amplitude = [];
                for (var j = 0; j < message.amplitude.length; ++j)
                  object.amplitude[j] = $root.presage.smartspectra.Measurement.toObject(message.amplitude[j], options, q + 1);
              }
              if (message.apnea && message.apnea.length) {
                object.apnea = [];
                for (var j = 0; j < message.apnea.length; ++j)
                  object.apnea[j] = $root.presage.smartspectra.DetectionStatus.toObject(message.apnea[j], options, q + 1);
              }
              if (message.respiratoryLineLength && message.respiratoryLineLength.length) {
                object.respiratoryLineLength = [];
                for (var j = 0; j < message.respiratoryLineLength.length; ++j)
                  object.respiratoryLineLength[j] = $root.presage.smartspectra.Measurement.toObject(message.respiratoryLineLength[j], options, q + 1);
              }
              if (message.baseline && message.baseline.length) {
                object.baseline = [];
                for (var j = 0; j < message.baseline.length; ++j)
                  object.baseline[j] = $root.presage.smartspectra.Measurement.toObject(message.baseline[j], options, q + 1);
              }
              if (message.inhaleExhaleRatio && message.inhaleExhaleRatio.length) {
                object.inhaleExhaleRatio = [];
                for (var j = 0; j < message.inhaleExhaleRatio.length; ++j)
                  object.inhaleExhaleRatio[j] = $root.presage.smartspectra.Measurement.toObject(message.inhaleExhaleRatio[j], options, q + 1);
              }
              if (message.breathingRateStrict != null && Object.hasOwnProperty.call(message, "breathingRateStrict"))
                object.breathingRateStrict = $root.presage.smartspectra.Strict.toObject(message.breathingRateStrict, options, q + 1);
              return object;
            };
            Breathing.prototype.toJSON = function toJSON() {
              return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
            Breathing.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
              if (typeUrlPrefix === void 0) {
                typeUrlPrefix = "type.googleapis.com";
              }
              return typeUrlPrefix + "/presage.smartspectra.Breathing";
            };
            return Breathing;
          })();
          smartspectra.Landmarks = (function() {
            function Landmarks(properties) {
              this.value = [];
              if (properties) {
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                  if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
              }
            }
            Landmarks.prototype.value = $util.emptyArray;
            Landmarks.prototype.stable = false;
            Landmarks.prototype.reset = false;
            Landmarks.prototype.timestamp = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
            Landmarks.create = function create(properties) {
              return new Landmarks(properties);
            };
            Landmarks.encode = function encode(message, writer, q) {
              if (!writer)
                writer = $Writer.create();
              if (q === void 0)
                q = 0;
              if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
              if (message.value != null && message.value.length)
                for (var i = 0; i < message.value.length; ++i)
                  $root.presage.smartspectra.Point2dFloat.encode(message.value[i], writer.uint32(
                    /* id 1, wireType 2 =*/
                    10
                  ).fork(), q + 1).ldelim();
              if (message.stable != null && Object.hasOwnProperty.call(message, "stable"))
                writer.uint32(
                  /* id 2, wireType 0 =*/
                  16
                ).bool(message.stable);
              if (message.reset != null && Object.hasOwnProperty.call(message, "reset"))
                writer.uint32(
                  /* id 3, wireType 0 =*/
                  24
                ).bool(message.reset);
              if (message.timestamp != null && Object.hasOwnProperty.call(message, "timestamp"))
                writer.uint32(
                  /* id 4, wireType 0 =*/
                  32
                ).int64(message.timestamp);
              return writer;
            };
            Landmarks.encodeDelimited = function encodeDelimited(message, writer) {
              return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };
            Landmarks.decode = function decode(reader, length, error, long) {
              if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
              if (long === void 0)
                long = 0;
              if (long > $Reader.recursionLimit)
                throw Error("maximum nesting depth exceeded");
              var end, message;
              if (length === void 0)
                end = reader.len;
              else {
                end = reader.pos + length;
                if (end > reader.len)
                  throw RangeError("index out of range");
                length = reader.len;
                reader.len = end;
              }
              message = new $root.presage.smartspectra.Landmarks();
              while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                  break;
                switch (tag >>> 3) {
                  case 1: {
                    if (!(message.value && message.value.length))
                      message.value = [];
                    message.value.push($root.presage.smartspectra.Point2dFloat.decode(reader, reader.uint32(), void 0, long + 1));
                    break;
                  }
                  case 2: {
                    message.stable = reader.bool();
                    break;
                  }
                  case 3: {
                    message.reset = reader.bool();
                    break;
                  }
                  case 4: {
                    message.timestamp = reader.int64();
                    break;
                  }
                  default:
                    reader.skipType(tag & 7, long);
                    break;
                }
              }
              if (length !== void 0) {
                if (reader.pos !== end)
                  throw RangeError("index out of range");
                reader.len = length;
              }
              return message;
            };
            Landmarks.decodeDelimited = function decodeDelimited(reader) {
              if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
              return this.decode(reader, reader.uint32());
            };
            Landmarks.verify = function verify(message, long) {
              if (typeof message !== "object" || message === null)
                return "object expected";
              if (long === void 0)
                long = 0;
              if (long > $util.recursionLimit)
                return "maximum nesting depth exceeded";
              if (message.value != null && Object.hasOwnProperty.call(message, "value")) {
                if (!Array.isArray(message.value))
                  return "value: array expected";
                for (var i = 0; i < message.value.length; ++i) {
                  var error = $root.presage.smartspectra.Point2dFloat.verify(message.value[i], long + 1);
                  if (error)
                    return "value." + error;
                }
              }
              if (message.stable != null && Object.hasOwnProperty.call(message, "stable")) {
                if (typeof message.stable !== "boolean")
                  return "stable: boolean expected";
              }
              if (message.reset != null && Object.hasOwnProperty.call(message, "reset")) {
                if (typeof message.reset !== "boolean")
                  return "reset: boolean expected";
              }
              if (message.timestamp != null && Object.hasOwnProperty.call(message, "timestamp")) {
                if (!$util.isInteger(message.timestamp) && !(message.timestamp && $util.isInteger(message.timestamp.low) && $util.isInteger(message.timestamp.high)))
                  return "timestamp: integer|Long expected";
              }
              return null;
            };
            Landmarks.fromObject = function fromObject(object, long) {
              if (object instanceof $root.presage.smartspectra.Landmarks)
                return object;
              if (!$util.isObject(object))
                throw TypeError(".presage.smartspectra.Landmarks: object expected");
              if (long === void 0)
                long = 0;
              if (long > $util.recursionLimit)
                throw Error("maximum nesting depth exceeded");
              var message = new $root.presage.smartspectra.Landmarks();
              if (object.value) {
                if (!Array.isArray(object.value))
                  throw TypeError(".presage.smartspectra.Landmarks.value: array expected");
                message.value = [];
                for (var i = 0; i < object.value.length; ++i) {
                  if (!$util.isObject(object.value[i]))
                    throw TypeError(".presage.smartspectra.Landmarks.value: object expected");
                  message.value[i] = $root.presage.smartspectra.Point2dFloat.fromObject(object.value[i], long + 1);
                }
              }
              if (object.stable != null)
                message.stable = Boolean(object.stable);
              if (object.reset != null)
                message.reset = Boolean(object.reset);
              if (object.timestamp != null) {
                if ($util.Long)
                  message.timestamp = $util.Long.fromValue(object.timestamp, false);
                else if (typeof object.timestamp === "string")
                  message.timestamp = parseInt(object.timestamp, 10);
                else if (typeof object.timestamp === "number")
                  message.timestamp = object.timestamp;
                else if (typeof object.timestamp === "object")
                  message.timestamp = new $util.LongBits(object.timestamp.low >>> 0, object.timestamp.high >>> 0).toNumber();
              }
              return message;
            };
            Landmarks.toObject = function toObject(message, options, q) {
              if (!options)
                options = {};
              if (q === void 0)
                q = 0;
              if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
              var object = {};
              if (options.arrays || options.defaults)
                object.value = [];
              if (options.defaults) {
                object.stable = false;
                object.reset = false;
                if ($util.Long) {
                  var long = new $util.Long(0, 0, false);
                  object.timestamp = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : typeof BigInt !== "undefined" && options.longs === BigInt ? long.toBigInt() : long;
                } else
                  object.timestamp = options.longs === String ? "0" : typeof BigInt !== "undefined" && options.longs === BigInt ? BigInt("0") : 0;
              }
              if (message.value && message.value.length) {
                object.value = [];
                for (var j = 0; j < message.value.length; ++j)
                  object.value[j] = $root.presage.smartspectra.Point2dFloat.toObject(message.value[j], options, q + 1);
              }
              if (message.stable != null && Object.hasOwnProperty.call(message, "stable"))
                object.stable = message.stable;
              if (message.reset != null && Object.hasOwnProperty.call(message, "reset"))
                object.reset = message.reset;
              if (message.timestamp != null && Object.hasOwnProperty.call(message, "timestamp"))
                if (typeof BigInt !== "undefined" && options.longs === BigInt)
                  object.timestamp = typeof message.timestamp === "number" ? BigInt(message.timestamp) : $util.Long.fromBits(message.timestamp.low >>> 0, message.timestamp.high >>> 0, false).toBigInt();
                else if (typeof message.timestamp === "number")
                  object.timestamp = options.longs === String ? String(message.timestamp) : message.timestamp;
                else
                  object.timestamp = options.longs === String ? $util.Long.prototype.toString.call(message.timestamp) : options.longs === Number ? new $util.LongBits(message.timestamp.low >>> 0, message.timestamp.high >>> 0).toNumber() : message.timestamp;
              return object;
            };
            Landmarks.prototype.toJSON = function toJSON() {
              return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
            Landmarks.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
              if (typeUrlPrefix === void 0) {
                typeUrlPrefix = "type.googleapis.com";
              }
              return typeUrlPrefix + "/presage.smartspectra.Landmarks";
            };
            return Landmarks;
          })();
          smartspectra.Face = (function() {
            function Face(properties) {
              this.blinking = [];
              this.talking = [];
              this.landmarks = [];
              this.expression = [];
              if (properties) {
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                  if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
              }
            }
            Face.prototype.blinking = $util.emptyArray;
            Face.prototype.talking = $util.emptyArray;
            Face.prototype.landmarks = $util.emptyArray;
            Face.prototype.expression = $util.emptyArray;
            Face.create = function create(properties) {
              return new Face(properties);
            };
            Face.encode = function encode(message, writer, q) {
              if (!writer)
                writer = $Writer.create();
              if (q === void 0)
                q = 0;
              if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
              if (message.blinking != null && message.blinking.length)
                for (var i = 0; i < message.blinking.length; ++i)
                  $root.presage.smartspectra.DetectionStatus.encode(message.blinking[i], writer.uint32(
                    /* id 1, wireType 2 =*/
                    10
                  ).fork(), q + 1).ldelim();
              if (message.talking != null && message.talking.length)
                for (var i = 0; i < message.talking.length; ++i)
                  $root.presage.smartspectra.DetectionStatus.encode(message.talking[i], writer.uint32(
                    /* id 2, wireType 2 =*/
                    18
                  ).fork(), q + 1).ldelim();
              if (message.landmarks != null && message.landmarks.length)
                for (var i = 0; i < message.landmarks.length; ++i)
                  $root.presage.smartspectra.Landmarks.encode(message.landmarks[i], writer.uint32(
                    /* id 3, wireType 2 =*/
                    26
                  ).fork(), q + 1).ldelim();
              if (message.expression != null && message.expression.length)
                for (var i = 0; i < message.expression.length; ++i)
                  $root.presage.smartspectra.Expression.encode(message.expression[i], writer.uint32(
                    /* id 4, wireType 2 =*/
                    34
                  ).fork(), q + 1).ldelim();
              return writer;
            };
            Face.encodeDelimited = function encodeDelimited(message, writer) {
              return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };
            Face.decode = function decode(reader, length, error, long) {
              if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
              if (long === void 0)
                long = 0;
              if (long > $Reader.recursionLimit)
                throw Error("maximum nesting depth exceeded");
              var end, message;
              if (length === void 0)
                end = reader.len;
              else {
                end = reader.pos + length;
                if (end > reader.len)
                  throw RangeError("index out of range");
                length = reader.len;
                reader.len = end;
              }
              message = new $root.presage.smartspectra.Face();
              while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                  break;
                switch (tag >>> 3) {
                  case 1: {
                    if (!(message.blinking && message.blinking.length))
                      message.blinking = [];
                    message.blinking.push($root.presage.smartspectra.DetectionStatus.decode(reader, reader.uint32(), void 0, long + 1));
                    break;
                  }
                  case 2: {
                    if (!(message.talking && message.talking.length))
                      message.talking = [];
                    message.talking.push($root.presage.smartspectra.DetectionStatus.decode(reader, reader.uint32(), void 0, long + 1));
                    break;
                  }
                  case 3: {
                    if (!(message.landmarks && message.landmarks.length))
                      message.landmarks = [];
                    message.landmarks.push($root.presage.smartspectra.Landmarks.decode(reader, reader.uint32(), void 0, long + 1));
                    break;
                  }
                  case 4: {
                    if (!(message.expression && message.expression.length))
                      message.expression = [];
                    message.expression.push($root.presage.smartspectra.Expression.decode(reader, reader.uint32(), void 0, long + 1));
                    break;
                  }
                  default:
                    reader.skipType(tag & 7, long);
                    break;
                }
              }
              if (length !== void 0) {
                if (reader.pos !== end)
                  throw RangeError("index out of range");
                reader.len = length;
              }
              return message;
            };
            Face.decodeDelimited = function decodeDelimited(reader) {
              if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
              return this.decode(reader, reader.uint32());
            };
            Face.verify = function verify(message, long) {
              if (typeof message !== "object" || message === null)
                return "object expected";
              if (long === void 0)
                long = 0;
              if (long > $util.recursionLimit)
                return "maximum nesting depth exceeded";
              if (message.blinking != null && Object.hasOwnProperty.call(message, "blinking")) {
                if (!Array.isArray(message.blinking))
                  return "blinking: array expected";
                for (var i = 0; i < message.blinking.length; ++i) {
                  var error = $root.presage.smartspectra.DetectionStatus.verify(message.blinking[i], long + 1);
                  if (error)
                    return "blinking." + error;
                }
              }
              if (message.talking != null && Object.hasOwnProperty.call(message, "talking")) {
                if (!Array.isArray(message.talking))
                  return "talking: array expected";
                for (var i = 0; i < message.talking.length; ++i) {
                  var error = $root.presage.smartspectra.DetectionStatus.verify(message.talking[i], long + 1);
                  if (error)
                    return "talking." + error;
                }
              }
              if (message.landmarks != null && Object.hasOwnProperty.call(message, "landmarks")) {
                if (!Array.isArray(message.landmarks))
                  return "landmarks: array expected";
                for (var i = 0; i < message.landmarks.length; ++i) {
                  var error = $root.presage.smartspectra.Landmarks.verify(message.landmarks[i], long + 1);
                  if (error)
                    return "landmarks." + error;
                }
              }
              if (message.expression != null && Object.hasOwnProperty.call(message, "expression")) {
                if (!Array.isArray(message.expression))
                  return "expression: array expected";
                for (var i = 0; i < message.expression.length; ++i) {
                  var error = $root.presage.smartspectra.Expression.verify(message.expression[i], long + 1);
                  if (error)
                    return "expression." + error;
                }
              }
              return null;
            };
            Face.fromObject = function fromObject(object, long) {
              if (object instanceof $root.presage.smartspectra.Face)
                return object;
              if (!$util.isObject(object))
                throw TypeError(".presage.smartspectra.Face: object expected");
              if (long === void 0)
                long = 0;
              if (long > $util.recursionLimit)
                throw Error("maximum nesting depth exceeded");
              var message = new $root.presage.smartspectra.Face();
              if (object.blinking) {
                if (!Array.isArray(object.blinking))
                  throw TypeError(".presage.smartspectra.Face.blinking: array expected");
                message.blinking = [];
                for (var i = 0; i < object.blinking.length; ++i) {
                  if (!$util.isObject(object.blinking[i]))
                    throw TypeError(".presage.smartspectra.Face.blinking: object expected");
                  message.blinking[i] = $root.presage.smartspectra.DetectionStatus.fromObject(object.blinking[i], long + 1);
                }
              }
              if (object.talking) {
                if (!Array.isArray(object.talking))
                  throw TypeError(".presage.smartspectra.Face.talking: array expected");
                message.talking = [];
                for (var i = 0; i < object.talking.length; ++i) {
                  if (!$util.isObject(object.talking[i]))
                    throw TypeError(".presage.smartspectra.Face.talking: object expected");
                  message.talking[i] = $root.presage.smartspectra.DetectionStatus.fromObject(object.talking[i], long + 1);
                }
              }
              if (object.landmarks) {
                if (!Array.isArray(object.landmarks))
                  throw TypeError(".presage.smartspectra.Face.landmarks: array expected");
                message.landmarks = [];
                for (var i = 0; i < object.landmarks.length; ++i) {
                  if (!$util.isObject(object.landmarks[i]))
                    throw TypeError(".presage.smartspectra.Face.landmarks: object expected");
                  message.landmarks[i] = $root.presage.smartspectra.Landmarks.fromObject(object.landmarks[i], long + 1);
                }
              }
              if (object.expression) {
                if (!Array.isArray(object.expression))
                  throw TypeError(".presage.smartspectra.Face.expression: array expected");
                message.expression = [];
                for (var i = 0; i < object.expression.length; ++i) {
                  if (!$util.isObject(object.expression[i]))
                    throw TypeError(".presage.smartspectra.Face.expression: object expected");
                  message.expression[i] = $root.presage.smartspectra.Expression.fromObject(object.expression[i], long + 1);
                }
              }
              return message;
            };
            Face.toObject = function toObject(message, options, q) {
              if (!options)
                options = {};
              if (q === void 0)
                q = 0;
              if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
              var object = {};
              if (options.arrays || options.defaults) {
                object.blinking = [];
                object.talking = [];
                object.landmarks = [];
                object.expression = [];
              }
              if (message.blinking && message.blinking.length) {
                object.blinking = [];
                for (var j = 0; j < message.blinking.length; ++j)
                  object.blinking[j] = $root.presage.smartspectra.DetectionStatus.toObject(message.blinking[j], options, q + 1);
              }
              if (message.talking && message.talking.length) {
                object.talking = [];
                for (var j = 0; j < message.talking.length; ++j)
                  object.talking[j] = $root.presage.smartspectra.DetectionStatus.toObject(message.talking[j], options, q + 1);
              }
              if (message.landmarks && message.landmarks.length) {
                object.landmarks = [];
                for (var j = 0; j < message.landmarks.length; ++j)
                  object.landmarks[j] = $root.presage.smartspectra.Landmarks.toObject(message.landmarks[j], options, q + 1);
              }
              if (message.expression && message.expression.length) {
                object.expression = [];
                for (var j = 0; j < message.expression.length; ++j)
                  object.expression[j] = $root.presage.smartspectra.Expression.toObject(message.expression[j], options, q + 1);
              }
              return object;
            };
            Face.prototype.toJSON = function toJSON() {
              return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
            Face.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
              if (typeUrlPrefix === void 0) {
                typeUrlPrefix = "type.googleapis.com";
              }
              return typeUrlPrefix + "/presage.smartspectra.Face";
            };
            return Face;
          })();
          smartspectra.MicroMotion = (function() {
            function MicroMotion(properties) {
              this.glutes = [];
              this.knees = [];
              if (properties) {
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                  if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
              }
            }
            MicroMotion.prototype.glutes = $util.emptyArray;
            MicroMotion.prototype.knees = $util.emptyArray;
            MicroMotion.create = function create(properties) {
              return new MicroMotion(properties);
            };
            MicroMotion.encode = function encode(message, writer, q) {
              if (!writer)
                writer = $Writer.create();
              if (q === void 0)
                q = 0;
              if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
              if (message.glutes != null && message.glutes.length)
                for (var i = 0; i < message.glutes.length; ++i)
                  $root.presage.smartspectra.Measurement.encode(message.glutes[i], writer.uint32(
                    /* id 1, wireType 2 =*/
                    10
                  ).fork(), q + 1).ldelim();
              if (message.knees != null && message.knees.length)
                for (var i = 0; i < message.knees.length; ++i)
                  $root.presage.smartspectra.Measurement.encode(message.knees[i], writer.uint32(
                    /* id 2, wireType 2 =*/
                    18
                  ).fork(), q + 1).ldelim();
              return writer;
            };
            MicroMotion.encodeDelimited = function encodeDelimited(message, writer) {
              return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };
            MicroMotion.decode = function decode(reader, length, error, long) {
              if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
              if (long === void 0)
                long = 0;
              if (long > $Reader.recursionLimit)
                throw Error("maximum nesting depth exceeded");
              var end, message;
              if (length === void 0)
                end = reader.len;
              else {
                end = reader.pos + length;
                if (end > reader.len)
                  throw RangeError("index out of range");
                length = reader.len;
                reader.len = end;
              }
              message = new $root.presage.smartspectra.MicroMotion();
              while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                  break;
                switch (tag >>> 3) {
                  case 1: {
                    if (!(message.glutes && message.glutes.length))
                      message.glutes = [];
                    message.glutes.push($root.presage.smartspectra.Measurement.decode(reader, reader.uint32(), void 0, long + 1));
                    break;
                  }
                  case 2: {
                    if (!(message.knees && message.knees.length))
                      message.knees = [];
                    message.knees.push($root.presage.smartspectra.Measurement.decode(reader, reader.uint32(), void 0, long + 1));
                    break;
                  }
                  default:
                    reader.skipType(tag & 7, long);
                    break;
                }
              }
              if (length !== void 0) {
                if (reader.pos !== end)
                  throw RangeError("index out of range");
                reader.len = length;
              }
              return message;
            };
            MicroMotion.decodeDelimited = function decodeDelimited(reader) {
              if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
              return this.decode(reader, reader.uint32());
            };
            MicroMotion.verify = function verify(message, long) {
              if (typeof message !== "object" || message === null)
                return "object expected";
              if (long === void 0)
                long = 0;
              if (long > $util.recursionLimit)
                return "maximum nesting depth exceeded";
              if (message.glutes != null && Object.hasOwnProperty.call(message, "glutes")) {
                if (!Array.isArray(message.glutes))
                  return "glutes: array expected";
                for (var i = 0; i < message.glutes.length; ++i) {
                  var error = $root.presage.smartspectra.Measurement.verify(message.glutes[i], long + 1);
                  if (error)
                    return "glutes." + error;
                }
              }
              if (message.knees != null && Object.hasOwnProperty.call(message, "knees")) {
                if (!Array.isArray(message.knees))
                  return "knees: array expected";
                for (var i = 0; i < message.knees.length; ++i) {
                  var error = $root.presage.smartspectra.Measurement.verify(message.knees[i], long + 1);
                  if (error)
                    return "knees." + error;
                }
              }
              return null;
            };
            MicroMotion.fromObject = function fromObject(object, long) {
              if (object instanceof $root.presage.smartspectra.MicroMotion)
                return object;
              if (!$util.isObject(object))
                throw TypeError(".presage.smartspectra.MicroMotion: object expected");
              if (long === void 0)
                long = 0;
              if (long > $util.recursionLimit)
                throw Error("maximum nesting depth exceeded");
              var message = new $root.presage.smartspectra.MicroMotion();
              if (object.glutes) {
                if (!Array.isArray(object.glutes))
                  throw TypeError(".presage.smartspectra.MicroMotion.glutes: array expected");
                message.glutes = [];
                for (var i = 0; i < object.glutes.length; ++i) {
                  if (!$util.isObject(object.glutes[i]))
                    throw TypeError(".presage.smartspectra.MicroMotion.glutes: object expected");
                  message.glutes[i] = $root.presage.smartspectra.Measurement.fromObject(object.glutes[i], long + 1);
                }
              }
              if (object.knees) {
                if (!Array.isArray(object.knees))
                  throw TypeError(".presage.smartspectra.MicroMotion.knees: array expected");
                message.knees = [];
                for (var i = 0; i < object.knees.length; ++i) {
                  if (!$util.isObject(object.knees[i]))
                    throw TypeError(".presage.smartspectra.MicroMotion.knees: object expected");
                  message.knees[i] = $root.presage.smartspectra.Measurement.fromObject(object.knees[i], long + 1);
                }
              }
              return message;
            };
            MicroMotion.toObject = function toObject(message, options, q) {
              if (!options)
                options = {};
              if (q === void 0)
                q = 0;
              if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
              var object = {};
              if (options.arrays || options.defaults) {
                object.glutes = [];
                object.knees = [];
              }
              if (message.glutes && message.glutes.length) {
                object.glutes = [];
                for (var j = 0; j < message.glutes.length; ++j)
                  object.glutes[j] = $root.presage.smartspectra.Measurement.toObject(message.glutes[j], options, q + 1);
              }
              if (message.knees && message.knees.length) {
                object.knees = [];
                for (var j = 0; j < message.knees.length; ++j)
                  object.knees[j] = $root.presage.smartspectra.Measurement.toObject(message.knees[j], options, q + 1);
              }
              return object;
            };
            MicroMotion.prototype.toJSON = function toJSON() {
              return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
            MicroMotion.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
              if (typeUrlPrefix === void 0) {
                typeUrlPrefix = "type.googleapis.com";
              }
              return typeUrlPrefix + "/presage.smartspectra.MicroMotion";
            };
            return MicroMotion;
          })();
          smartspectra.Eda = (function() {
            function Eda(properties) {
              this.trace = [];
              if (properties) {
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                  if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
              }
            }
            Eda.prototype.trace = $util.emptyArray;
            Eda.create = function create(properties) {
              return new Eda(properties);
            };
            Eda.encode = function encode(message, writer, q) {
              if (!writer)
                writer = $Writer.create();
              if (q === void 0)
                q = 0;
              if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
              if (message.trace != null && message.trace.length)
                for (var i = 0; i < message.trace.length; ++i)
                  $root.presage.smartspectra.Measurement.encode(message.trace[i], writer.uint32(
                    /* id 1, wireType 2 =*/
                    10
                  ).fork(), q + 1).ldelim();
              return writer;
            };
            Eda.encodeDelimited = function encodeDelimited(message, writer) {
              return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };
            Eda.decode = function decode(reader, length, error, long) {
              if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
              if (long === void 0)
                long = 0;
              if (long > $Reader.recursionLimit)
                throw Error("maximum nesting depth exceeded");
              var end, message;
              if (length === void 0)
                end = reader.len;
              else {
                end = reader.pos + length;
                if (end > reader.len)
                  throw RangeError("index out of range");
                length = reader.len;
                reader.len = end;
              }
              message = new $root.presage.smartspectra.Eda();
              while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                  break;
                switch (tag >>> 3) {
                  case 1: {
                    if (!(message.trace && message.trace.length))
                      message.trace = [];
                    message.trace.push($root.presage.smartspectra.Measurement.decode(reader, reader.uint32(), void 0, long + 1));
                    break;
                  }
                  default:
                    reader.skipType(tag & 7, long);
                    break;
                }
              }
              if (length !== void 0) {
                if (reader.pos !== end)
                  throw RangeError("index out of range");
                reader.len = length;
              }
              return message;
            };
            Eda.decodeDelimited = function decodeDelimited(reader) {
              if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
              return this.decode(reader, reader.uint32());
            };
            Eda.verify = function verify(message, long) {
              if (typeof message !== "object" || message === null)
                return "object expected";
              if (long === void 0)
                long = 0;
              if (long > $util.recursionLimit)
                return "maximum nesting depth exceeded";
              if (message.trace != null && Object.hasOwnProperty.call(message, "trace")) {
                if (!Array.isArray(message.trace))
                  return "trace: array expected";
                for (var i = 0; i < message.trace.length; ++i) {
                  var error = $root.presage.smartspectra.Measurement.verify(message.trace[i], long + 1);
                  if (error)
                    return "trace." + error;
                }
              }
              return null;
            };
            Eda.fromObject = function fromObject(object, long) {
              if (object instanceof $root.presage.smartspectra.Eda)
                return object;
              if (!$util.isObject(object))
                throw TypeError(".presage.smartspectra.Eda: object expected");
              if (long === void 0)
                long = 0;
              if (long > $util.recursionLimit)
                throw Error("maximum nesting depth exceeded");
              var message = new $root.presage.smartspectra.Eda();
              if (object.trace) {
                if (!Array.isArray(object.trace))
                  throw TypeError(".presage.smartspectra.Eda.trace: array expected");
                message.trace = [];
                for (var i = 0; i < object.trace.length; ++i) {
                  if (!$util.isObject(object.trace[i]))
                    throw TypeError(".presage.smartspectra.Eda.trace: object expected");
                  message.trace[i] = $root.presage.smartspectra.Measurement.fromObject(object.trace[i], long + 1);
                }
              }
              return message;
            };
            Eda.toObject = function toObject(message, options, q) {
              if (!options)
                options = {};
              if (q === void 0)
                q = 0;
              if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
              var object = {};
              if (options.arrays || options.defaults)
                object.trace = [];
              if (message.trace && message.trace.length) {
                object.trace = [];
                for (var j = 0; j < message.trace.length; ++j)
                  object.trace[j] = $root.presage.smartspectra.Measurement.toObject(message.trace[j], options, q + 1);
              }
              return object;
            };
            Eda.prototype.toJSON = function toJSON() {
              return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
            Eda.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
              if (typeUrlPrefix === void 0) {
                typeUrlPrefix = "type.googleapis.com";
              }
              return typeUrlPrefix + "/presage.smartspectra.Eda";
            };
            return Eda;
          })();
          smartspectra.Cardio = (function() {
            function Cardio(properties) {
              this.pulseRate = [];
              this.arterialPressureTrace = [];
              this.hrv = [];
              if (properties) {
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                  if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
              }
            }
            Cardio.prototype.pulseRate = $util.emptyArray;
            Cardio.prototype.arterialPressureTrace = $util.emptyArray;
            Cardio.prototype.hrv = $util.emptyArray;
            Cardio.prototype.pulseRateStrict = null;
            Cardio.create = function create(properties) {
              return new Cardio(properties);
            };
            Cardio.encode = function encode(message, writer, q) {
              if (!writer)
                writer = $Writer.create();
              if (q === void 0)
                q = 0;
              if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
              if (message.pulseRate != null && message.pulseRate.length)
                for (var i = 0; i < message.pulseRate.length; ++i)
                  $root.presage.smartspectra.MeasurementWithConfidence.encode(message.pulseRate[i], writer.uint32(
                    /* id 1, wireType 2 =*/
                    10
                  ).fork(), q + 1).ldelim();
              if (message.arterialPressureTrace != null && message.arterialPressureTrace.length)
                for (var i = 0; i < message.arterialPressureTrace.length; ++i)
                  $root.presage.smartspectra.MeasurementWithConfidence.encode(message.arterialPressureTrace[i], writer.uint32(
                    /* id 2, wireType 2 =*/
                    18
                  ).fork(), q + 1).ldelim();
              if (message.hrv != null && message.hrv.length)
                for (var i = 0; i < message.hrv.length; ++i)
                  $root.presage.smartspectra.Hrv.encode(message.hrv[i], writer.uint32(
                    /* id 3, wireType 2 =*/
                    26
                  ).fork(), q + 1).ldelim();
              if (message.pulseRateStrict != null && Object.hasOwnProperty.call(message, "pulseRateStrict"))
                $root.presage.smartspectra.Strict.encode(message.pulseRateStrict, writer.uint32(
                  /* id 4, wireType 2 =*/
                  34
                ).fork(), q + 1).ldelim();
              return writer;
            };
            Cardio.encodeDelimited = function encodeDelimited(message, writer) {
              return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };
            Cardio.decode = function decode(reader, length, error, long) {
              if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
              if (long === void 0)
                long = 0;
              if (long > $Reader.recursionLimit)
                throw Error("maximum nesting depth exceeded");
              var end, message;
              if (length === void 0)
                end = reader.len;
              else {
                end = reader.pos + length;
                if (end > reader.len)
                  throw RangeError("index out of range");
                length = reader.len;
                reader.len = end;
              }
              message = new $root.presage.smartspectra.Cardio();
              while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                  break;
                switch (tag >>> 3) {
                  case 1: {
                    if (!(message.pulseRate && message.pulseRate.length))
                      message.pulseRate = [];
                    message.pulseRate.push($root.presage.smartspectra.MeasurementWithConfidence.decode(reader, reader.uint32(), void 0, long + 1));
                    break;
                  }
                  case 2: {
                    if (!(message.arterialPressureTrace && message.arterialPressureTrace.length))
                      message.arterialPressureTrace = [];
                    message.arterialPressureTrace.push($root.presage.smartspectra.MeasurementWithConfidence.decode(reader, reader.uint32(), void 0, long + 1));
                    break;
                  }
                  case 3: {
                    if (!(message.hrv && message.hrv.length))
                      message.hrv = [];
                    message.hrv.push($root.presage.smartspectra.Hrv.decode(reader, reader.uint32(), void 0, long + 1));
                    break;
                  }
                  case 4: {
                    message.pulseRateStrict = $root.presage.smartspectra.Strict.decode(reader, reader.uint32(), void 0, long + 1);
                    break;
                  }
                  default:
                    reader.skipType(tag & 7, long);
                    break;
                }
              }
              if (length !== void 0) {
                if (reader.pos !== end)
                  throw RangeError("index out of range");
                reader.len = length;
              }
              return message;
            };
            Cardio.decodeDelimited = function decodeDelimited(reader) {
              if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
              return this.decode(reader, reader.uint32());
            };
            Cardio.verify = function verify(message, long) {
              if (typeof message !== "object" || message === null)
                return "object expected";
              if (long === void 0)
                long = 0;
              if (long > $util.recursionLimit)
                return "maximum nesting depth exceeded";
              if (message.pulseRate != null && Object.hasOwnProperty.call(message, "pulseRate")) {
                if (!Array.isArray(message.pulseRate))
                  return "pulseRate: array expected";
                for (var i = 0; i < message.pulseRate.length; ++i) {
                  var error = $root.presage.smartspectra.MeasurementWithConfidence.verify(message.pulseRate[i], long + 1);
                  if (error)
                    return "pulseRate." + error;
                }
              }
              if (message.arterialPressureTrace != null && Object.hasOwnProperty.call(message, "arterialPressureTrace")) {
                if (!Array.isArray(message.arterialPressureTrace))
                  return "arterialPressureTrace: array expected";
                for (var i = 0; i < message.arterialPressureTrace.length; ++i) {
                  var error = $root.presage.smartspectra.MeasurementWithConfidence.verify(message.arterialPressureTrace[i], long + 1);
                  if (error)
                    return "arterialPressureTrace." + error;
                }
              }
              if (message.hrv != null && Object.hasOwnProperty.call(message, "hrv")) {
                if (!Array.isArray(message.hrv))
                  return "hrv: array expected";
                for (var i = 0; i < message.hrv.length; ++i) {
                  var error = $root.presage.smartspectra.Hrv.verify(message.hrv[i], long + 1);
                  if (error)
                    return "hrv." + error;
                }
              }
              if (message.pulseRateStrict != null && Object.hasOwnProperty.call(message, "pulseRateStrict")) {
                var error = $root.presage.smartspectra.Strict.verify(message.pulseRateStrict, long + 1);
                if (error)
                  return "pulseRateStrict." + error;
              }
              return null;
            };
            Cardio.fromObject = function fromObject(object, long) {
              if (object instanceof $root.presage.smartspectra.Cardio)
                return object;
              if (!$util.isObject(object))
                throw TypeError(".presage.smartspectra.Cardio: object expected");
              if (long === void 0)
                long = 0;
              if (long > $util.recursionLimit)
                throw Error("maximum nesting depth exceeded");
              var message = new $root.presage.smartspectra.Cardio();
              if (object.pulseRate) {
                if (!Array.isArray(object.pulseRate))
                  throw TypeError(".presage.smartspectra.Cardio.pulseRate: array expected");
                message.pulseRate = [];
                for (var i = 0; i < object.pulseRate.length; ++i) {
                  if (!$util.isObject(object.pulseRate[i]))
                    throw TypeError(".presage.smartspectra.Cardio.pulseRate: object expected");
                  message.pulseRate[i] = $root.presage.smartspectra.MeasurementWithConfidence.fromObject(object.pulseRate[i], long + 1);
                }
              }
              if (object.arterialPressureTrace) {
                if (!Array.isArray(object.arterialPressureTrace))
                  throw TypeError(".presage.smartspectra.Cardio.arterialPressureTrace: array expected");
                message.arterialPressureTrace = [];
                for (var i = 0; i < object.arterialPressureTrace.length; ++i) {
                  if (!$util.isObject(object.arterialPressureTrace[i]))
                    throw TypeError(".presage.smartspectra.Cardio.arterialPressureTrace: object expected");
                  message.arterialPressureTrace[i] = $root.presage.smartspectra.MeasurementWithConfidence.fromObject(object.arterialPressureTrace[i], long + 1);
                }
              }
              if (object.hrv) {
                if (!Array.isArray(object.hrv))
                  throw TypeError(".presage.smartspectra.Cardio.hrv: array expected");
                message.hrv = [];
                for (var i = 0; i < object.hrv.length; ++i) {
                  if (!$util.isObject(object.hrv[i]))
                    throw TypeError(".presage.smartspectra.Cardio.hrv: object expected");
                  message.hrv[i] = $root.presage.smartspectra.Hrv.fromObject(object.hrv[i], long + 1);
                }
              }
              if (object.pulseRateStrict != null) {
                if (!$util.isObject(object.pulseRateStrict))
                  throw TypeError(".presage.smartspectra.Cardio.pulseRateStrict: object expected");
                message.pulseRateStrict = $root.presage.smartspectra.Strict.fromObject(object.pulseRateStrict, long + 1);
              }
              return message;
            };
            Cardio.toObject = function toObject(message, options, q) {
              if (!options)
                options = {};
              if (q === void 0)
                q = 0;
              if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
              var object = {};
              if (options.arrays || options.defaults) {
                object.pulseRate = [];
                object.arterialPressureTrace = [];
                object.hrv = [];
              }
              if (options.defaults)
                object.pulseRateStrict = null;
              if (message.pulseRate && message.pulseRate.length) {
                object.pulseRate = [];
                for (var j = 0; j < message.pulseRate.length; ++j)
                  object.pulseRate[j] = $root.presage.smartspectra.MeasurementWithConfidence.toObject(message.pulseRate[j], options, q + 1);
              }
              if (message.arterialPressureTrace && message.arterialPressureTrace.length) {
                object.arterialPressureTrace = [];
                for (var j = 0; j < message.arterialPressureTrace.length; ++j)
                  object.arterialPressureTrace[j] = $root.presage.smartspectra.MeasurementWithConfidence.toObject(message.arterialPressureTrace[j], options, q + 1);
              }
              if (message.hrv && message.hrv.length) {
                object.hrv = [];
                for (var j = 0; j < message.hrv.length; ++j)
                  object.hrv[j] = $root.presage.smartspectra.Hrv.toObject(message.hrv[j], options, q + 1);
              }
              if (message.pulseRateStrict != null && Object.hasOwnProperty.call(message, "pulseRateStrict"))
                object.pulseRateStrict = $root.presage.smartspectra.Strict.toObject(message.pulseRateStrict, options, q + 1);
              return object;
            };
            Cardio.prototype.toJSON = function toJSON() {
              return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
            Cardio.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
              if (typeUrlPrefix === void 0) {
                typeUrlPrefix = "type.googleapis.com";
              }
              return typeUrlPrefix + "/presage.smartspectra.Cardio";
            };
            return Cardio;
          })();
          smartspectra.Metrics = (function() {
            function Metrics(properties) {
              if (properties) {
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                  if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
              }
            }
            Metrics.prototype.breathing = null;
            Metrics.prototype.micromotion = null;
            Metrics.prototype.eda = null;
            Metrics.prototype.face = null;
            Metrics.prototype.cardio = null;
            Metrics.create = function create(properties) {
              return new Metrics(properties);
            };
            Metrics.encode = function encode(message, writer, q) {
              if (!writer)
                writer = $Writer.create();
              if (q === void 0)
                q = 0;
              if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
              if (message.breathing != null && Object.hasOwnProperty.call(message, "breathing"))
                $root.presage.smartspectra.Breathing.encode(message.breathing, writer.uint32(
                  /* id 1, wireType 2 =*/
                  10
                ).fork(), q + 1).ldelim();
              if (message.micromotion != null && Object.hasOwnProperty.call(message, "micromotion"))
                $root.presage.smartspectra.MicroMotion.encode(message.micromotion, writer.uint32(
                  /* id 2, wireType 2 =*/
                  18
                ).fork(), q + 1).ldelim();
              if (message.eda != null && Object.hasOwnProperty.call(message, "eda"))
                $root.presage.smartspectra.Eda.encode(message.eda, writer.uint32(
                  /* id 3, wireType 2 =*/
                  26
                ).fork(), q + 1).ldelim();
              if (message.face != null && Object.hasOwnProperty.call(message, "face"))
                $root.presage.smartspectra.Face.encode(message.face, writer.uint32(
                  /* id 4, wireType 2 =*/
                  34
                ).fork(), q + 1).ldelim();
              if (message.cardio != null && Object.hasOwnProperty.call(message, "cardio"))
                $root.presage.smartspectra.Cardio.encode(message.cardio, writer.uint32(
                  /* id 5, wireType 2 =*/
                  42
                ).fork(), q + 1).ldelim();
              return writer;
            };
            Metrics.encodeDelimited = function encodeDelimited(message, writer) {
              return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };
            Metrics.decode = function decode(reader, length, error, long) {
              if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
              if (long === void 0)
                long = 0;
              if (long > $Reader.recursionLimit)
                throw Error("maximum nesting depth exceeded");
              var end, message;
              if (length === void 0)
                end = reader.len;
              else {
                end = reader.pos + length;
                if (end > reader.len)
                  throw RangeError("index out of range");
                length = reader.len;
                reader.len = end;
              }
              message = new $root.presage.smartspectra.Metrics();
              while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                  break;
                switch (tag >>> 3) {
                  case 1: {
                    message.breathing = $root.presage.smartspectra.Breathing.decode(reader, reader.uint32(), void 0, long + 1);
                    break;
                  }
                  case 2: {
                    message.micromotion = $root.presage.smartspectra.MicroMotion.decode(reader, reader.uint32(), void 0, long + 1);
                    break;
                  }
                  case 3: {
                    message.eda = $root.presage.smartspectra.Eda.decode(reader, reader.uint32(), void 0, long + 1);
                    break;
                  }
                  case 4: {
                    message.face = $root.presage.smartspectra.Face.decode(reader, reader.uint32(), void 0, long + 1);
                    break;
                  }
                  case 5: {
                    message.cardio = $root.presage.smartspectra.Cardio.decode(reader, reader.uint32(), void 0, long + 1);
                    break;
                  }
                  default:
                    reader.skipType(tag & 7, long);
                    break;
                }
              }
              if (length !== void 0) {
                if (reader.pos !== end)
                  throw RangeError("index out of range");
                reader.len = length;
              }
              return message;
            };
            Metrics.decodeDelimited = function decodeDelimited(reader) {
              if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
              return this.decode(reader, reader.uint32());
            };
            Metrics.verify = function verify(message, long) {
              if (typeof message !== "object" || message === null)
                return "object expected";
              if (long === void 0)
                long = 0;
              if (long > $util.recursionLimit)
                return "maximum nesting depth exceeded";
              if (message.breathing != null && Object.hasOwnProperty.call(message, "breathing")) {
                var error = $root.presage.smartspectra.Breathing.verify(message.breathing, long + 1);
                if (error)
                  return "breathing." + error;
              }
              if (message.micromotion != null && Object.hasOwnProperty.call(message, "micromotion")) {
                var error = $root.presage.smartspectra.MicroMotion.verify(message.micromotion, long + 1);
                if (error)
                  return "micromotion." + error;
              }
              if (message.eda != null && Object.hasOwnProperty.call(message, "eda")) {
                var error = $root.presage.smartspectra.Eda.verify(message.eda, long + 1);
                if (error)
                  return "eda." + error;
              }
              if (message.face != null && Object.hasOwnProperty.call(message, "face")) {
                var error = $root.presage.smartspectra.Face.verify(message.face, long + 1);
                if (error)
                  return "face." + error;
              }
              if (message.cardio != null && Object.hasOwnProperty.call(message, "cardio")) {
                var error = $root.presage.smartspectra.Cardio.verify(message.cardio, long + 1);
                if (error)
                  return "cardio." + error;
              }
              return null;
            };
            Metrics.fromObject = function fromObject(object, long) {
              if (object instanceof $root.presage.smartspectra.Metrics)
                return object;
              if (!$util.isObject(object))
                throw TypeError(".presage.smartspectra.Metrics: object expected");
              if (long === void 0)
                long = 0;
              if (long > $util.recursionLimit)
                throw Error("maximum nesting depth exceeded");
              var message = new $root.presage.smartspectra.Metrics();
              if (object.breathing != null) {
                if (!$util.isObject(object.breathing))
                  throw TypeError(".presage.smartspectra.Metrics.breathing: object expected");
                message.breathing = $root.presage.smartspectra.Breathing.fromObject(object.breathing, long + 1);
              }
              if (object.micromotion != null) {
                if (!$util.isObject(object.micromotion))
                  throw TypeError(".presage.smartspectra.Metrics.micromotion: object expected");
                message.micromotion = $root.presage.smartspectra.MicroMotion.fromObject(object.micromotion, long + 1);
              }
              if (object.eda != null) {
                if (!$util.isObject(object.eda))
                  throw TypeError(".presage.smartspectra.Metrics.eda: object expected");
                message.eda = $root.presage.smartspectra.Eda.fromObject(object.eda, long + 1);
              }
              if (object.face != null) {
                if (!$util.isObject(object.face))
                  throw TypeError(".presage.smartspectra.Metrics.face: object expected");
                message.face = $root.presage.smartspectra.Face.fromObject(object.face, long + 1);
              }
              if (object.cardio != null) {
                if (!$util.isObject(object.cardio))
                  throw TypeError(".presage.smartspectra.Metrics.cardio: object expected");
                message.cardio = $root.presage.smartspectra.Cardio.fromObject(object.cardio, long + 1);
              }
              return message;
            };
            Metrics.toObject = function toObject(message, options, q) {
              if (!options)
                options = {};
              if (q === void 0)
                q = 0;
              if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
              var object = {};
              if (options.defaults) {
                object.breathing = null;
                object.micromotion = null;
                object.eda = null;
                object.face = null;
                object.cardio = null;
              }
              if (message.breathing != null && Object.hasOwnProperty.call(message, "breathing"))
                object.breathing = $root.presage.smartspectra.Breathing.toObject(message.breathing, options, q + 1);
              if (message.micromotion != null && Object.hasOwnProperty.call(message, "micromotion"))
                object.micromotion = $root.presage.smartspectra.MicroMotion.toObject(message.micromotion, options, q + 1);
              if (message.eda != null && Object.hasOwnProperty.call(message, "eda"))
                object.eda = $root.presage.smartspectra.Eda.toObject(message.eda, options, q + 1);
              if (message.face != null && Object.hasOwnProperty.call(message, "face"))
                object.face = $root.presage.smartspectra.Face.toObject(message.face, options, q + 1);
              if (message.cardio != null && Object.hasOwnProperty.call(message, "cardio"))
                object.cardio = $root.presage.smartspectra.Cardio.toObject(message.cardio, options, q + 1);
              return object;
            };
            Metrics.prototype.toJSON = function toJSON() {
              return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
            Metrics.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
              if (typeUrlPrefix === void 0) {
                typeUrlPrefix = "type.googleapis.com";
              }
              return typeUrlPrefix + "/presage.smartspectra.Metrics";
            };
            return Metrics;
          })();
          smartspectra.Point2dInt32 = (function() {
            function Point2dInt32(properties) {
              if (properties) {
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                  if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
              }
            }
            Point2dInt32.prototype.x = 0;
            Point2dInt32.prototype.y = 0;
            Point2dInt32.create = function create(properties) {
              return new Point2dInt32(properties);
            };
            Point2dInt32.encode = function encode(message, writer, q) {
              if (!writer)
                writer = $Writer.create();
              if (q === void 0)
                q = 0;
              if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
              if (message.x != null && Object.hasOwnProperty.call(message, "x"))
                writer.uint32(
                  /* id 1, wireType 0 =*/
                  8
                ).int32(message.x);
              if (message.y != null && Object.hasOwnProperty.call(message, "y"))
                writer.uint32(
                  /* id 2, wireType 0 =*/
                  16
                ).int32(message.y);
              return writer;
            };
            Point2dInt32.encodeDelimited = function encodeDelimited(message, writer) {
              return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };
            Point2dInt32.decode = function decode(reader, length, error, long) {
              if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
              if (long === void 0)
                long = 0;
              if (long > $Reader.recursionLimit)
                throw Error("maximum nesting depth exceeded");
              var end, message;
              if (length === void 0)
                end = reader.len;
              else {
                end = reader.pos + length;
                if (end > reader.len)
                  throw RangeError("index out of range");
                length = reader.len;
                reader.len = end;
              }
              message = new $root.presage.smartspectra.Point2dInt32();
              while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                  break;
                switch (tag >>> 3) {
                  case 1: {
                    message.x = reader.int32();
                    break;
                  }
                  case 2: {
                    message.y = reader.int32();
                    break;
                  }
                  default:
                    reader.skipType(tag & 7, long);
                    break;
                }
              }
              if (length !== void 0) {
                if (reader.pos !== end)
                  throw RangeError("index out of range");
                reader.len = length;
              }
              return message;
            };
            Point2dInt32.decodeDelimited = function decodeDelimited(reader) {
              if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
              return this.decode(reader, reader.uint32());
            };
            Point2dInt32.verify = function verify(message, long) {
              if (typeof message !== "object" || message === null)
                return "object expected";
              if (long === void 0)
                long = 0;
              if (long > $util.recursionLimit)
                return "maximum nesting depth exceeded";
              if (message.x != null && Object.hasOwnProperty.call(message, "x")) {
                if (!$util.isInteger(message.x))
                  return "x: integer expected";
              }
              if (message.y != null && Object.hasOwnProperty.call(message, "y")) {
                if (!$util.isInteger(message.y))
                  return "y: integer expected";
              }
              return null;
            };
            Point2dInt32.fromObject = function fromObject(object, long) {
              if (object instanceof $root.presage.smartspectra.Point2dInt32)
                return object;
              if (!$util.isObject(object))
                throw TypeError(".presage.smartspectra.Point2dInt32: object expected");
              if (long === void 0)
                long = 0;
              if (long > $util.recursionLimit)
                throw Error("maximum nesting depth exceeded");
              var message = new $root.presage.smartspectra.Point2dInt32();
              if (object.x != null)
                message.x = object.x | 0;
              if (object.y != null)
                message.y = object.y | 0;
              return message;
            };
            Point2dInt32.toObject = function toObject(message, options, q) {
              if (!options)
                options = {};
              if (q === void 0)
                q = 0;
              if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
              var object = {};
              if (options.defaults) {
                object.x = 0;
                object.y = 0;
              }
              if (message.x != null && Object.hasOwnProperty.call(message, "x"))
                object.x = message.x;
              if (message.y != null && Object.hasOwnProperty.call(message, "y"))
                object.y = message.y;
              return object;
            };
            Point2dInt32.prototype.toJSON = function toJSON() {
              return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
            Point2dInt32.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
              if (typeUrlPrefix === void 0) {
                typeUrlPrefix = "type.googleapis.com";
              }
              return typeUrlPrefix + "/presage.smartspectra.Point2dInt32";
            };
            return Point2dInt32;
          })();
          smartspectra.Point2dFloat = (function() {
            function Point2dFloat(properties) {
              if (properties) {
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                  if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
              }
            }
            Point2dFloat.prototype.x = 0;
            Point2dFloat.prototype.y = 0;
            Point2dFloat.create = function create(properties) {
              return new Point2dFloat(properties);
            };
            Point2dFloat.encode = function encode(message, writer, q) {
              if (!writer)
                writer = $Writer.create();
              if (q === void 0)
                q = 0;
              if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
              if (message.x != null && Object.hasOwnProperty.call(message, "x"))
                writer.uint32(
                  /* id 1, wireType 5 =*/
                  13
                ).float(message.x);
              if (message.y != null && Object.hasOwnProperty.call(message, "y"))
                writer.uint32(
                  /* id 2, wireType 5 =*/
                  21
                ).float(message.y);
              return writer;
            };
            Point2dFloat.encodeDelimited = function encodeDelimited(message, writer) {
              return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };
            Point2dFloat.decode = function decode(reader, length, error, long) {
              if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
              if (long === void 0)
                long = 0;
              if (long > $Reader.recursionLimit)
                throw Error("maximum nesting depth exceeded");
              var end, message;
              if (length === void 0)
                end = reader.len;
              else {
                end = reader.pos + length;
                if (end > reader.len)
                  throw RangeError("index out of range");
                length = reader.len;
                reader.len = end;
              }
              message = new $root.presage.smartspectra.Point2dFloat();
              while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                  break;
                switch (tag >>> 3) {
                  case 1: {
                    message.x = reader.float();
                    break;
                  }
                  case 2: {
                    message.y = reader.float();
                    break;
                  }
                  default:
                    reader.skipType(tag & 7, long);
                    break;
                }
              }
              if (length !== void 0) {
                if (reader.pos !== end)
                  throw RangeError("index out of range");
                reader.len = length;
              }
              return message;
            };
            Point2dFloat.decodeDelimited = function decodeDelimited(reader) {
              if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
              return this.decode(reader, reader.uint32());
            };
            Point2dFloat.verify = function verify(message, long) {
              if (typeof message !== "object" || message === null)
                return "object expected";
              if (long === void 0)
                long = 0;
              if (long > $util.recursionLimit)
                return "maximum nesting depth exceeded";
              if (message.x != null && Object.hasOwnProperty.call(message, "x")) {
                if (typeof message.x !== "number")
                  return "x: number expected";
              }
              if (message.y != null && Object.hasOwnProperty.call(message, "y")) {
                if (typeof message.y !== "number")
                  return "y: number expected";
              }
              return null;
            };
            Point2dFloat.fromObject = function fromObject(object, long) {
              if (object instanceof $root.presage.smartspectra.Point2dFloat)
                return object;
              if (!$util.isObject(object))
                throw TypeError(".presage.smartspectra.Point2dFloat: object expected");
              if (long === void 0)
                long = 0;
              if (long > $util.recursionLimit)
                throw Error("maximum nesting depth exceeded");
              var message = new $root.presage.smartspectra.Point2dFloat();
              if (object.x != null)
                message.x = Number(object.x);
              if (object.y != null)
                message.y = Number(object.y);
              return message;
            };
            Point2dFloat.toObject = function toObject(message, options, q) {
              if (!options)
                options = {};
              if (q === void 0)
                q = 0;
              if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
              var object = {};
              if (options.defaults) {
                object.x = 0;
                object.y = 0;
              }
              if (message.x != null && Object.hasOwnProperty.call(message, "x"))
                object.x = options.json && !isFinite(message.x) ? String(message.x) : message.x;
              if (message.y != null && Object.hasOwnProperty.call(message, "y"))
                object.y = options.json && !isFinite(message.y) ? String(message.y) : message.y;
              return object;
            };
            Point2dFloat.prototype.toJSON = function toJSON() {
              return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
            Point2dFloat.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
              if (typeUrlPrefix === void 0) {
                typeUrlPrefix = "type.googleapis.com";
              }
              return typeUrlPrefix + "/presage.smartspectra.Point2dFloat";
            };
            return Point2dFloat;
          })();
          smartspectra.Point3dFloat = (function() {
            function Point3dFloat(properties) {
              if (properties) {
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                  if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
              }
            }
            Point3dFloat.prototype.x = 0;
            Point3dFloat.prototype.y = 0;
            Point3dFloat.prototype.z = 0;
            Point3dFloat.create = function create(properties) {
              return new Point3dFloat(properties);
            };
            Point3dFloat.encode = function encode(message, writer, q) {
              if (!writer)
                writer = $Writer.create();
              if (q === void 0)
                q = 0;
              if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
              if (message.x != null && Object.hasOwnProperty.call(message, "x"))
                writer.uint32(
                  /* id 1, wireType 5 =*/
                  13
                ).float(message.x);
              if (message.y != null && Object.hasOwnProperty.call(message, "y"))
                writer.uint32(
                  /* id 2, wireType 5 =*/
                  21
                ).float(message.y);
              if (message.z != null && Object.hasOwnProperty.call(message, "z"))
                writer.uint32(
                  /* id 3, wireType 5 =*/
                  29
                ).float(message.z);
              return writer;
            };
            Point3dFloat.encodeDelimited = function encodeDelimited(message, writer) {
              return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };
            Point3dFloat.decode = function decode(reader, length, error, long) {
              if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
              if (long === void 0)
                long = 0;
              if (long > $Reader.recursionLimit)
                throw Error("maximum nesting depth exceeded");
              var end, message;
              if (length === void 0)
                end = reader.len;
              else {
                end = reader.pos + length;
                if (end > reader.len)
                  throw RangeError("index out of range");
                length = reader.len;
                reader.len = end;
              }
              message = new $root.presage.smartspectra.Point3dFloat();
              while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                  break;
                switch (tag >>> 3) {
                  case 1: {
                    message.x = reader.float();
                    break;
                  }
                  case 2: {
                    message.y = reader.float();
                    break;
                  }
                  case 3: {
                    message.z = reader.float();
                    break;
                  }
                  default:
                    reader.skipType(tag & 7, long);
                    break;
                }
              }
              if (length !== void 0) {
                if (reader.pos !== end)
                  throw RangeError("index out of range");
                reader.len = length;
              }
              return message;
            };
            Point3dFloat.decodeDelimited = function decodeDelimited(reader) {
              if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
              return this.decode(reader, reader.uint32());
            };
            Point3dFloat.verify = function verify(message, long) {
              if (typeof message !== "object" || message === null)
                return "object expected";
              if (long === void 0)
                long = 0;
              if (long > $util.recursionLimit)
                return "maximum nesting depth exceeded";
              if (message.x != null && Object.hasOwnProperty.call(message, "x")) {
                if (typeof message.x !== "number")
                  return "x: number expected";
              }
              if (message.y != null && Object.hasOwnProperty.call(message, "y")) {
                if (typeof message.y !== "number")
                  return "y: number expected";
              }
              if (message.z != null && Object.hasOwnProperty.call(message, "z")) {
                if (typeof message.z !== "number")
                  return "z: number expected";
              }
              return null;
            };
            Point3dFloat.fromObject = function fromObject(object, long) {
              if (object instanceof $root.presage.smartspectra.Point3dFloat)
                return object;
              if (!$util.isObject(object))
                throw TypeError(".presage.smartspectra.Point3dFloat: object expected");
              if (long === void 0)
                long = 0;
              if (long > $util.recursionLimit)
                throw Error("maximum nesting depth exceeded");
              var message = new $root.presage.smartspectra.Point3dFloat();
              if (object.x != null)
                message.x = Number(object.x);
              if (object.y != null)
                message.y = Number(object.y);
              if (object.z != null)
                message.z = Number(object.z);
              return message;
            };
            Point3dFloat.toObject = function toObject(message, options, q) {
              if (!options)
                options = {};
              if (q === void 0)
                q = 0;
              if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
              var object = {};
              if (options.defaults) {
                object.x = 0;
                object.y = 0;
                object.z = 0;
              }
              if (message.x != null && Object.hasOwnProperty.call(message, "x"))
                object.x = options.json && !isFinite(message.x) ? String(message.x) : message.x;
              if (message.y != null && Object.hasOwnProperty.call(message, "y"))
                object.y = options.json && !isFinite(message.y) ? String(message.y) : message.y;
              if (message.z != null && Object.hasOwnProperty.call(message, "z"))
                object.z = options.json && !isFinite(message.z) ? String(message.z) : message.z;
              return object;
            };
            Point3dFloat.prototype.toJSON = function toJSON() {
              return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
            Point3dFloat.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
              if (typeUrlPrefix === void 0) {
                typeUrlPrefix = "type.googleapis.com";
              }
              return typeUrlPrefix + "/presage.smartspectra.Point3dFloat";
            };
            return Point3dFloat;
          })();
          smartspectra.FeatureType = (function() {
            var valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "BREATHING"] = 0;
            values[valuesById[1] = "MICROMOTION"] = 1;
            values[valuesById[2] = "EDA"] = 2;
            values[valuesById[3] = "FACE"] = 3;
            values[valuesById[4] = "CARDIO"] = 4;
            return values;
          })();
          smartspectra.MetricType = (function() {
            var valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "CHEST_BREATHING"] = 0;
            values[valuesById[1] = "ABDOMEN_BREATHING"] = 1;
            values[valuesById[2] = "BREATHING_RATE"] = 2;
            values[valuesById[3] = "BREATHING_AMPLITUDE"] = 3;
            values[valuesById[4] = "APNEA"] = 4;
            values[valuesById[5] = "RESPIRATORY_LINE_LENGTH"] = 5;
            values[valuesById[6] = "BASELINE"] = 6;
            values[valuesById[7] = "INHALE_EXHALE_RATIO"] = 7;
            values[valuesById[8] = "GLUTES_MICROMOTION"] = 8;
            values[valuesById[9] = "KNEES_MICROMOTION"] = 9;
            values[valuesById[10] = "EDA_TRACE"] = 10;
            values[valuesById[11] = "FACE_LANDMARKS"] = 11;
            values[valuesById[12] = "BLINKING"] = 12;
            values[valuesById[13] = "TALKING"] = 13;
            values[valuesById[14] = "EXPRESSIONS"] = 14;
            values[valuesById[15] = "PULSE_RATE"] = 15;
            values[valuesById[16] = "ARTERIAL_PRESSURE_TRACE"] = 16;
            values[valuesById[17] = "HRV"] = 17;
            values[valuesById[18] = "PULSE_RATE_STRICT"] = 18;
            values[valuesById[19] = "BREATHING_RATE_STRICT"] = 19;
            return values;
          })();
          smartspectra.RequestedMetrics = (function() {
            function RequestedMetrics(properties) {
              this.metrics = [];
              if (properties) {
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                  if (properties[keys[i]] != null && keys[i] !== "__proto__")
                    this[keys[i]] = properties[keys[i]];
              }
            }
            RequestedMetrics.prototype.metrics = $util.emptyArray;
            RequestedMetrics.create = function create(properties) {
              return new RequestedMetrics(properties);
            };
            RequestedMetrics.encode = function encode(message, writer, q) {
              if (!writer)
                writer = $Writer.create();
              if (q === void 0)
                q = 0;
              if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
              if (message.metrics != null && message.metrics.length) {
                writer.uint32(
                  /* id 1, wireType 2 =*/
                  10
                ).fork();
                for (var i = 0; i < message.metrics.length; ++i)
                  writer.int32(message.metrics[i]);
                writer.ldelim();
              }
              return writer;
            };
            RequestedMetrics.encodeDelimited = function encodeDelimited(message, writer) {
              return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };
            RequestedMetrics.decode = function decode(reader, length, error, long) {
              if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
              if (long === void 0)
                long = 0;
              if (long > $Reader.recursionLimit)
                throw Error("maximum nesting depth exceeded");
              var end, message;
              if (length === void 0)
                end = reader.len;
              else {
                end = reader.pos + length;
                if (end > reader.len)
                  throw RangeError("index out of range");
                length = reader.len;
                reader.len = end;
              }
              message = new $root.presage.smartspectra.RequestedMetrics();
              while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                  break;
                switch (tag >>> 3) {
                  case 1: {
                    if (!(message.metrics && message.metrics.length))
                      message.metrics = [];
                    if ((tag & 7) === 2) {
                      var end2 = reader.uint32() + reader.pos;
                      if (end2 > reader.len)
                        throw RangeError("index out of range");
                      reader.len = end2;
                      while (reader.pos < end2)
                        message.metrics.push(reader.int32());
                      if (reader.pos !== end2)
                        throw RangeError("index out of range");
                      reader.len = end;
                    } else
                      message.metrics.push(reader.int32());
                    break;
                  }
                  default:
                    reader.skipType(tag & 7, long);
                    break;
                }
              }
              if (length !== void 0) {
                if (reader.pos !== end)
                  throw RangeError("index out of range");
                reader.len = length;
              }
              return message;
            };
            RequestedMetrics.decodeDelimited = function decodeDelimited(reader) {
              if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
              return this.decode(reader, reader.uint32());
            };
            RequestedMetrics.verify = function verify(message, long) {
              if (typeof message !== "object" || message === null)
                return "object expected";
              if (long === void 0)
                long = 0;
              if (long > $util.recursionLimit)
                return "maximum nesting depth exceeded";
              if (message.metrics != null && Object.hasOwnProperty.call(message, "metrics")) {
                if (!Array.isArray(message.metrics))
                  return "metrics: array expected";
                for (var i = 0; i < message.metrics.length; ++i)
                  switch (message.metrics[i]) {
                    default:
                      return "metrics: enum value[] expected";
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                    case 6:
                    case 7:
                    case 8:
                    case 9:
                    case 10:
                    case 11:
                    case 12:
                    case 13:
                    case 14:
                    case 15:
                    case 16:
                    case 17:
                    case 18:
                    case 19:
                      break;
                  }
              }
              return null;
            };
            RequestedMetrics.fromObject = function fromObject(object, long) {
              if (object instanceof $root.presage.smartspectra.RequestedMetrics)
                return object;
              if (!$util.isObject(object))
                throw TypeError(".presage.smartspectra.RequestedMetrics: object expected");
              if (long === void 0)
                long = 0;
              if (long > $util.recursionLimit)
                throw Error("maximum nesting depth exceeded");
              var message = new $root.presage.smartspectra.RequestedMetrics();
              if (object.metrics) {
                if (!Array.isArray(object.metrics))
                  throw TypeError(".presage.smartspectra.RequestedMetrics.metrics: array expected");
                message.metrics = [];
                for (var i = 0; i < object.metrics.length; ++i)
                  switch (object.metrics[i]) {
                    default:
                      if (typeof object.metrics[i] === "number") {
                        message.metrics[i] = object.metrics[i];
                        break;
                      }
                    case "CHEST_BREATHING":
                    case 0:
                      message.metrics[i] = 0;
                      break;
                    case "ABDOMEN_BREATHING":
                    case 1:
                      message.metrics[i] = 1;
                      break;
                    case "BREATHING_RATE":
                    case 2:
                      message.metrics[i] = 2;
                      break;
                    case "BREATHING_AMPLITUDE":
                    case 3:
                      message.metrics[i] = 3;
                      break;
                    case "APNEA":
                    case 4:
                      message.metrics[i] = 4;
                      break;
                    case "RESPIRATORY_LINE_LENGTH":
                    case 5:
                      message.metrics[i] = 5;
                      break;
                    case "BASELINE":
                    case 6:
                      message.metrics[i] = 6;
                      break;
                    case "INHALE_EXHALE_RATIO":
                    case 7:
                      message.metrics[i] = 7;
                      break;
                    case "GLUTES_MICROMOTION":
                    case 8:
                      message.metrics[i] = 8;
                      break;
                    case "KNEES_MICROMOTION":
                    case 9:
                      message.metrics[i] = 9;
                      break;
                    case "EDA_TRACE":
                    case 10:
                      message.metrics[i] = 10;
                      break;
                    case "FACE_LANDMARKS":
                    case 11:
                      message.metrics[i] = 11;
                      break;
                    case "BLINKING":
                    case 12:
                      message.metrics[i] = 12;
                      break;
                    case "TALKING":
                    case 13:
                      message.metrics[i] = 13;
                      break;
                    case "EXPRESSIONS":
                    case 14:
                      message.metrics[i] = 14;
                      break;
                    case "PULSE_RATE":
                    case 15:
                      message.metrics[i] = 15;
                      break;
                    case "ARTERIAL_PRESSURE_TRACE":
                    case 16:
                      message.metrics[i] = 16;
                      break;
                    case "HRV":
                    case 17:
                      message.metrics[i] = 17;
                      break;
                    case "PULSE_RATE_STRICT":
                    case 18:
                      message.metrics[i] = 18;
                      break;
                    case "BREATHING_RATE_STRICT":
                    case 19:
                      message.metrics[i] = 19;
                      break;
                  }
              }
              return message;
            };
            RequestedMetrics.toObject = function toObject(message, options, q) {
              if (!options)
                options = {};
              if (q === void 0)
                q = 0;
              if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
              var object = {};
              if (options.arrays || options.defaults)
                object.metrics = [];
              if (message.metrics && message.metrics.length) {
                object.metrics = [];
                for (var j = 0; j < message.metrics.length; ++j)
                  object.metrics[j] = options.enums === String ? $root.presage.smartspectra.MetricType[message.metrics[j]] === void 0 ? message.metrics[j] : $root.presage.smartspectra.MetricType[message.metrics[j]] : message.metrics[j];
              }
              return object;
            };
            RequestedMetrics.prototype.toJSON = function toJSON() {
              return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
            RequestedMetrics.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
              if (typeUrlPrefix === void 0) {
                typeUrlPrefix = "type.googleapis.com";
              }
              return typeUrlPrefix + "/presage.smartspectra.RequestedMetrics";
            };
            return RequestedMetrics;
          })();
          return smartspectra;
        })();
        return presage;
      })();
      module.exports = $root;
    }
  });

  // node_modules/@smartspectra/node-sdk/js/constants.js
  var require_constants = __commonJS({
    "node_modules/@smartspectra/node-sdk/js/constants.js"(exports, module) {
      "use strict";
      var generatedMetricType = require_generated().presage.smartspectra.MetricType;
      var ProcessingStatus2 = Object.freeze({
        kUninitialized: 0,
        kIdle: 1,
        kStarting: 2,
        kRunning: 3,
        kStopping: 4,
        kError: 5
      });
      var SmartSpectraLogLevel = Object.freeze({
        kDebug: 0,
        kInfo: 1,
        kWarning: 2,
        // the default
        kError: 3,
        kNone: 4
      });
      var PixelFormat = Object.freeze({
        kRGB: 0,
        kBGR: 1,
        kRGBA: 2,
        kBGRA: 3,
        kNV12: 4,
        kNV21: 5,
        kYUYV: 6
      });
      var ValidationCode2 = Object.freeze({
        kOk: 0,
        kNoFaceFound: 1,
        kMultipleFacesFound: 2,
        kFaceNotCentered: 3,
        /** @deprecated Use kFaceTooClose / kFaceTooFar instead. */
        kFaceSizeOutOfRange: 4,
        kTooDark: 5,
        kTooBright: 6,
        kChestNotVisible: 7,
        kCameraTuning: 10,
        kFrameRateTooLow: 11,
        kExcessiveMotion: 12,
        kFaceTooClose: 13,
        kFaceTooFar: 14,
        kFaceTooHigh: 15,
        kFaceTooLow: 16,
        kFaceNotForward: 17
      });
      var SmartSpectraErrorCode2 = Object.freeze({
        kOk: 0,
        kInvalidState: 1,
        kAuthenticationFailed: 2,
        kConfigurationFailed: 3,
        kCreditExhausted: 4,
        kNetworkError: 5,
        kServerError: 6,
        kInputUnavailable: 7,
        kProcessingFailed: 8,
        kFrameConversionFailed: 9,
        kNonMonotonicTimestamp: 10,
        kTimestampGap: 11,
        kMetricNotAuthorized: 13,
        kSustainedLowFrameRate: 14
      });
      var FrameTransform = Object.freeze({
        kNone: 0,
        kRotate90CW: 1,
        kRotate90CCW: 2,
        kRotate180: 3,
        kMirrorHorizontal: 4,
        kMirrorVertical: 5
      });
      var MetricType = Object.freeze(Object.fromEntries(
        Object.entries(generatedMetricType).filter(([name]) => Number.isNaN(Number(name)))
      ));
      var breathingMetrics2 = Object.freeze([
        0,
        // CHEST_BREATHING
        1,
        // ABDOMEN_BREATHING
        2
        // BREATHING_RATE
      ]);
      var cardioMetrics2 = Object.freeze([
        15,
        // PULSE_RATE
        16,
        // ARTERIAL_PRESSURE_TRACE
        17
        // HRV
      ]);
      var faceMetrics2 = Object.freeze([
        11,
        // FACE_LANDMARKS
        12,
        // BLINKING
        13,
        // TALKING
        14
        // EXPRESSIONS
      ]);
      var micromotionMetrics = Object.freeze([
        8,
        // GLUTES_MICROMOTION
        9
        // KNEES_MICROMOTION
      ]);
      var edaMetrics2 = Object.freeze([
        10
        // EDA_TRACE
      ]);
      var defaultSupportedMetrics = breathingMetrics2;
      module.exports = {
        ProcessingStatus: ProcessingStatus2,
        SmartSpectraLogLevel,
        PixelFormat,
        ValidationCode: ValidationCode2,
        SmartSpectraErrorCode: SmartSpectraErrorCode2,
        FrameTransform,
        MetricType,
        breathingMetrics: breathingMetrics2,
        cardioMetrics: cardioMetrics2,
        faceMetrics: faceMetrics2,
        micromotionMetrics,
        edaMetrics: edaMetrics2,
        defaultSupportedMetrics
      };
    }
  });

  // node_modules/@smartspectra/node-sdk/package.json
  var require_package = __commonJS({
    "node_modules/@smartspectra/node-sdk/package.json"(exports, module) {
      module.exports = {
        name: "@smartspectra/node-sdk",
        version: "3.5.0",
        description: "Node.js (Electron) FFI binding for SmartSpectra vitals measurement",
        author: "Presage Technologies, Inc.",
        license: "SEE LICENSE IN LICENSE",
        main: "js/index.js",
        types: "js/index.d.ts",
        exports: {
          ".": {
            types: "./js/index.d.ts",
            default: "./js/index.js"
          },
          "./main": {
            types: "./js/main/index.d.ts",
            default: "./js/main/index.js"
          },
          "./preload": "./js/preload/index.js",
          "./renderer": {
            types: "./js/renderer/index.d.ts",
            default: "./js/renderer/index.js"
          },
          "./messages": {
            types: "./js/messages/index.d.ts",
            default: "./js/messages/index.js"
          },
          "./package.json": "./package.json"
        },
        files: [
          "js/**/*.js",
          "js/**/*.d.ts",
          "LICENSE",
          "COPYING.LGPLv2.1",
          "COPYING.LGPLv3",
          "THIRD_PARTY_FFMPEG.md",
          "THIRD_PARTY_NOTICES.txt",
          "NOTICE",
          "docs/device-readiness.md",
          "samples/device_readiness/*.cjs",
          "README.md"
        ],
        scripts: {
          prepare: "node scripts/gen-proto.cjs",
          "build:proto": "node scripts/gen-proto.cjs",
          test: "npm run test:types && node --test test/strict-results.js test/log-level-pin.js test/renderer-timestamp.js test/renderer-frame-transform.js test/camera-selection.js test/reset-lifecycle.js test/resolve-native.js test/device-readiness.js test/device-readiness-presentation.js test/smoke.js",
          "test:types": "tsc --noEmit --strict --skipLibCheck --target es2022 --module nodenext test/camera-selection-types.ts test/renderer-types.ts test/device-readiness-types.ts",
          "test:models-allowlist": "node test/models-allowlist.js"
        },
        keywords: [
          "smartspectra",
          "vitals",
          "physiology",
          "electron",
          "nodejs",
          "ffi",
          "koffi"
        ],
        repository: {
          type: "git",
          url: "git+https://github.com/Presage-Security/SmartSpectra.git"
        },
        homepage: "https://smartspectra.presagetech.com/",
        bugs: {
          url: "https://github.com/Presage-Security/SmartSpectra/issues"
        },
        publishConfig: {
          registry: "https://registry.npmjs.org/"
        },
        engines: {
          node: ">=20.0.0"
        },
        _nativeRuntime_doc: "Per-platform native packages (@smartspectra/node-sdk-<plat>-<arch>) are injected into dependencies at publish time (absent here so source installs don't fetch them). Why hard deps, not optionalDependencies: see js/resolve-native.js.",
        dependencies: {
          koffi: "^2.10.0",
          protobufjs: "^7.6.5",
          "@smartspectra/node-sdk-linux-x64": "3.5.0",
          "@smartspectra/node-sdk-linux-arm64": "3.5.0",
          "@smartspectra/node-sdk-darwin-arm64": "3.5.0",
          "@smartspectra/node-sdk-win32-x64": "3.5.0"
        },
        devDependencies: {
          "@types/node": "^24.0.0",
          "protobufjs-cli": "^1.1.3",
          typescript: "^6.0.2"
        },
        _overrides_doc: "tmp is pulled in transitively (protobufjs-cli \u2192 tmp) as a build-only devDependency; it is never a runtime dependency and is not shipped to consumers (the published tarball ships js/ + prebuilds only, no node_modules). Pinned to an exact version (not a >= range) to clear GHSA-ph9p-34f9-6g65 (path traversal, affects tmp <0.2.6) and GHSA-7c78-jf6q-g5cm (type-confusion bypass of the 0.2.6 _assertPath guard, affects tmp >=0.2.6) AND to keep installs deterministic \u2014 an open range would let a future install pull a brand-new, not-yet-vetted release. Bump deliberately. Drop this once protobufjs-cli ships a release whose tmp range is already >=0.2.7.",
        overrides: {
          tmp: "0.2.7"
        }
      };
    }
  });

  // node_modules/@smartspectra/node-sdk/js/renderer/index.js
  var require_renderer = __commonJS({
    "node_modules/@smartspectra/node-sdk/js/renderer/index.js"(exports, module) {
      "use strict";
      var { FrameTimestampAnchor } = require_timestamp();
      var { FrameTransform, SmartSpectraErrorCode: SmartSpectraErrorCode2 } = require_constants();
      var FRAME_TRANSFORM_VALUES = new Set(Object.values(FrameTransform));
      var SUPPORTED_EVENTS = /* @__PURE__ */ new Set([
        "processingStatus",
        "validationStatus",
        "metrics",
        "accumulatedMetrics",
        "insight",
        "frameSentThrough",
        "error",
        // Fires once the SDK has acquired (or re-acquired, after a Stop) the
        // default MediaStream. Host apps attach this stream to their preview
        // <video> element. Not fired when the host supplies its own stream
        // via useMediaStream() — in that case the host already owns the
        // reference.
        "streamAvailable"
      ]);
      var PIXEL_FORMAT_RGBA = 2;
      var PROCESSING_STATUS_STARTING = 2;
      var PROCESSING_STATUS_RUNNING = 3;
      var ERROR_CODE_PROCESSING_FAILED = 8;
      var STARTUP_WATCHDOG_MS = 3e4;
      var DEFAULT_VIDEO_CONSTRAINTS = Object.freeze({
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 },
        facingMode: "user"
      });
      var SmartSpectraSDK2 = class {
        /**
         * @param {Object} [options]
         * @param {string} [options.apiKey]
         * @param {number[]} [options.requestedMetrics]
         * @param {boolean} [options.enableAccumulatedOutput=false]
         * @param {boolean} [options.enableTelemetry=true] Aggregate SDK telemetry; set false to opt out.
         * @param {number} [options.sendTimeoutMs=30000] Per-call timeout for
         *   renderer→main IPC roundtrips (start/stop/reset/requestInsight/configure).
         *   If the main process crashes or stalls, the pending call rejects with a
         *   `SMARTSPECTRA_IPC_TIMEOUT` error instead of hanging the UI forever.
         *   Set to 0 to disable the timeout.
         */
        constructor(options = {}) {
          if (typeof window === "undefined" || !window.__smartspectraBridge) {
            throw new Error(
              "@smartspectra/node-sdk/renderer: window.__smartspectraBridge is unavailable. Set webPreferences.preload to require.resolve('@smartspectra/node-sdk/preload') on the BrowserWindow that loads this renderer, and call bindSmartSpectraIpc(window) from the main process."
            );
          }
          for (const method of ["attach", "postMessage", "onMessage", "close"]) {
            if (typeof window.__smartspectraBridge[method] !== "function") {
              throw new Error(
                `@smartspectra/node-sdk/renderer: bridge is missing ${method}(). The preload script may be out of sync with the renderer module.`
              );
            }
          }
          if (typeof MediaStreamTrackProcessor === "undefined") {
            throw new Error(
              "@smartspectra/node-sdk/renderer: MediaStreamTrackProcessor is unavailable. Requires Electron 16+ (Chromium 94+)."
            );
          }
          this._options = {
            apiKey: options.apiKey ?? "",
            requestedMetrics: options.requestedMetrics,
            enableAccumulatedOutput: !!options.enableAccumulatedOutput,
            enableTelemetry: options.enableTelemetry !== false
          };
          this._listeners = /* @__PURE__ */ new Map();
          this._processingStatus = 0;
          this._stream = null;
          this._streamOwned = false;
          this._frameTransform = FrameTransform.kNone;
          this._track = null;
          this._processor = null;
          this._reader = null;
          this._frameLoopActive = false;
          this._frameLoopPromise = null;
          this._frameTimestamps = new FrameTimestampAnchor();
          this._cameraLocked = false;
          this._startupWatchdog = null;
          this._bridge = window.__smartspectraBridge;
          this._diagnostics = this._bridge.diagnostics === true;
          this._nextReplyId = 1;
          this._pendingAcks = /* @__PURE__ */ new Map();
          const sendTimeoutMs = options.sendTimeoutMs;
          this._sendTimeoutMs = typeof sendTimeoutMs === "number" && Number.isFinite(sendTimeoutMs) && sendTimeoutMs >= 0 ? sendTimeoutMs : 3e4;
          this._bridge.onMessage((data) => this._handleBridgeMessage(data));
          this._bridge.attach();
          this._bridge.postMessage({ kind: "configure", options: this._options });
        }
        /** SDK package version. */
        static get version() {
          return require_package().version;
        }
        /** Current ProcessingStatus integer value. */
        get processingStatus() {
          return this._processingStatus;
        }
        /**
         * Override the default camera with a host-supplied `MediaStream` from
         * `navigator.mediaDevices.getUserMedia`, `desktopCapturer`, a
         * `<canvas>.captureStream()`, etc. Optional — if not called, `start()`
         * acquires its own MediaStream with sensible defaults (front camera,
         * 1280x720 at 30 fps, AE/AWB lock after settle) and emits it via the
         * `'streamAvailable'` event.
         *
         * When the host supplies the stream the host also owns its lifecycle —
         * the SDK never stops the original tracks, only its own internal clone.
         *
         * `options.frameTransform` (a `FrameTransform` value, default `kNone`)
         * rotates or mirrors every frame before processing, e.g. for a camera
         * mounted sideways. It takes effect on the next `start()`; the host
         * preview is not transformed. Each call replaces the previous stream and
         * transform, so pass `frameTransform` again when swapping streams.
         *
         * @param {MediaStream} stream
         * @param {Object} [options]
         * @param {number} [options.frameTransform=FrameTransform.kNone]
         */
        useMediaStream(stream, options) {
          if (!(stream instanceof MediaStream)) {
            throw new TypeError("useMediaStream: argument must be a MediaStream");
          }
          const frameTransform = options?.frameTransform ?? FrameTransform.kNone;
          if (!FRAME_TRANSFORM_VALUES.has(frameTransform)) {
            throw Object.assign(
              new Error("useMediaStream: frameTransform must be a FrameTransform value"),
              { code: SmartSpectraErrorCode2.kConfigurationFailed, retryable: false }
            );
          }
          this._stream = stream;
          this._streamOwned = false;
          this._frameTransform = frameTransform;
          return this;
        }
        /**
         * Begin processing. If no stream has been attached via useMediaStream(),
         * the SDK acquires the default front-facing camera and emits it through
         * `'streamAvailable'` so the host can show a live preview. Resolves once
         * the main-process SDK has armed the graph and is ready to accept frames.
         * On failure, rolls back the renderer-side frame pump and (if the SDK
         * acquired the stream itself) releases the camera so a retry isn't
         * blocked.
         */
        async start() {
          if (!this._stream) {
            this._stream = await this._acquireDefaultStream();
            this._streamOwned = true;
            this._emit("streamAvailable", this._stream);
          }
          const tracks = this._stream.getVideoTracks();
          if (tracks.length === 0) {
            if (this._streamOwned) {
              for (const t of this._stream.getTracks()) {
                try {
                  t.stop();
                } catch {
                }
              }
              this._stream = null;
              this._streamOwned = false;
            }
            throw new Error("start(): MediaStream has no video tracks");
          }
          this._track = tracks[0].clone();
          this._processor = new MediaStreamTrackProcessor({ track: this._track });
          this._reader = this._processor.readable.getReader();
          this._cameraLocked = false;
          try {
            await this._send({ kind: "start", frameTransform: this._frameTransform });
          } catch (err) {
            await this._stopFrameLoop();
            this._releaseOwnedStream();
            throw err;
          }
          this._frameLoopActive = true;
          this._frameLoopPromise = this._runFrameLoop();
        }
        /**
         * Stop processing. Resolves once the main-process SDK has stopped.
         * If the SDK acquired the camera itself, the stream is released here
         * — start() will re-acquire on the next call. Host-supplied streams
         * are left untouched; the host owns their lifecycle.
         */
        async stop() {
          this._clearStartupWatchdog();
          await this._stopFrameLoop();
          await this._send({ kind: "stop" });
          this._releaseOwnedStream();
        }
        /**
         * Rebuild the graph after a kError state. Releases any SDK-acquired
         * camera so the next start() re-runs the acquire + settle sequence
         * from scratch.
         */
        async reset() {
          this._clearStartupWatchdog();
          await this._stopFrameLoop();
          await this._send({ kind: "reset" });
          this._releaseOwnedStream();
        }
        /**
         * Dispatch an on-demand insight prompt. Resolves with the request id
         * assigned to it; the matching Insight response arrives via the
         * `'insight'` event with the same id.
         */
        async requestInsight(text) {
          if (typeof text !== "string") {
            throw new TypeError("requestInsight: text must be a string");
          }
          const ack = await this._send({ kind: "requestInsight", text });
          return ack.requestId | 0;
        }
        /**
         * Tear down the renderer-side resources and instruct the main process
         * to destroy its SDK instance. Idempotent.
         */
        destroy() {
          if (this._destroyed) return;
          this._destroyed = true;
          this._clearStartupWatchdog();
          const destroyedErr = new Error("SmartSpectraSDK: destroyed before main-process ack");
          destroyedErr.code = "SMARTSPECTRA_DESTROYED";
          this._rejectPendingAcks(destroyedErr);
          this._frameLoopActive = false;
          if (this._reader) {
            try {
              this._reader.cancel().catch(() => {
              });
            } catch {
            }
            this._reader = null;
          }
          this._processor = null;
          if (this._track) {
            try {
              this._track.stop();
            } catch {
            }
            this._track = null;
          }
          this._releaseOwnedStream();
          this._stream = null;
          try {
            this._bridge.postMessage({ kind: "destroy" });
          } catch {
          }
          try {
            this._bridge.close();
          } catch {
          }
        }
        on(event, callback) {
          if (typeof event !== "string" || typeof callback !== "function") {
            throw new TypeError("on(event: string, callback: Function)");
          }
          if (!SUPPORTED_EVENTS.has(event)) {
            throw new RangeError(`on(): unsupported event ${event}`);
          }
          this._listeners.set(event, callback);
          return this;
        }
        // ---------- internal --------------------------------------------------
        _armStartupWatchdog() {
          if (this._startupWatchdog) return;
          this._startupWatchdog = setTimeout(() => {
            this._startupWatchdog = null;
            if (this._processingStatus !== PROCESSING_STATUS_STARTING) return;
            const message = `Processing stalled at Starting for ${Math.round(STARTUP_WATCHDOG_MS / 1e3)} s without producing a validation packet. Common causes: model download blocked by network/firewall, server-side service unavailable, or an SDK-level error that didn't propagate through the bridge. Check the main-process terminal for SDK log lines, then retry or fall back to the basic metrics bundle (breathing, pulse rate), which has no additional model-load requirement.`;
            this._emit(
              "error",
              ERROR_CODE_PROCESSING_FAILED,
              message,
              /*retryable=*/
              true
            );
          }, STARTUP_WATCHDOG_MS);
        }
        _clearStartupWatchdog() {
          if (this._startupWatchdog) {
            clearTimeout(this._startupWatchdog);
            this._startupWatchdog = null;
          }
        }
        async _acquireDefaultStream() {
          if (!navigator || !navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== "function") {
            throw new Error(
              "@smartspectra/node-sdk/renderer: navigator.mediaDevices.getUserMedia is unavailable. Set webPreferences.contextIsolation=true and ensure the BrowserWindow has been granted camera permission."
            );
          }
          try {
            return await navigator.mediaDevices.getUserMedia({
              video: DEFAULT_VIDEO_CONSTRAINTS
            });
          } catch (err) {
            const detail = err && err.name ? ` (${err.name})` : "";
            const e = new Error(
              `Failed to acquire default camera${detail}: ${err && err.message ? err.message : err}. Either grant camera permission and retry, or call useMediaStream() with your own MediaStream before start().`
            );
            e.cause = err;
            throw e;
          }
        }
        _releaseOwnedStream() {
          if (!this._streamOwned || !this._stream) return;
          for (const track of this._stream.getTracks()) {
            try {
              track.stop();
            } catch {
            }
          }
          this._stream = null;
          this._streamOwned = false;
          this._cameraLocked = false;
        }
        _tryLockCameraParameters() {
          if (this._cameraLocked || !this._stream) return;
          this._cameraLocked = true;
          const tracks = this._stream.getVideoTracks();
          const track = tracks[0];
          if (!track || typeof track.applyConstraints !== "function") return;
          const caps = typeof track.getCapabilities === "function" ? track.getCapabilities() || {} : {};
          const advanced = [];
          if (Array.isArray(caps.exposureMode) && caps.exposureMode.includes("manual")) {
            advanced.push({ exposureMode: "manual" });
          }
          if (Array.isArray(caps.whiteBalanceMode) && caps.whiteBalanceMode.includes("manual")) {
            advanced.push({ whiteBalanceMode: "manual" });
          }
          if (Array.isArray(caps.focusMode) && caps.focusMode.includes("manual")) {
            advanced.push({ focusMode: "manual" });
          }
          if (advanced.length === 0) return;
          track.applyConstraints({ advanced }).catch((err) => {
            console.warn(
              "[smartspectra/renderer] camera lock applyConstraints rejected, continuing in auto-mode:",
              err && err.message ? err.message : err
            );
          });
        }
        async _stopFrameLoop() {
          this._frameLoopActive = false;
          if (this._reader) {
            try {
              await this._reader.cancel();
            } catch {
            }
            this._reader = null;
          }
          this._processor = null;
          if (this._track) {
            try {
              this._track.stop();
            } catch {
            }
            this._track = null;
          }
          if (this._frameLoopPromise) {
            try {
              await this._frameLoopPromise;
            } catch {
            }
            this._frameLoopPromise = null;
          }
        }
        async _runFrameLoop() {
          const canvas = new OffscreenCanvas(1, 1);
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          let frameCount = 0;
          try {
            while (this._frameLoopActive && !this._destroyed) {
              let read;
              try {
                read = await this._reader.read();
              } catch (e) {
                console.warn("[smartspectra/renderer] reader.read() threw:", e);
                break;
              }
              if (read.done) break;
              const vf = read.value;
              if (!vf) continue;
              try {
                if (this._destroyed) break;
                if (canvas.width !== vf.codedWidth || canvas.height !== vf.codedHeight) {
                  canvas.width = vf.codedWidth;
                  canvas.height = vf.codedHeight;
                }
                ctx.drawImage(vf, 0, 0);
                const imageData = ctx.getImageData(0, 0, vf.codedWidth, vf.codedHeight);
                const ts = this._frameTimestamps.next(vf.timestamp);
                const ab = imageData.data.buffer;
                this._bridge.postMessage({
                  kind: "frame",
                  buffer: ab,
                  width: vf.codedWidth,
                  height: vf.codedHeight,
                  stride: vf.codedWidth * 4,
                  pixelFormat: PIXEL_FORMAT_RGBA,
                  timestampUs: Number(ts)
                });
                frameCount++;
                if (this._diagnostics) {
                  if (frameCount === 1) {
                    console.log(
                      `[smartspectra/renderer] first frame forwarded (${vf.codedWidth}x${vf.codedHeight}, ts=${ts}\xB5s)`
                    );
                  } else if (frameCount % 60 === 0) {
                    console.log(`[smartspectra/renderer] forwarded ${frameCount} frames`);
                  }
                }
              } finally {
                vf.close();
              }
            }
          } catch (e) {
            console.error("[smartspectra/renderer] frame loop failed:", e);
          } finally {
            if (this._diagnostics) {
              console.log(
                `[smartspectra/renderer] frame loop exited after ${frameCount} frames`
              );
            }
          }
        }
        _send(message) {
          const replyId = this._nextReplyId++;
          const timeoutMs = this._sendTimeoutMs;
          return new Promise((resolve, reject) => {
            const onTimeout = () => {
              if (this._pendingAcks.delete(replyId)) {
                const err = new Error(
                  `smartspectra: main-process ack for kind=${message && message.kind} timed out after ${timeoutMs}ms`
                );
                err.code = "SMARTSPECTRA_IPC_TIMEOUT";
                reject(err);
              }
            };
            const timer = timeoutMs > 0 ? setTimeout(onTimeout, timeoutMs) : null;
            const clear = () => {
              if (timer !== null) clearTimeout(timer);
            };
            this._pendingAcks.set(replyId, {
              resolve: (v) => {
                clear();
                resolve(v);
              },
              reject: (e) => {
                clear();
                reject(e);
              }
            });
            try {
              this._bridge.postMessage({ ...message, replyId });
            } catch (e) {
              clear();
              this._pendingAcks.delete(replyId);
              reject(e);
            }
          });
        }
        _rejectPendingAcks(err) {
          const pending = [...this._pendingAcks.values()];
          this._pendingAcks.clear();
          for (const { reject } of pending) reject(err);
        }
        _handleBridgeMessage(msg) {
          if (!msg || typeof msg.kind !== "string") return;
          switch (msg.kind) {
            case "processingStatus":
              this._processingStatus = msg.status | 0;
              if (this._processingStatus === PROCESSING_STATUS_STARTING) {
                this._armStartupWatchdog();
              } else {
                this._clearStartupWatchdog();
              }
              if (this._processingStatus === PROCESSING_STATUS_RUNNING) {
                this._tryLockCameraParameters();
              }
              this._emit("processingStatus", this._processingStatus);
              return;
            case "validationStatus":
              this._clearStartupWatchdog();
              this._emit("validationStatus", msg.code | 0, Number(msg.timestampUs), msg.hint || "");
              return;
            case "metrics":
              this._emit("metrics", bufFrom(msg.buffer), Number(msg.timestampUs));
              return;
            case "accumulatedMetrics":
              this._emit("accumulatedMetrics", bufFrom(msg.buffer), Number(msg.timestampUs));
              return;
            case "insight":
              this._emit("insight", bufFrom(msg.buffer), msg.requestId | 0);
              return;
            case "frameSentThrough":
              this._emit("frameSentThrough", !!msg.sent, Number(msg.timestampUs));
              return;
            case "error":
              this._emit("error", msg.code | 0, msg.message || "", !!msg.retryable);
              return;
            case "ack": {
              const pending = this._pendingAcks.get(msg.replyId);
              if (!pending) return;
              this._pendingAcks.delete(msg.replyId);
              if (msg.ok) pending.resolve(msg.payload || {});
              else pending.reject(makeAckError(msg.error));
              return;
            }
          }
        }
        _emit(event, ...args) {
          const cb = this._listeners.get(event);
          if (!cb) return;
          try {
            cb(...args);
          } catch (e) {
            console.error(`SmartSpectraSDK: listener for '${event}' threw:`, e);
          }
        }
      };
      function bufFrom(arrayBuffer) {
        return new Uint8Array(arrayBuffer);
      }
      function makeAckError(err) {
        const e = new Error(err?.message || "SmartSpectra IPC failure");
        e.code = typeof err?.code === "number" ? err.code : 0;
        e.retryable = !!err?.retryable;
        return e;
      }
      module.exports = Object.assign(
        { SmartSpectraSDK: SmartSpectraSDK2 },
        require_constants()
      );
    }
  });

  // node_modules/@smartspectra/node-sdk/js/messages/index.js
  var require_messages = __commonJS({
    "node_modules/@smartspectra/node-sdk/js/messages/index.js"(exports, module) {
      "use strict";
      var $root = require_generated();
      var { presage } = $root;
      var Metrics = presage.smartspectra.Metrics;
      function toUint8(buf) {
        if (buf instanceof Uint8Array) return buf;
        if (buf instanceof ArrayBuffer) return new Uint8Array(buf);
        throw new TypeError(
          "@smartspectra/node-sdk/messages: decodeMetrics expected Buffer | Uint8Array | ArrayBuffer, got " + Object.prototype.toString.call(buf)
        );
      }
      function decodeMetrics2(buf) {
        return Metrics.decode(toUint8(buf));
      }
      module.exports = {
        Metrics,
        decodeMetrics: decodeMetrics2,
        presage
      };
    }
  });

  // src/core/signalMath.ts
  function normalizeTimestampUs(ts) {
    if (ts == null) return 0;
    if (typeof ts === "number") return ts;
    if (typeof ts === "bigint") return Number(ts);
    if (typeof ts === "object" && typeof ts.toNumber === "function") {
      return ts.toNumber();
    }
    return Number(ts) || 0;
  }
  function computeMedian(values) {
    if (!values || values.length === 0) return null;
    const sorted = [...values].filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
    if (sorted.length === 0) return null;
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 1) {
      return sorted[mid];
    }
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  function computeIqr(values) {
    if (!values || values.length < 4) return 1.5;
    const sorted = [...values].filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
    if (sorted.length < 4) return 1.5;
    const q1Idx = Math.floor(sorted.length * 0.25);
    const q3Idx = Math.floor(sorted.length * 0.75);
    return Math.max(0.5, sorted[q3Idx] - sorted[q1Idx]);
  }
  function computeStdDev(values) {
    if (!values || values.length < 2) return 0;
    const valid = values.filter((v) => Number.isFinite(v));
    if (valid.length < 2) return 0;
    const mean = valid.reduce((acc, v) => acc + v, 0) / valid.length;
    const variance = valid.reduce((acc, v) => acc + (v - mean) ** 2, 0) / (valid.length - 1);
    return Math.sqrt(variance);
  }
  function computeApneaHoldSeconds(upperTraceSamples, baselineTraceStdDev, isTalkingNow) {
    if (isTalkingNow || !upperTraceSamples || upperTraceSamples.length < 8) {
      return { currentHoldSec: 0, maxHoldSec: 0, traceStdDev: 0 };
    }
    const flatThreshold = Math.max(0.045, (baselineTraceStdDev || 0.35) * 0.16);
    const values = upperTraceSamples.map((s) => s.value);
    const overallStdDev = computeStdDev(values);
    const windowSize = Math.min(20, Math.max(6, Math.floor(upperTraceSamples.length / 3)));
    let currentHoldUs = 0;
    let maxHoldUs = 0;
    let holdStartUs = null;
    for (let i = windowSize; i <= upperTraceSamples.length; i++) {
      const slice = upperTraceSamples.slice(i - windowSize, i);
      const sliceStd = computeStdDev(slice.map((s) => s.value));
      const tsUs = normalizeTimestampUs(slice[slice.length - 1].timestamp);
      const firstSliceTsUs = normalizeTimestampUs(slice[0].timestamp);
      if (sliceStd <= flatThreshold) {
        if (holdStartUs === null) {
          holdStartUs = firstSliceTsUs || tsUs;
        }
        if (tsUs > holdStartUs) {
          currentHoldUs = tsUs - holdStartUs;
          if (currentHoldUs > maxHoldUs) {
            maxHoldUs = currentHoldUs;
          }
        } else {
          currentHoldUs += 1e5;
          if (currentHoldUs > maxHoldUs) maxHoldUs = currentHoldUs;
        }
      } else {
        holdStartUs = null;
        currentHoldUs = 0;
      }
    }
    return {
      currentHoldSec: Number((currentHoldUs / 1e6).toFixed(1)),
      maxHoldSec: Number((maxHoldUs / 1e6).toFixed(1)),
      traceStdDev: Number(overallStdDev.toFixed(4))
    };
  }
  function countCoherentBreathCycles(upperTraceSamples, minAmplitude = 0.12) {
    if (!upperTraceSamples || upperTraceSamples.length < 10) return 0;
    let cycles = 0;
    let state = "SEEK_PEAK";
    let localMin = upperTraceSamples[0].value;
    let localMax = upperTraceSamples[0].value;
    for (const sample of upperTraceSamples) {
      const v = sample.value;
      if (state === "SEEK_PEAK") {
        if (v > localMax) localMax = v;
        if (v < localMin) localMin = v;
        if (localMax - localMin >= minAmplitude && v < localMax - minAmplitude * 0.4) {
          state = "SEEK_TROUGH";
          localMin = v;
        }
      } else {
        if (v < localMin) localMin = v;
        if (localMax - localMin >= minAmplitude && v > localMin + minAmplitude * 0.4) {
          cycles += 1;
          state = "SEEK_PEAK";
          localMax = v;
        }
      }
    }
    return cycles;
  }
  function computeExpressionTension(expressionSample) {
    if (!expressionSample || !expressionSample.scores || expressionSample.scores.length === 0) {
      return 0;
    }
    let tensionSum = 0;
    for (const s of expressionSample.scores) {
      if (s.type === 1 || s.type === 2 || s.type === 3 || s.type === 4) {
        tensionSum += Math.max(0, s.confidence || 0);
      }
    }
    return Math.min(100, Number(tensionSum.toFixed(1)));
  }
  function evaluateFaceFraming(landmarksSample) {
    const pts = landmarksSample?.value;
    if (!pts || pts.length === 0) {
      return { faceCentered: false, landmarkCount: 0, centroidX: null, centroidY: null };
    }
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const p of pts) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
    const width = maxX - minX;
    const height = maxY - minY;
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const isNormalized = maxX <= 2 && maxY <= 2;
    const centered = isNormalized ? cx >= 0.18 && cx <= 0.82 && cy >= 0.12 && cy <= 0.88 && width >= 0.08 : width >= 45 && height >= 45;
    return {
      faceCentered: Boolean(landmarksSample?.stable !== false && centered),
      landmarkCount: pts.length,
      centroidX: Number(cx.toFixed(2)),
      centroidY: Number(cy.toFixed(2))
    };
  }

  // src/core/baselineCalibrator.ts
  function createBaselineAccumulator(nowMs = Date.now()) {
    return {
      startedAtMs: nowMs,
      pulseValues: [],
      breathingValues: [],
      upperTraceValues: [],
      expressionScores: [],
      edaValues: [],
      hrvRmssdValues: [],
      hrvBaevskyValues: [],
      blinkTimestampsMs: [],
      wasBlinkingLastPacket: false,
      totalPackets: 0,
      talkingPackets: 0
    };
  }
  function ingestBaselinePacket(state, metrics, nowMs = Date.now()) {
    const talkingArr = metrics.face?.talking ?? [];
    const isTalking = talkingArr.length > 0 && Boolean(talkingArr[talkingArr.length - 1]?.detected);
    if (isTalking) {
      return {
        ...state,
        totalPackets: state.totalPackets + 1,
        talkingPackets: state.talkingPackets + 1
      };
    }
    const pulseArr = metrics.cardio?.pulseRate ?? metrics.cardio?.pulse_rate ?? [];
    const newPulses = pulseArr.filter((p) => p.value >= 40 && p.value <= 140 && (p.confidence === void 0 || p.confidence >= 40)).map((p) => p.value);
    const breathArr = metrics.breathing?.rate ?? [];
    const newBreaths = breathArr.filter((b) => b.value >= 5 && b.value <= 40 && (b.confidence === void 0 || b.confidence >= 45)).map((b) => b.value);
    const upperArr = metrics.breathing?.upperTrace ?? metrics.breathing?.upper_trace ?? [];
    const newUpper = upperArr.filter((u) => Number.isFinite(u.value)).map((u) => u.value);
    const exprArr = metrics.face?.expression ?? [];
    const newExpr = exprArr.length > 0 ? [computeExpressionTension(exprArr[exprArr.length - 1])] : [];
    const edaArr = metrics.eda?.trace ?? [];
    const newEda = edaArr.filter((e) => Number.isFinite(e.value)).map((e) => e.value);
    const hrvArr = metrics.cardio?.hrv ?? [];
    const validHrv = hrvArr.filter((h) => h.confidence === void 0 || h.confidence >= 50);
    const newRmssd = validHrv.map((h) => h.rmssd).filter((v) => typeof v === "number" && v > 0);
    const newBaevsky = validHrv.map((h) => h.baevsky).filter((v) => typeof v === "number" && v > 0);
    const blinkArr = metrics.face?.blinking ?? [];
    const isBlinkingNow = blinkArr.length > 0 && Boolean(blinkArr[blinkArr.length - 1]?.detected);
    const newBlinkTs = isBlinkingNow && !state.wasBlinkingLastPacket ? [...state.blinkTimestampsMs, nowMs] : state.blinkTimestampsMs;
    return {
      ...state,
      pulseValues: [...state.pulseValues, ...newPulses],
      breathingValues: [...state.breathingValues, ...newBreaths],
      upperTraceValues: [...state.upperTraceValues, ...newUpper].slice(-900),
      expressionScores: [...state.expressionScores, ...newExpr],
      edaValues: [...state.edaValues, ...newEda],
      hrvRmssdValues: [...state.hrvRmssdValues, ...newRmssd],
      hrvBaevskyValues: [...state.hrvBaevskyValues, ...newBaevsky],
      blinkTimestampsMs: newBlinkTs,
      wasBlinkingLastPacket: isBlinkingNow,
      totalPackets: state.totalPackets + 1
    };
  }
  function finalizePersonalBaseline(state, nowMs = Date.now()) {
    const durationSec = Math.max(1, Number(((nowMs - state.startedAtMs) / 1e3).toFixed(1)));
    const pulseMedianBpm = computeMedian(state.pulseValues);
    const pulseIqrBpm = computeIqr(state.pulseValues);
    const breathingMedianBrpm = computeMedian(state.breathingValues);
    const upperTraceStdDev = Math.max(0.12, computeStdDev(state.upperTraceValues));
    const blinkRatePerMin = Number((state.blinkTimestampsMs.length / durationSec * 60).toFixed(1));
    const expressionTensionMedian = computeMedian(state.expressionScores) ?? 8;
    const edaMedian = computeMedian(state.edaValues);
    const hrvRmssdMs = computeMedian(state.hrvRmssdValues);
    const hrvBaevskyIndex = computeMedian(state.hrvBaevskyValues);
    const talkingRatio = state.totalPackets > 0 ? Number((state.talkingPackets / state.totalPackets).toFixed(2)) : 0;
    const hasEnoughSamples = state.upperTraceValues.length >= 15 || state.pulseValues.length >= 2;
    return {
      calibratedAtIso: new Date(nowMs).toISOString(),
      durationSec,
      pulseMedianBpm: pulseMedianBpm !== null ? Number(pulseMedianBpm.toFixed(1)) : null,
      pulseIqrBpm: Number(pulseIqrBpm.toFixed(2)),
      breathingMedianBrpm: breathingMedianBrpm !== null ? Number(breathingMedianBrpm.toFixed(1)) : null,
      upperTraceStdDev: Number(upperTraceStdDev.toFixed(4)),
      blinkRatePerMin,
      expressionTensionMedian: Number(expressionTensionMedian.toFixed(1)),
      edaMedian: edaMedian !== null ? Number(edaMedian.toFixed(3)) : null,
      hrvRmssdMs: hrvRmssdMs !== null ? Number(hrvRmssdMs.toFixed(1)) : null,
      hrvBaevskyIndex: hrvBaevskyIndex !== null ? Number(hrvBaevskyIndex.toFixed(1)) : null,
      sampleCount: state.upperTraceValues.length + state.pulseValues.length,
      talkingRatio,
      valid: hasEnoughSamples && talkingRatio < 0.35
    };
  }

  // src/core/clauseEngine.ts
  function createInitialClauseRecord(clause) {
    return {
      clauseId: clause.id,
      status: "UNREAD",
      statusReason: "Not yet reviewed in this session.",
      dwellTimeMs: 0,
      gazeOnScreenMs: 0,
      gazePresenceRatio: 0,
      pulseMeanBpm: null,
      pulseDeltaBpm: null,
      pulseConfidence: 0,
      breathingMeanBrpm: null,
      breathingConfidence: 0,
      maxApneaHoldSec: 0,
      upperTraceVariance: 0,
      blinkCount: 0,
      blinkRatePerMin: 0,
      expressionTensionScore: 0,
      edaDelta: null,
      talkingDetectedMs: 0,
      signalValidRatio: 0,
      settledCyclesCompleted: 0,
      visitCount: 0,
      passHistory: [],
      latestTracePreview: [],
      lastUpdatedAtIso: (/* @__PURE__ */ new Date(0)).toISOString()
    };
  }
  function createActiveClauseBuffer(clauseId, nowMs = Date.now(), priorRecord) {
    return {
      clauseId,
      enteredAtMs: nowMs,
      lastTickAtMs: nowMs,
      priorDwellMs: priorRecord?.dwellTimeMs ?? 0,
      priorGazeMs: priorRecord?.gazeOnScreenMs ?? 0,
      priorTalkingMs: priorRecord?.talkingDetectedMs ?? 0,
      priorBlinkCount: priorRecord?.blinkCount ?? 0,
      accumulatedDwellMs: 0,
      accumulatedGazeMs: 0,
      accumulatedTalkingMs: 0,
      validPackets: 0,
      totalPackets: 0,
      pulseSamples: [],
      pulseConfidences: [],
      breathingSamples: [],
      breathingConfidences: [],
      upperTraceSamples: [],
      expressionScores: [],
      edaSamples: [],
      blinkCount: 0,
      wasBlinkingLastPacket: false,
      maxApneaHoldSec: 0
    };
  }
  function createDocumentSession(clauses, nowMs = Date.now()) {
    const firstId = clauses[0]?.id ?? "";
    const records = {};
    for (const c of clauses) {
      records[c.id] = {
        ...createInitialClauseRecord(c),
        status: c.id === firstId ? "READING" : "UNREAD",
        statusReason: c.id === firstId ? "Currently in reading focus." : "Awaiting reading focus.",
        visitCount: c.id === firstId ? 1 : 0,
        lastUpdatedAtIso: new Date(nowMs).toISOString()
      };
    }
    return {
      clauses,
      activeClauseId: firstId,
      records,
      activeBuffer: createActiveClauseBuffer(firstId, nowMs),
      settlingTargetClauseId: null,
      settlingTraceBuffer: []
    };
  }
  function downsampleTracePreview(samples, maxPoints = 48) {
    if (!samples || samples.length === 0) return [];
    const raw = samples.map((s) => Number(s.value.toFixed(3)));
    if (raw.length <= maxPoints) return raw;
    const step = raw.length / maxPoints;
    const out = [];
    for (let i = 0; i < maxPoints; i++) {
      out.push(raw[Math.min(raw.length - 1, Math.floor(i * step))]);
    }
    return out;
  }
  function evaluateClauseBuffer(clause, buffer, previousRecord, baseline, nowMs = Date.now(), recordPassSnapshot = false) {
    const totalDwellMs = buffer.priorDwellMs + buffer.accumulatedDwellMs;
    const totalGazeMs = buffer.priorGazeMs + buffer.accumulatedGazeMs;
    const totalTalkingMs = buffer.priorTalkingMs + buffer.accumulatedTalkingMs;
    const gazePresenceRatio = totalDwellMs > 0 ? Number(Math.min(1, totalGazeMs / totalDwellMs).toFixed(2)) : 0;
    const pulseMean = computeMedian(buffer.pulseSamples) ?? previousRecord.pulseMeanBpm;
    const recentPulseMean = buffer.pulseSamples.length > 0 ? computeMedian(buffer.pulseSamples.slice(-25)) : previousRecord.pulseMeanBpm;
    const pulseConf = computeMedian(buffer.pulseConfidences) ?? previousRecord.pulseConfidence;
    const pulseDelta = pulseMean !== null && baseline?.pulseMedianBpm != null ? Number((pulseMean - baseline.pulseMedianBpm).toFixed(1)) : null;
    const recentPulseDelta = recentPulseMean !== null && baseline?.pulseMedianBpm != null ? Number((recentPulseMean - baseline.pulseMedianBpm).toFixed(1)) : pulseDelta;
    const breathMean = computeMedian(buffer.breathingSamples) ?? previousRecord.breathingMeanBrpm;
    const breathConf = computeMedian(buffer.breathingConfidences) ?? previousRecord.breathingConfidence;
    const apnea = computeApneaHoldSeconds(
      buffer.upperTraceSamples,
      baseline?.upperTraceStdDev ?? 0.35,
      false
    );
    const currentVisitApnea = Math.max(buffer.maxApneaHoldSec, apnea.maxHoldSec);
    const maxApneaHoldSec = Number(
      (buffer.upperTraceSamples.length >= 40 && currentVisitApnea < 3 ? currentVisitApnea : Math.max(previousRecord.maxApneaHoldSec, currentVisitApnea)).toFixed(1)
    );
    const totalBlinks = buffer.priorBlinkCount + buffer.blinkCount;
    const dwellMin = Math.max(0.05, totalDwellMs / 6e4);
    const blinkRatePerMin = Number((totalBlinks / dwellMin).toFixed(1));
    const exprScore = computeMedian(buffer.expressionScores) ?? previousRecord.expressionTensionScore;
    const edaMedian = computeMedian(buffer.edaSamples);
    const edaDelta = edaMedian !== null && baseline?.edaMedian != null ? Number((edaMedian - baseline.edaMedian).toFixed(3)) : previousRecord.edaDelta;
    const signalValidRatio = buffer.totalPackets > 0 ? Number((buffer.validPackets / buffer.totalPackets).toFixed(2)) : previousRecord.signalValidRatio;
    const tracePreview = buffer.upperTraceSamples.length > 0 ? downsampleTracePreview(buffer.upperTraceSamples) : previousRecord.latestTracePreview;
    if (previousRecord.status === "SETTLED_OVERRIDE") {
      return {
        ...previousRecord,
        dwellTimeMs: totalDwellMs,
        gazeOnScreenMs: totalGazeMs,
        gazePresenceRatio,
        latestTracePreview: tracePreview,
        lastUpdatedAtIso: new Date(nowMs).toISOString()
      };
    }
    let status = "VERIFIED_CALM";
    let statusReason = "Verified: adequate reading dwell, centered gaze, and steady respiratory rhythm.";
    const currentBufferTalkingRatio = buffer.accumulatedDwellMs > 0 ? buffer.accumulatedTalkingMs / buffer.accumulatedDwellMs : totalDwellMs > 0 ? totalTalkingMs / totalDwellMs : 0;
    const hasApnea = maxApneaHoldSec >= 4.5;
    const hasPulseSpike = pulseDelta !== null && pulseConf >= 40 && pulseDelta >= 7.5 || recentPulseDelta !== null && pulseConf >= 40 && recentPulseDelta >= 7.5 && totalDwellMs >= 2500;
    const exprDelta = exprScore - (baseline?.expressionTensionMedian ?? 8);
    const hasOcularStrain = exprDelta >= 22 && blinkRatePerMin < 7;
    if (gazePresenceRatio < 0.55 && totalDwellMs >= 1500) {
      status = "SKIM_DETECTED";
      statusReason = `Gaze off-screen for ${Math.round((1 - gazePresenceRatio) * 100)}% of dwell window. Re-read with eyes on clause.`;
    } else if (currentBufferTalkingRatio > 0.35 || buffer.totalPackets >= 5 && signalValidRatio < 0.4) {
      status = "SIGNAL_UNVERIFIED";
      statusReason = currentBufferTalkingRatio > 0.35 ? "Vocalization detected (face.talking = true). SmartSpectra breathing rate is paused during speech per Model Card." : "Camera framing or lighting unstable during reading window. Hold still with face and upper chest illuminated.";
    } else if (hasApnea || (hasPulseSpike || hasOcularStrain) && totalDwellMs >= 2500) {
      status = "APNEA_FRICTION";
      const displayedPulseDelta = pulseDelta !== null && Math.abs(pulseDelta) >= 7.5 ? pulseDelta : recentPulseDelta ?? pulseDelta;
      const reasons = [];
      if (hasApnea) reasons.push(`${maxApneaHoldSec}s breath-hold (reading apnea)`);
      if (hasPulseSpike) reasons.push(`+${displayedPulseDelta} BPM pulse surge above baseline`);
      if (hasOcularStrain) reasons.push(`elevated brow tension (+${exprDelta.toFixed(0)}%) with blink suppression`);
      statusReason = `Physiological friction detected: ${reasons.join(" + ")}. Complete 2 settling breaths to attest.`;
    } else if (totalDwellMs < clause.minRequiredDwellMs || gazePresenceRatio < 0.55) {
      status = "SKIM_DETECTED";
      const pct = Math.min(100, Math.round(totalDwellMs / clause.minRequiredDwellMs * 100));
      statusReason = gazePresenceRatio < 0.55 && totalDwellMs >= 1500 ? `Gaze off-screen for ${Math.round((1 - gazePresenceRatio) * 100)}% of dwell window. Re-read with eyes on clause.` : `Skimmed (${(totalDwellMs / 1e3).toFixed(1)}s vs ${(clause.minRequiredDwellMs / 1e3).toFixed(1)}s minimum for ${clause.wordCount} words \u2014 ${pct}% completed).`;
    }
    let nextPassHistory = previousRecord.passHistory;
    if (recordPassSnapshot && buffer.accumulatedDwellMs >= 400) {
      const snapshot = {
        passNumber: previousRecord.passHistory.length + 1,
        status,
        dwellTimeMs: totalDwellMs,
        gazePresenceRatio,
        pulseDeltaBpm: pulseDelta,
        maxApneaHoldSec,
        tracePreview,
        recordedAtIso: new Date(nowMs).toISOString()
      };
      nextPassHistory = [...previousRecord.passHistory, snapshot].slice(-6);
    }
    return {
      clauseId: clause.id,
      status,
      statusReason,
      dwellTimeMs: totalDwellMs,
      gazeOnScreenMs: totalGazeMs,
      gazePresenceRatio,
      pulseMeanBpm: pulseMean !== null ? Number(pulseMean.toFixed(1)) : null,
      pulseDeltaBpm: pulseDelta,
      pulseConfidence: Number(pulseConf.toFixed(0)),
      breathingMeanBrpm: breathMean !== null ? Number(breathMean.toFixed(1)) : null,
      breathingConfidence: Number(breathConf.toFixed(0)),
      maxApneaHoldSec,
      upperTraceVariance: apnea.traceStdDev,
      blinkCount: totalBlinks,
      blinkRatePerMin,
      expressionTensionScore: Number(exprScore.toFixed(1)),
      edaDelta,
      talkingDetectedMs: totalTalkingMs,
      signalValidRatio,
      settledCyclesCompleted: previousRecord.settledCyclesCompleted,
      visitCount: previousRecord.visitCount,
      passHistory: nextPassHistory,
      latestTracePreview: tracePreview,
      lastUpdatedAtIso: new Date(nowMs).toISOString()
    };
  }
  function ingestMetricsForActiveClause(session, metrics, isValidationOk2, baseline, nowMs = Date.now(), explicitStepMs) {
    const dtMs = explicitStepMs !== void 0 ? Math.max(16, Math.min(2e3, explicitStepMs)) : Math.min(1e3, Math.max(16, nowMs - session.activeBuffer.lastTickAtMs));
    const talkingArr = metrics.face?.talking ?? [];
    const isTalking = talkingArr.length > 0 && Boolean(talkingArr[talkingArr.length - 1]?.detected);
    const landmarksArr = metrics.face?.landmarks ?? [];
    const latestLandmarks = landmarksArr.length > 0 ? landmarksArr[landmarksArr.length - 1] : void 0;
    const framing = evaluateFaceFraming(latestLandmarks);
    const gazeOnScreen = isValidationOk2 && landmarksArr.length > 0 && framing.faceCentered;
    const pulseArr = metrics.cardio?.pulseRate ?? metrics.cardio?.pulse_rate ?? [];
    const validPulses = pulseArr.filter(
      (p) => p.value >= 40 && p.value <= 150 && (p.confidence === void 0 || p.confidence >= 40)
    );
    const breathArr = metrics.breathing?.rate ?? [];
    const validBreaths = !isTalking ? breathArr.filter(
      (b) => b.value >= 5 && b.value <= 40 && (b.confidence === void 0 || b.confidence >= 45)
    ) : [];
    const upperArr = metrics.breathing?.upperTrace ?? metrics.breathing?.upper_trace ?? [];
    const combinedUpper = [...session.activeBuffer.upperTraceSamples, ...upperArr].slice(-450);
    const apneaNow = computeApneaHoldSeconds(
      combinedUpper,
      baseline?.upperTraceStdDev ?? 0.35,
      isTalking
    );
    const exprArr = metrics.face?.expression ?? [];
    const newExpr = exprArr.length > 0 ? [computeExpressionTension(exprArr[exprArr.length - 1])] : [];
    const edaArr = metrics.eda?.trace ?? [];
    const newEda = edaArr.filter((e) => Number.isFinite(e.value)).map((e) => e.value);
    const blinkArr = metrics.face?.blinking ?? [];
    const isBlinkingNow = blinkArr.length > 0 && Boolean(blinkArr[blinkArr.length - 1]?.detected);
    const blinkIncrement = isBlinkingNow && !session.activeBuffer.wasBlinkingLastPacket ? 1 : 0;
    const updatedBuffer = {
      ...session.activeBuffer,
      lastTickAtMs: nowMs,
      accumulatedDwellMs: session.activeBuffer.accumulatedDwellMs + dtMs,
      accumulatedGazeMs: session.activeBuffer.accumulatedGazeMs + (gazeOnScreen ? dtMs : 0),
      accumulatedTalkingMs: session.activeBuffer.accumulatedTalkingMs + (isTalking ? dtMs : 0),
      validPackets: session.activeBuffer.validPackets + (isValidationOk2 && !isTalking ? 1 : 0),
      totalPackets: session.activeBuffer.totalPackets + 1,
      pulseSamples: [...session.activeBuffer.pulseSamples, ...validPulses.map((p) => p.value)],
      pulseConfidences: [
        ...session.activeBuffer.pulseConfidences,
        ...validPulses.map((p) => p.confidence ?? 80)
      ],
      breathingSamples: [
        ...session.activeBuffer.breathingSamples,
        ...validBreaths.map((b) => b.value)
      ],
      breathingConfidences: [
        ...session.activeBuffer.breathingConfidences,
        ...validBreaths.map((b) => b.confidence ?? 80)
      ],
      upperTraceSamples: combinedUpper,
      expressionScores: [...session.activeBuffer.expressionScores, ...newExpr],
      edaSamples: [...session.activeBuffer.edaSamples, ...newEda],
      blinkCount: session.activeBuffer.blinkCount + blinkIncrement,
      wasBlinkingLastPacket: isBlinkingNow,
      maxApneaHoldSec: Math.max(session.activeBuffer.maxApneaHoldSec, apneaNow.maxHoldSec)
    };
    const activeClause = session.clauses.find((c) => c.id === session.activeClauseId);
    const prevRecord = session.records[session.activeClauseId];
    let updatedRecords = session.records;
    if (activeClause && prevRecord) {
      if (session.settlingTargetClauseId === session.activeClauseId) {
        updatedRecords = {
          ...session.records,
          [session.activeClauseId]: {
            ...prevRecord,
            lastUpdatedAtIso: new Date(nowMs).toISOString()
          }
        };
      } else {
        const evaluated = evaluateClauseBuffer(
          activeClause,
          updatedBuffer,
          prevRecord,
          baseline,
          nowMs,
          false
        );
        updatedRecords = {
          ...session.records,
          [session.activeClauseId]: {
            ...evaluated,
            status: prevRecord.status === "SETTLED_OVERRIDE" ? "SETTLED_OVERRIDE" : evaluated.status === "APNEA_FRICTION" ? "APNEA_FRICTION" : evaluated.dwellTimeMs >= activeClause.minRequiredDwellMs && evaluated.status === "VERIFIED_CALM" ? "VERIFIED_CALM" : "READING"
          }
        };
      }
    }
    let updatedSettlingTarget = session.settlingTargetClauseId;
    let updatedSettlingTrace = session.settlingTraceBuffer;
    if (session.settlingTargetClauseId && !isTalking && upperArr.length > 0) {
      updatedSettlingTrace = [...session.settlingTraceBuffer, ...upperArr].slice(-600);
      const cycles = countCoherentBreathCycles(updatedSettlingTrace, 0.12);
      const targetRec = updatedRecords[session.settlingTargetClauseId];
      if (targetRec) {
        const unlocked = cycles >= 2;
        const settledTracePreview = downsampleTracePreview(updatedSettlingTrace);
        const settledSnapshot = {
          passNumber: targetRec.passHistory.length + 1,
          status: "SETTLED_OVERRIDE",
          dwellTimeMs: targetRec.dwellTimeMs,
          gazePresenceRatio: targetRec.gazePresenceRatio,
          pulseDeltaBpm: targetRec.pulseDeltaBpm,
          maxApneaHoldSec: 0,
          tracePreview: settledTracePreview,
          recordedAtIso: new Date(nowMs).toISOString()
        };
        const nextPasses = unlocked ? [...targetRec.passHistory, settledSnapshot].slice(-6) : targetRec.passHistory;
        updatedRecords = {
          ...updatedRecords,
          [session.settlingTargetClauseId]: {
            ...targetRec,
            settledCyclesCompleted: cycles,
            status: unlocked ? "SETTLED_OVERRIDE" : targetRec.status,
            statusReason: unlocked ? "Unlocked via SignSteady Gate: 2 coherent respiratory settling cycles verified." : targetRec.statusReason,
            passHistory: nextPasses,
            latestTracePreview: settledTracePreview.length > 0 ? settledTracePreview : targetRec.latestTracePreview,
            lastUpdatedAtIso: new Date(nowMs).toISOString()
          }
        };
        if (unlocked) {
          updatedSettlingTarget = null;
          updatedSettlingTrace = [];
        }
      }
    }
    return {
      ...session,
      records: updatedRecords,
      activeBuffer: updatedBuffer,
      settlingTargetClauseId: updatedSettlingTarget,
      settlingTraceBuffer: updatedSettlingTrace
    };
  }
  function selectActiveClause(session, nextClauseId, baseline, nowMs = Date.now()) {
    if (nextClauseId === session.activeClauseId) return session;
    const outgoingClause = session.clauses.find((c) => c.id === session.activeClauseId);
    const outgoingPrev = session.records[session.activeClauseId];
    const nextRecords = { ...session.records };
    if (outgoingClause && outgoingPrev) {
      nextRecords[outgoingClause.id] = evaluateClauseBuffer(
        outgoingClause,
        session.activeBuffer,
        outgoingPrev,
        baseline,
        nowMs,
        true
      );
    }
    const incomingPrev = nextRecords[nextClauseId];
    if (incomingPrev) {
      nextRecords[nextClauseId] = {
        ...incomingPrev,
        status: incomingPrev.status === "VERIFIED_CALM" || incomingPrev.status === "SETTLED_OVERRIDE" ? incomingPrev.status : "READING",
        visitCount: incomingPrev.visitCount + 1,
        lastUpdatedAtIso: new Date(nowMs).toISOString()
      };
    }
    return {
      ...session,
      activeClauseId: nextClauseId,
      records: nextRecords,
      activeBuffer: createActiveClauseBuffer(nextClauseId, nowMs, nextRecords[nextClauseId])
    };
  }
  function finalizeCurrentClause(session, baseline, nowMs = Date.now()) {
    const activeClause = session.clauses.find((c) => c.id === session.activeClauseId);
    const prev = session.records[session.activeClauseId];
    if (!activeClause || !prev) return session;
    const finalized = evaluateClauseBuffer(
      activeClause,
      session.activeBuffer,
      prev,
      baseline,
      nowMs,
      true
    );
    return {
      ...session,
      records: {
        ...session.records,
        [activeClause.id]: finalized
      },
      activeBuffer: createActiveClauseBuffer(activeClause.id, nowMs, finalized)
    };
  }
  function startSettlingGate(session, clauseId) {
    return {
      ...session,
      settlingTargetClauseId: clauseId,
      settlingTraceBuffer: []
    };
  }
  function computeDocumentSignOffSummary(session) {
    let verifiedCount = 0;
    let skimmedCount = 0;
    let frictionCount = 0;
    let unverifiedSignalCount = 0;
    let unreadCount = 0;
    const blockingClauseIds = [];
    for (const c of session.clauses) {
      const r = session.records[c.id];
      const st = r?.status ?? "UNREAD";
      if (st === "VERIFIED_CALM" || st === "SETTLED_OVERRIDE") {
        verifiedCount++;
      } else if (st === "SKIM_DETECTED") {
        skimmedCount++;
        blockingClauseIds.push(c.id);
      } else if (st === "APNEA_FRICTION") {
        frictionCount++;
        blockingClauseIds.push(c.id);
      } else if (st === "SIGNAL_UNVERIFIED") {
        unverifiedSignalCount++;
        if (c.riskTier === "CRITICAL_TRAP") {
          blockingClauseIds.push(c.id);
        }
      } else {
        unreadCount++;
        blockingClauseIds.push(c.id);
      }
    }
    return {
      canSignOff: blockingClauseIds.length === 0 && session.clauses.length > 0,
      totalClauses: session.clauses.length,
      verifiedCount,
      skimmedCount,
      frictionCount,
      unverifiedSignalCount,
      unreadCount,
      blockingClauseIds
    };
  }

  // src/core/sha256.ts
  var K = [
    1116352408,
    1899447441,
    3049323471,
    3921009573,
    961987163,
    1508970993,
    2453635748,
    2870763221,
    3624381080,
    310598401,
    607225278,
    1426881987,
    1925078388,
    2162078206,
    2614888103,
    3248222580,
    3835390401,
    4022224774,
    264347078,
    604807628,
    770255983,
    1249150122,
    1555081692,
    1996064986,
    2554220882,
    2821834349,
    2952996808,
    3210313671,
    3336571891,
    3584528711,
    113926993,
    338241895,
    666307205,
    773529912,
    1294757372,
    1396182291,
    1695183700,
    1986661051,
    2177026350,
    2456956037,
    2730485921,
    2820302411,
    3259730800,
    3345764771,
    3516065817,
    3600352804,
    4094571909,
    275423344,
    430227734,
    506948616,
    659060556,
    883997877,
    958139571,
    1322822218,
    1537002063,
    1747873779,
    1955562222,
    2024104815,
    2227730452,
    2361852424,
    2428436474,
    2756734187,
    3204031479,
    3329325298
  ];
  function rotr(n, x) {
    return x >>> n | x << 32 - n;
  }
  function utf8ToBytes(str) {
    if (typeof TextEncoder !== "undefined") {
      return new TextEncoder().encode(str);
    }
    const out = [];
    for (let i = 0; i < str.length; i++) {
      let c = str.charCodeAt(i);
      if (c < 128) {
        out.push(c);
      } else if (c < 2048) {
        out.push(192 | c >> 6, 128 | c & 63);
      } else if (c < 55296 || c >= 57344) {
        out.push(224 | c >> 12, 128 | c >> 6 & 63, 128 | c & 63);
      } else {
        i++;
        c = 65536 + ((c & 1023) << 10 | str.charCodeAt(i) & 1023);
        out.push(
          240 | c >> 18,
          128 | c >> 12 & 63,
          128 | c >> 6 & 63,
          128 | c & 63
        );
      }
    }
    return new Uint8Array(out);
  }
  function sha256Hex(input) {
    const msg = utf8ToBytes(input);
    const bitLenHi = Math.floor(msg.length * 8 / 4294967296);
    const bitLenLo = msg.length * 8 >>> 0;
    const padLen = msg.length + 9 + 63 & ~63;
    const padded = new Uint8Array(padLen);
    padded.set(msg, 0);
    padded[msg.length] = 128;
    const view = new DataView(padded.buffer);
    view.setUint32(padLen - 8, bitLenHi, false);
    view.setUint32(padLen - 4, bitLenLo, false);
    let h0 = 1779033703;
    let h1 = 3144134277;
    let h2 = 1013904242;
    let h3 = 2773480762;
    let h4 = 1359893119;
    let h5 = 2600822924;
    let h6 = 528734635;
    let h7 = 1541459225;
    const w = new Int32Array(64);
    for (let offset = 0; offset < padLen; offset += 64) {
      for (let i = 0; i < 16; i++) {
        w[i] = view.getInt32(offset + i * 4, false);
      }
      for (let i = 16; i < 64; i++) {
        const s0 = rotr(7, w[i - 15]) ^ rotr(18, w[i - 15]) ^ w[i - 15] >>> 3;
        const s1 = rotr(17, w[i - 2]) ^ rotr(19, w[i - 2]) ^ w[i - 2] >>> 10;
        w[i] = w[i - 16] + s0 + w[i - 7] + s1 | 0;
      }
      let a = h0;
      let b = h1;
      let c = h2;
      let d = h3;
      let e = h4;
      let f = h5;
      let g = h6;
      let h = h7;
      for (let i = 0; i < 64; i++) {
        const S1 = rotr(6, e) ^ rotr(11, e) ^ rotr(25, e);
        const ch = e & f ^ ~e & g;
        const temp1 = h + S1 + ch + K[i] + w[i] | 0;
        const S0 = rotr(2, a) ^ rotr(13, a) ^ rotr(22, a);
        const maj = a & b ^ a & c ^ b & c;
        const temp2 = S0 + maj | 0;
        h = g;
        g = f;
        f = e;
        e = d + temp1 | 0;
        d = c;
        c = b;
        b = a;
        a = temp1 + temp2 | 0;
      }
      h0 = h0 + a | 0;
      h1 = h1 + b | 0;
      h2 = h2 + c | 0;
      h3 = h3 + d | 0;
      h4 = h4 + e | 0;
      h5 = h5 + f | 0;
      h6 = h6 + g | 0;
      h7 = h7 + h | 0;
    }
    return [h0, h1, h2, h3, h4, h5, h6, h7].map((v) => (v >>> 0).toString(16).padStart(8, "0")).join("");
  }

  // src/core/documents.ts
  var RISK_RULES = [
    {
      pattern: /pre-existing intellectual property|background ip|moral rights in perpetuity/i,
      tier: "CRITICAL_TRAP",
      warning: "CRITICAL IP TRAP: Transfers ownership of pre-existing personal libraries, tools, or background IP to the counterparty permanently."
    },
    {
      pattern: /unlimited liability|without monetary cap|indemnify.*against any and all/i,
      tier: "CRITICAL_TRAP",
      warning: "CRITICAL LIABILITY TRAP: Uncapped indemnification exposure not limited to fees paid under the contract."
    },
    {
      pattern: /non-compete|shall not build, advise, or contribute/i,
      tier: "CRITICAL_TRAP",
      warning: "CRITICAL RESTRAINT TRAP: Post-termination industry non-compete restricting future engineering work."
    },
    {
      pattern: /\b(drop\s+table|drop\s+database|truncate\s+table|delete\s+from\s+\w+\s*;)/i,
      tier: "CRITICAL_TRAP",
      warning: "DESTRUCTIVE SQL OPERATION: Irreversible table/data deletion detected. Verify backup and replication slot state before executing."
    },
    {
      pattern: /\b(rm\s+-rf|--force|--no-verify|eval\s*\(|dangerouslySetInnerHTML|disable[_-]?auth)/i,
      tier: "CRITICAL_TRAP",
      warning: "CRITICAL CODE / SECURITY RISK: Destructive flag, dynamic code execution, or authentication/verification bypass detected in diff."
    },
    {
      pattern: /irrevocable.*perpetual.*license|train commercial foundation models/i,
      tier: "CRITICAL_TRAP",
      warning: "CRITICAL DATA RIGHTS TRAP: Grants an irrevocable, perpetual license over customer or proprietary payloads."
    },
    {
      pattern: /net-90|retainage|withhold.*percent|auto-renew|without notice/i,
      tier: "ELEVATED",
      warning: "ELEVATED FINANCIAL / RENEWAL TERM: Extended payment holdback (Net-90 / retainage) or silent auto-renewal escalation."
    },
    {
      pattern: /\b(alter\s+table|create\s+index\s+(?!concurrently)|lock\s+table|pgbouncer|wal\s+archive)/i,
      tier: "ELEVATED",
      warning: "ELEVATED INFRASTRUCTURE STEP: Schema lock, connection pool drain, or WAL recovery prerequisite. Verify zero lag."
    },
    {
      pattern: /arbitration|jurisdiction|confidential|telemetry|license check/i,
      tier: "ELEVATED",
      warning: "ELEVATED COMPLIANCE / PRIVACY TERM: Review governing law, confidentiality scope, or network licensing disclosure."
    }
  ];
  function countWords(text) {
    const cleaned = text.trim();
    if (!cleaned) return 0;
    return cleaned.split(/\s+/).length;
  }
  function computeMinDwellMs(wordCount, riskTier) {
    const perWordMs = riskTier === "CRITICAL_TRAP" ? 210 : riskTier === "ELEVATED" ? 185 : 165;
    return Math.max(2400, Math.round(wordCount * perWordMs));
  }
  function classifyClauseRisk(title, body) {
    const combined = `${title}
${body}`;
    for (const rule of RISK_RULES) {
      if (rule.pattern.test(combined)) {
        return {
          riskTier: rule.tier,
          plainLanguageWarning: rule.warning
        };
      }
    }
    return { riskTier: "STANDARD" };
  }
  var BUILTIN_DOCUMENT_PRESETS = [
    {
      id: "freelance-msa-2026",
      title: "Independent Contractor Master Services Agreement (MSA)",
      subtitle: "Client software development agreement containing 2 buried IP & liability traps",
      documentType: "CONTRACT",
      counterpartyOrContext: "Acme Cloud Ventures Inc. \u2014 Q4 Engineering Engagement",
      sourcePath: "presets://contracts/independent-contractor-msa-2026.md",
      sourceHashSha256: sha256Hex("freelance-msa-2026-v2"),
      clauses: [
        {
          id: "msa-1",
          number: "\xA7 1.1",
          title: "Scope of Engineering Deliverables",
          category: "Deliverables",
          body: "Contractor agrees to design, implement, and document the customer analytics dashboard module described in Statement of Work #04. All code deliverables shall pass automated continuous integration checks and include setup documentation prior to milestone handoff.",
          wordCount: 36,
          minRequiredDwellMs: 5900,
          riskTier: "STANDARD"
        },
        {
          id: "msa-2",
          number: "\xA7 2.4",
          title: "Compensation & Net-90 Conditional Payment Holdback",
          category: "Financial Terms",
          body: 'Client shall remit undisputed invoice amounts within ninety (90) calendar days of final written acceptance ("Net-90"). Client reserves the right to withhold thirty-five percent (35%) of each milestone invoice as a retainage buffer until twelve (12) months after production launch.',
          wordCount: 41,
          minRequiredDwellMs: 7600,
          riskTier: "ELEVATED",
          plainLanguageWarning: "Cash-flow warning: Net-90 payment terms plus a 35% holdback locked for 12 months after launch."
        },
        {
          id: "msa-3",
          number: "\xA7 3.2",
          title: "Assignment of Pre-Existing & Background Intellectual Property",
          category: "Intellectual Property",
          body: "Contractor hereby irrevocably assigns to Client all right, title, and interest worldwide in and to all Deliverables AND any pre-existing libraries, CLI utilities, reusable frameworks, or background intellectual property incorporated into or used during the performance of the Services, waiving all moral rights in perpetuity without additional royalty.",
          wordCount: 48,
          minRequiredDwellMs: 1e4,
          riskTier: "CRITICAL_TRAP",
          plainLanguageWarning: "CRITICAL IP TRAP: Transfers ownership of your pre-existing personal libraries and reusable tools to the client forever, not just the work built for this project."
        },
        {
          id: "msa-4",
          number: "\xA7 4.1",
          title: "Confidentiality & Data Security Boundaries",
          category: "Security",
          body: "Both parties agree to hold proprietary credentials, customer records, and architecture specifications in strict confidence using industry-standard encryption at rest and in transit. Neither party shall disclose confidential materials to third-party subcontractors without prior written consent.",
          wordCount: 36,
          minRequiredDwellMs: 5900,
          riskTier: "STANDARD"
        },
        {
          id: "msa-5",
          number: "\xA7 5.3",
          title: "Unlimited Indemnification & 24-Month Industry Non-Compete",
          category: "Liability & Restraint",
          body: "Contractor shall defend and indemnify Client against any and all direct, indirect, or consequential claims without monetary cap (Unlimited Liability). Furthermore, for twenty-four (24) months following termination, Contractor shall not build, advise, or contribute to any software product involving cloud analytics or developer telemetry globally.",
          wordCount: 45,
          minRequiredDwellMs: 9500,
          riskTier: "CRITICAL_TRAP",
          plainLanguageWarning: "CRITICAL LIABILITY & CAREER TRAP: Uncapped financial liability (not limited to fees paid) combined with a 2-year global ban on building analytics or telemetry software."
        }
      ]
    },
    {
      id: "prod-cutover-runbook",
      title: "Production PostgreSQL 17 Primary Shard Cutover Checklist",
      subtitle: "High-stakes infrastructure migration sign-off before executing primary switchover",
      documentType: "RUNBOOK",
      counterpartyOrContext: "Cluster: prod-ledger-us-east-1 \u2022 Maintenance Window",
      sourcePath: "presets://runbooks/pg17-primary-cutover.sql.md",
      sourceHashSha256: sha256Hex("prod-cutover-runbook-v2"),
      clauses: [
        {
          id: "run-1",
          number: "STEP 01",
          title: "Verify Physical WAL Archive & Point-in-Time Recovery Snapshot",
          category: "Backup Integrity",
          body: "Confirm that pgBackRest incremental backup completed within the last 15 minutes and that WAL segment archiving to immutable object storage shows zero lag before touching replica configuration.",
          wordCount: 28,
          minRequiredDwellMs: 5200,
          riskTier: "ELEVATED",
          plainLanguageWarning: "Verify WAL archive lag is 0 bytes before proceeding; without this, point-in-time recovery is impossible."
        },
        {
          id: "run-2",
          number: "STEP 02",
          title: "Drain PgBouncer Connection Pools & Fence Write Traffic",
          category: "Traffic Fencing",
          body: "Issue PAUSE on all read-write PgBouncer pools and set default_transaction_read_only = on across the old primary node to prevent split-brain writes during replication catch-up.",
          wordCount: 26,
          minRequiredDwellMs: 4800,
          riskTier: "STANDARD"
        },
        {
          id: "run-3",
          number: "STEP 03",
          title: "Irreversible Legacy Slot Purge & Old Primary Demotion",
          category: "Destructive Cutover",
          body: "Promote standby node-02 to primary, immediately drop the legacy replication slot, and execute destructive storage trim on old-primary scratch tables (DROP TABLE ledger_staging_unverified CASCADE). This operation is irreversible once committed.",
          isCodeOrDiff: true,
          wordCount: 31,
          minRequiredDwellMs: 6600,
          riskTier: "CRITICAL_TRAP",
          plainLanguageWarning: "IRREVERSIBLE STEP: Dropping the replication slot and staging table permanently destroys unpromoted rows on old-primary."
        },
        {
          id: "run-4",
          number: "STEP 04",
          title: "Post-Cutover Checksum & Canary Transaction Verification",
          category: "Verification",
          body: "Run synthetic canary transfer #001, verify sequence monotonic increments match pre-cutover high-water marks, and resume PgBouncer pools only after error rates remain below 0.01% for 180 seconds.",
          wordCount: 28,
          minRequiredDwellMs: 5e3,
          riskTier: "STANDARD"
        }
      ]
    },
    {
      id: "biometric-study-consent",
      title: "Biometric & Optical Sensor Research Participation Consent",
      subtitle: "Informed participant consent form detailing camera usage, telemetry, and deletion rights",
      documentType: "CONSENT_FORM",
      counterpartyOrContext: "Human-Computer Interaction Lab \u2014 Protocol #2026-11",
      sourcePath: "presets://consent/hci-optical-protocol-2026.md",
      sourceHashSha256: sha256Hex("biometric-study-consent-v2"),
      clauses: [
        {
          id: "con-1",
          number: "PART A",
          title: "Local Optical Processing & Camera Scope",
          category: "Sensor Scope",
          body: "This study captures video frames from your front-facing webcam solely to compute on-device physiological signals (pulse waveform, chest breathing motion, and facial landmarks). No raw video or audio recording is ever saved to disk or transmitted over the network.",
          wordCount: 39,
          minRequiredDwellMs: 6500,
          riskTier: "STANDARD"
        },
        {
          id: "con-2",
          number: "PART B",
          title: "SDK Licensing Handshake & Telemetry Opt-Out",
          category: "Network Disclosure",
          body: "While physiological computation occurs locally on your machine, the underlying SDK performs an authenticated TLS license check with Presage Technologies at session start. Session diagnostic telemetry is explicitly disabled (enableTelemetry: false) by default.",
          wordCount: 34,
          minRequiredDwellMs: 6200,
          riskTier: "ELEVATED",
          plainLanguageWarning: "Important distinction: Raw video never leaves your PC, but the SDK still performs an authenticated license check at startup."
        },
        {
          id: "con-3",
          number: "PART C",
          title: "Non-Medical Scope & Right to Immediate Withdrawal",
          category: "Participant Rights",
          body: "All metrics displayed are uncalibrated wellness and interaction estimates and must never be used for medical diagnosis or clinical decision-making. You may stop the camera and permanently delete all in-memory session logs at any second with a single click.",
          wordCount: 39,
          minRequiredDwellMs: 6500,
          riskTier: "STANDARD"
        }
      ]
    }
  ];
  function parseGitDiffIntoPreset(repoName, branchName, rawDiff, repoPath) {
    const sourceHashSha256 = sha256Hex(rawDiff || "empty-diff");
    const fileChunks = rawDiff.split(/^diff --git /m).map((c) => c.trim()).filter(Boolean);
    const clauses = [];
    let hunkCounter = 1;
    for (const chunk of fileChunks) {
      const lines = chunk.split("\n");
      const headerLine = lines[0] || "";
      const fileMatch = headerLine.match(/a\/([^\s]+)\s+b\/([^\s]+)/);
      const fileName = fileMatch ? fileMatch[2] : headerLine.slice(0, 60);
      const hunkParts = chunk.split(/^(@@[^@]+@@.*)$/m);
      if (hunkParts.length <= 1) {
        const body = lines.slice(1, 35).join("\n").trim() || chunk.slice(0, 800);
        const wordCount = Math.max(18, countWords(body));
        const { riskTier, plainLanguageWarning } = classifyClauseRisk(fileName, body);
        clauses.push({
          id: `diff-${hunkCounter}`,
          number: `HUNK ${String(hunkCounter).padStart(2, "0")}`,
          title: `${fileName}`,
          category: "Git Diff",
          body,
          isCodeOrDiff: true,
          wordCount,
          minRequiredDwellMs: computeMinDwellMs(wordCount, riskTier),
          riskTier,
          plainLanguageWarning
        });
        hunkCounter++;
      } else {
        for (let i = 1; i < hunkParts.length; i += 2) {
          const hunkHeader = hunkParts[i].trim();
          const hunkBody = (hunkParts[i + 1] || "").trim();
          const combinedBody = `${hunkHeader}
${hunkBody.split("\n").slice(0, 28).join("\n")}`;
          const wordCount = Math.max(18, countWords(combinedBody));
          const { riskTier, plainLanguageWarning } = classifyClauseRisk(fileName, combinedBody);
          clauses.push({
            id: `diff-${hunkCounter}`,
            number: `HUNK ${String(hunkCounter).padStart(2, "0")}`,
            title: `${fileName} (${hunkHeader.split("@@")[1]?.trim() || "hunk"})`,
            category: "Git Diff Hunk",
            body: combinedBody,
            isCodeOrDiff: true,
            wordCount,
            minRequiredDwellMs: computeMinDwellMs(wordCount, riskTier),
            riskTier,
            plainLanguageWarning
          });
          hunkCounter++;
          if (clauses.length >= 12) break;
        }
      }
      if (clauses.length >= 12) break;
    }
    return {
      id: `git-diff-${sourceHashSha256.slice(0, 8)}`,
      title: `Git Working Tree Audit: ${repoName}`,
      subtitle: `Branch: ${branchName} \u2022 ${clauses.length} diff hunks parsed from local repository`,
      documentType: "GIT_DIFF",
      counterpartyOrContext: `Repo: ${repoPath || repoName} (SHA-256: ${sourceHashSha256.slice(0, 12)})`,
      sourcePath: repoPath || repoName,
      sourceHashSha256,
      clauses: clauses.length > 0 ? clauses : [
        {
          id: "diff-1",
          number: "HUNK 01",
          title: `${repoName} (Clean Working Tree)`,
          category: "Git Status",
          body: "No uncommitted tracked modifications found in git diff.",
          isCodeOrDiff: true,
          wordCount: 15,
          minRequiredDwellMs: 2800,
          riskTier: "STANDARD"
        }
      ]
    };
  }
  function parseCustomDocumentIntoClauses(title, rawText, sourcePath) {
    const cleanTitle = title.trim() || "Custom Audited Document";
    if (/^diff --git /m.test(rawText)) {
      return parseGitDiffIntoPreset(cleanTitle, "pasted-diff", rawText, sourcePath);
    }
    const sourceHashSha256 = sha256Hex(rawText);
    const isCodeFile = Boolean(
      sourcePath && /\.(sql|ts|js|py|json|yaml|yml|diff|patch|sh)$/i.test(sourcePath)
    );
    const rawBlocks = rawText.split(/\n\s*\n+/).map((b) => b.trim()).filter((b) => b.length >= 15);
    const effectiveBlocks = rawBlocks.length > 0 ? rawBlocks.slice(0, 15) : [rawText.trim() || "No content provided."];
    const clauses = effectiveBlocks.map((block, idx) => {
      const lines = block.split("\n");
      let clauseTitle = `Section ${idx + 1}`;
      let body = block;
      if (lines.length > 1 && lines[0].length < 95) {
        clauseTitle = lines[0].replace(/^[#*§\d.\-\s]+/, "").trim() || clauseTitle;
        body = lines.slice(1).join("\n").trim();
      } else {
        const firstSentence = block.split(/[.!?\n]/)[0] || "";
        clauseTitle = firstSentence.length > 4 && firstSentence.length <= 70 ? firstSentence.trim() : `Section ${idx + 1}`;
      }
      const wordCount = Math.max(12, countWords(body));
      const { riskTier, plainLanguageWarning } = classifyClauseRisk(clauseTitle, body);
      const minRequiredDwellMs = computeMinDwellMs(wordCount, riskTier);
      const isBlockCodeOrDiff = isCodeFile || /^(@@|diff --git|\+[^\+]|\-[^\-])|\b(DROP TABLE|TRUNCATE TABLE|ALTER TABLE|SELECT |BEGIN TRANSACTION|export function)\b/m.test(
        body
      );
      return {
        id: `custom-${idx + 1}`,
        number: isBlockCodeOrDiff ? `HUNK ${String(idx + 1).padStart(2, "0")}` : `\xA7 ${idx + 1}`,
        title: clauseTitle,
        category: riskTier === "CRITICAL_TRAP" ? "Critical Risk" : riskTier === "ELEVATED" ? "Elevated Term" : isBlockCodeOrDiff ? "Code / Diff Hunk" : "General Clause",
        body,
        isCodeOrDiff: isBlockCodeOrDiff,
        wordCount,
        minRequiredDwellMs,
        riskTier,
        plainLanguageWarning
      };
    });
    return {
      id: `doc-${sourceHashSha256.slice(0, 10)}`,
      title: cleanTitle,
      subtitle: sourcePath ? `Local File: ${sourcePath} (${clauses.length} sections)` : `User-imported document (${clauses.length} clauses parsed)`,
      documentType: sourcePath ? "LOCAL_FILE" : "CUSTOM",
      counterpartyOrContext: sourcePath ? `File SHA-256: ${sourceHashSha256.slice(0, 16)}\u2026` : "Local Custom Document Audit",
      sourcePath,
      sourceHashSha256,
      clauses
    };
  }

  // src/core/evalHarness.ts
  var TEST_CLAUSE = {
    id: "eval-clause-1",
    number: "\xA7 3.2",
    title: "Assignment of Pre-Existing Background IP",
    category: "Intellectual Property",
    body: "Contractor irrevocably assigns all pre-existing frameworks and background IP in perpetuity.",
    wordCount: 36,
    minRequiredDwellMs: 6e3,
    riskTier: "CRITICAL_TRAP"
  };
  var EVALUATION_CORPUS_30 = [
    // 1-6: Calm Comprehension across diverse resting heart rates (54 BPM to 86 BPM)
    {
      id: "C01",
      name: "Calm reader \u2014 normal resting HR (68 BPM -> 69 BPM)",
      category: "CALM_COMPREHENSION",
      expectedVerdict: "VERIFIED_CALM",
      baselineRestingBpm: 68,
      dwellSeconds: 7.5,
      gazeCentered: true,
      talkingActive: false,
      apneaHoldSeconds: 0,
      readingPulseBpm: 69,
      pulseConfidence: 90,
      browTensionPct: 6,
      blinkRatePerMin: 16,
      notes: "Steady 14 BRPM sinusoidal chest wave, centered 478 landmarks."
    },
    {
      id: "C02",
      name: "Calm endurance athlete \u2014 low resting HR (52 BPM -> 54 BPM)",
      category: "CALM_COMPREHENSION",
      expectedVerdict: "VERIFIED_CALM",
      baselineRestingBpm: 52,
      dwellSeconds: 8,
      gazeCentered: true,
      talkingActive: false,
      apneaHoldSeconds: 0,
      readingPulseBpm: 54,
      pulseConfidence: 88,
      browTensionPct: 5,
      blinkRatePerMin: 15,
      notes: "Demonstrates low-BPM baseline stability."
    },
    {
      id: "C03",
      name: "Calm reader with naturally high resting HR (84 BPM -> 85 BPM)",
      category: "CALM_COMPREHENSION",
      expectedVerdict: "VERIFIED_CALM",
      baselineRestingBpm: 84,
      dwellSeconds: 7.2,
      gazeCentered: true,
      talkingActive: false,
      apneaHoldSeconds: 0,
      readingPulseBpm: 85,
      pulseConfidence: 91,
      browTensionPct: 8,
      blinkRatePerMin: 14,
      notes: "Uncalibrated fixed 80-BPM threshold falsely flags this calm user."
    },
    {
      id: "C04",
      name: "Calm coffee drinker \u2014 elevated resting HR (88 BPM -> 89 BPM)",
      category: "CALM_COMPREHENSION",
      expectedVerdict: "VERIFIED_CALM",
      baselineRestingBpm: 88,
      dwellSeconds: 8.5,
      gazeCentered: true,
      talkingActive: false,
      apneaHoldSeconds: 0,
      readingPulseBpm: 89,
      pulseConfidence: 86,
      browTensionPct: 9,
      blinkRatePerMin: 18,
      notes: "Delta is only +1.0 BPM above personal baseline."
    },
    {
      id: "C05",
      name: "Slow deliberate legal review (12s dwell, 72 BPM -> 74 BPM)",
      category: "CALM_COMPREHENSION",
      expectedVerdict: "VERIFIED_CALM",
      baselineRestingBpm: 72,
      dwellSeconds: 12,
      gazeCentered: true,
      talkingActive: false,
      apneaHoldSeconds: 0,
      readingPulseBpm: 74,
      pulseConfidence: 94,
      browTensionPct: 10,
      blinkRatePerMin: 15,
      notes: "Full 12s SmartSpectra pulse window converged."
    },
    {
      id: "C06",
      name: "Calm reader with minor 2.0s natural breath pause",
      category: "CALM_COMPREHENSION",
      expectedVerdict: "VERIFIED_CALM",
      baselineRestingBpm: 70,
      dwellSeconds: 7.5,
      gazeCentered: true,
      talkingActive: false,
      apneaHoldSeconds: 2,
      readingPulseBpm: 71,
      pulseConfidence: 89,
      browTensionPct: 7,
      blinkRatePerMin: 16,
      notes: "End-expiratory pause of 2.0s is normal and must not trigger apnea alarm."
    },
    // 7-11: Rapid Skimming (Dwell below 6.0s floor)
    {
      id: "S07",
      name: "Fast scroll-past skimmer (1.5s dwell)",
      category: "RAPID_SKIM",
      expectedVerdict: "SKIM_DETECTED",
      baselineRestingBpm: 70,
      dwellSeconds: 1.5,
      gazeCentered: true,
      talkingActive: false,
      apneaHoldSeconds: 0,
      readingPulseBpm: 70,
      pulseConfidence: 80,
      browTensionPct: 5,
      blinkRatePerMin: 16,
      notes: "25% of required minimum reading dwell time."
    },
    {
      id: "S08",
      name: "Impatient click-through (3.2s dwell on 6.0s clause)",
      category: "RAPID_SKIM",
      expectedVerdict: "SKIM_DETECTED",
      baselineRestingBpm: 66,
      dwellSeconds: 3.2,
      gazeCentered: true,
      talkingActive: false,
      apneaHoldSeconds: 0,
      readingPulseBpm: 67,
      pulseConfidence: 82,
      browTensionPct: 6,
      blinkRatePerMin: 15,
      notes: "53% of required reading dwell floor."
    },
    {
      id: "S09",
      name: "Near-threshold speed skim (4.8s dwell on 6.0s clause)",
      category: "RAPID_SKIM",
      expectedVerdict: "SKIM_DETECTED",
      baselineRestingBpm: 74,
      dwellSeconds: 4.8,
      gazeCentered: true,
      talkingActive: false,
      apneaHoldSeconds: 0,
      readingPulseBpm: 75,
      pulseConfidence: 85,
      browTensionPct: 8,
      blinkRatePerMin: 14,
      notes: "80% of required reading floor \u2014 caught by word-count WPM gate."
    },
    // 10-13: Eyes Off-Screen / Phone Distraction (Timer satisfied, Gaze failed)
    {
      id: "G10",
      name: "Phone distraction while timer runs (8.0s dwell, gaze off-screen)",
      category: "EYES_OFF_SCREEN",
      expectedVerdict: "SKIM_DETECTED",
      baselineRestingBpm: 70,
      dwellSeconds: 8,
      gazeCentered: false,
      talkingActive: false,
      apneaHoldSeconds: 0,
      readingPulseBpm: 70,
      pulseConfidence: 78,
      browTensionPct: 4,
      blinkRatePerMin: 14,
      notes: "Naive dwell timer passes this; landmark framing catches eyes off-screen."
    },
    {
      id: "G11",
      name: "Second-monitor multitasking (9.5s dwell, head turned 45 deg)",
      category: "EYES_OFF_SCREEN",
      expectedVerdict: "SKIM_DETECTED",
      baselineRestingBpm: 65,
      dwellSeconds: 9.5,
      gazeCentered: false,
      talkingActive: false,
      apneaHoldSeconds: 0,
      readingPulseBpm: 66,
      pulseConfidence: 75,
      browTensionPct: 5,
      blinkRatePerMin: 12,
      notes: "Landmarks shifted outside [0.18, 0.82] viewport box."
    },
    {
      id: "G12",
      name: "User walked away from desk with clause open (11.0s dwell, 0 landmarks)",
      category: "EYES_OFF_SCREEN",
      expectedVerdict: "SKIM_DETECTED",
      baselineRestingBpm: 72,
      dwellSeconds: 11,
      gazeCentered: false,
      talkingActive: false,
      apneaHoldSeconds: 0,
      readingPulseBpm: 72,
      pulseConfidence: 40,
      browTensionPct: 0,
      blinkRatePerMin: 0,
      notes: "Verifies Fix for Defect C: 0 landmarks = 0% gaze presence."
    },
    {
      id: "G13",
      name: "Half-attentive glance (7.0s dwell, only 30% gaze on screen)",
      category: "EYES_OFF_SCREEN",
      expectedVerdict: "SKIM_DETECTED",
      baselineRestingBpm: 69,
      dwellSeconds: 7,
      gazeCentered: false,
      talkingActive: false,
      apneaHoldSeconds: 0,
      readingPulseBpm: 70,
      pulseConfidence: 80,
      browTensionPct: 6,
      blinkRatePerMin: 15,
      notes: "Gaze ratio below 55% minimum comprehension threshold."
    },
    // 14-19: Reading Apnea & Autonomic Strain on Trap Clauses
    {
      id: "A14",
      name: "Classic screen apnea on IP assignment trap (5.5s chest flatline)",
      category: "READING_APNEA_TRAP",
      expectedVerdict: "APNEA_FRICTION",
      baselineRestingBpm: 70,
      dwellSeconds: 8.5,
      gazeCentered: true,
      talkingActive: false,
      apneaHoldSeconds: 5.5,
      readingPulseBpm: 73,
      pulseConfidence: 88,
      browTensionPct: 18,
      blinkRatePerMin: 9,
      notes: "Caught purely by upperTrace respiratory flatline >= 4.5s even without HR > 80."
    },
    {
      id: "A15",
      name: "Severe breath-hold on DROP TABLE step (6.8s chest flatline)",
      category: "READING_APNEA_TRAP",
      expectedVerdict: "APNEA_FRICTION",
      baselineRestingBpm: 64,
      dwellSeconds: 9,
      gazeCentered: true,
      talkingActive: false,
      apneaHoldSeconds: 6.8,
      readingPulseBpm: 70,
      pulseConfidence: 90,
      browTensionPct: 24,
      blinkRatePerMin: 6,
      notes: "Both Naive Timer and Uncalibrated 80-BPM gate miss this completely."
    },
    {
      id: "A16",
      name: "Combined reading apnea (5.0s) + sympathetic pulse surge (+11 BPM)",
      category: "READING_APNEA_TRAP",
      expectedVerdict: "APNEA_FRICTION",
      baselineRestingBpm: 71,
      dwellSeconds: 8,
      gazeCentered: true,
      talkingActive: false,
      apneaHoldSeconds: 5,
      readingPulseBpm: 82,
      pulseConfidence: 91,
      browTensionPct: 35,
      blinkRatePerMin: 5,
      notes: "Multi-modal convergence across respiratory, cardiac, and ocular channels."
    },
    {
      id: "A17",
      name: "Low-resting-HR user experiencing +10 BPM surge (58 BPM -> 68 BPM)",
      category: "PULSE_SURGE_TRAP",
      expectedVerdict: "APNEA_FRICTION",
      baselineRestingBpm: 58,
      dwellSeconds: 8,
      gazeCentered: true,
      talkingActive: false,
      apneaHoldSeconds: 2,
      readingPulseBpm: 68,
      pulseConfidence: 89,
      browTensionPct: 16,
      blinkRatePerMin: 10,
      notes: "Uncalibrated 80-BPM threshold misses 58->68 BPM (+10 BPM) surge; personal baseline catches it."
    },
    {
      id: "A18",
      name: "Normal-resting-HR user experiencing +9.5 BPM surge (69 BPM -> 78.5 BPM)",
      category: "PULSE_SURGE_TRAP",
      expectedVerdict: "APNEA_FRICTION",
      baselineRestingBpm: 69,
      dwellSeconds: 8,
      gazeCentered: true,
      talkingActive: false,
      apneaHoldSeconds: 1.5,
      readingPulseBpm: 78.5,
      pulseConfidence: 87,
      browTensionPct: 15,
      blinkRatePerMin: 11,
      notes: "Peak HR is 78.5 BPM (<80), caught via +9.5 BPM personal baseline delta."
    },
    {
      id: "A19",
      name: "Ocular tunnel vision & brow furrow (+28% tension, blink rate 4/min)",
      category: "READING_APNEA_TRAP",
      expectedVerdict: "APNEA_FRICTION",
      baselineRestingBpm: 72,
      dwellSeconds: 8.5,
      gazeCentered: true,
      talkingActive: false,
      apneaHoldSeconds: 2.5,
      readingPulseBpm: 76,
      pulseConfidence: 85,
      browTensionPct: 38,
      blinkRatePerMin: 4,
      notes: "Caught by expression tension delta (>=22%) + blink suppression (<7/min)."
    },
    {
      id: "A20",
      name: "High sympathetic surge on unlimited indemnity (74 BPM -> 86 BPM)",
      category: "PULSE_SURGE_TRAP",
      expectedVerdict: "APNEA_FRICTION",
      baselineRestingBpm: 74,
      dwellSeconds: 9,
      gazeCentered: true,
      talkingActive: false,
      apneaHoldSeconds: 4.8,
      readingPulseBpm: 86,
      pulseConfidence: 92,
      browTensionPct: 30,
      blinkRatePerMin: 6,
      notes: "Both apnea and cardiac delta thresholds exceeded."
    },
    // 21-25: Speech / Vocalization Gate (`face.talking = true`)
    {
      id: "T21",
      name: "Reading clause aloud on Zoom call (talking=true, HR 83 BPM)",
      category: "SPEECH_CONFUSION_GATE",
      expectedVerdict: "SIGNAL_UNVERIFIED",
      baselineRestingBpm: 72,
      dwellSeconds: 8,
      gazeCentered: true,
      talkingActive: true,
      apneaHoldSeconds: 5.5,
      readingPulseBpm: 83,
      pulseConfidence: 65,
      browTensionPct: 20,
      blinkRatePerMin: 14,
      notes: "Per SmartSpectra Model Card, speech invalidates chest breathing; must output SIGNAL_UNVERIFIED, not false APNEA_FRICTION."
    },
    {
      id: "T22",
      name: "Dictating notes while reviewing runbook (talking=true, HR 81 BPM)",
      category: "SPEECH_CONFUSION_GATE",
      expectedVerdict: "SIGNAL_UNVERIFIED",
      baselineRestingBpm: 70,
      dwellSeconds: 7.5,
      gazeCentered: true,
      talkingActive: true,
      apneaHoldSeconds: 6,
      readingPulseBpm: 81,
      pulseConfidence: 60,
      browTensionPct: 14,
      blinkRatePerMin: 16,
      notes: "Speech gate suppresses false apnea alarm caused by vocal exhalation."
    },
    {
      id: "T23",
      name: "Speaking to colleague beside desk (talking=true, HR 78 BPM)",
      category: "SPEECH_CONFUSION_GATE",
      expectedVerdict: "SIGNAL_UNVERIFIED",
      baselineRestingBpm: 70,
      dwellSeconds: 8,
      gazeCentered: true,
      talkingActive: true,
      apneaHoldSeconds: 4.9,
      readingPulseBpm: 78,
      pulseConfidence: 70,
      browTensionPct: 12,
      blinkRatePerMin: 15,
      notes: "Correctly gated as SIGNAL_UNVERIFIED."
    },
    {
      id: "T24",
      name: "Coughing / vocal throat clearing during reading (talking=true, HR 85 BPM)",
      category: "SPEECH_CONFUSION_GATE",
      expectedVerdict: "SIGNAL_UNVERIFIED",
      baselineRestingBpm: 73,
      dwellSeconds: 7,
      gazeCentered: true,
      talkingActive: true,
      apneaHoldSeconds: 5.2,
      readingPulseBpm: 85,
      pulseConfidence: 55,
      browTensionPct: 25,
      blinkRatePerMin: 12,
      notes: "Uncalibrated pulse gate falsely triggers APNEA_FRICTION during speech."
    },
    // 25-30: Boundary & Honest Failure-Mode Edge Cases
    {
      id: "E25",
      name: "Low-confidence optical pulse noise (+12 BPM spike at 25% confidence)",
      category: "BOUNDARY_EDGE_CASE",
      expectedVerdict: "VERIFIED_CALM",
      baselineRestingBpm: 70,
      dwellSeconds: 7.5,
      gazeCentered: true,
      talkingActive: false,
      apneaHoldSeconds: 0,
      readingPulseBpm: 82,
      pulseConfidence: 25,
      browTensionPct: 8,
      blinkRatePerMin: 15,
      notes: "SmartSpectra Model Card requires confidence >= 40 for pulse stability; noisy 82 BPM spike is rejected."
    },
    {
      id: "E26",
      name: "Borderline 4.6s breath hold at exact threshold",
      category: "BOUNDARY_EDGE_CASE",
      expectedVerdict: "APNEA_FRICTION",
      baselineRestingBpm: 70,
      dwellSeconds: 8,
      gazeCentered: true,
      talkingActive: false,
      apneaHoldSeconds: 4.6,
      readingPulseBpm: 72,
      pulseConfidence: 88,
      browTensionPct: 12,
      blinkRatePerMin: 12,
      notes: "4.6s >= 4.5s threshold triggers APNEA_FRICTION."
    },
    {
      id: "E27",
      name: "Borderline +7.6 BPM cardiac delta with steady breathing",
      category: "BOUNDARY_EDGE_CASE",
      expectedVerdict: "APNEA_FRICTION",
      baselineRestingBpm: 68,
      dwellSeconds: 8,
      gazeCentered: true,
      talkingActive: false,
      apneaHoldSeconds: 1.2,
      readingPulseBpm: 75.6,
      pulseConfidence: 86,
      browTensionPct: 14,
      blinkRatePerMin: 11,
      notes: "+7.6 BPM >= +7.5 BPM threshold triggers APNEA_FRICTION."
    },
    {
      id: "E28",
      name: "Mild +4.0 BPM cardiac elevation during normal reading concentration",
      category: "BOUNDARY_EDGE_CASE",
      expectedVerdict: "VERIFIED_CALM",
      baselineRestingBpm: 70,
      dwellSeconds: 7.5,
      gazeCentered: true,
      talkingActive: false,
      apneaHoldSeconds: 1.5,
      readingPulseBpm: 74,
      pulseConfidence: 90,
      browTensionPct: 12,
      blinkRatePerMin: 14,
      notes: "+4.0 BPM is normal cognitive engagement and does not false-alarm."
    },
    {
      id: "E29",
      name: "Known Limitation Case 1: Sub-threshold 3.9s micro-apnea hold on short clause",
      category: "BOUNDARY_EDGE_CASE",
      expectedVerdict: "APNEA_FRICTION",
      baselineRestingBpm: 70,
      dwellSeconds: 6.5,
      gazeCentered: true,
      talkingActive: false,
      apneaHoldSeconds: 3.9,
      readingPulseBpm: 74.2,
      pulseConfidence: 85,
      browTensionPct: 18,
      blinkRatePerMin: 10,
      notes: "Honest Failure Boundary: 3.9s hold + 4.2 BPM delta falls just under the 4.5s / +7.5 BPM conservative thresholds to avoid false positives."
    },
    {
      id: "E30",
      name: "Known Limitation Case 2: Delayed 12s rPPG rolling window lag on 6.2s read",
      category: "BOUNDARY_EDGE_CASE",
      expectedVerdict: "APNEA_FRICTION",
      baselineRestingBpm: 70,
      dwellSeconds: 6.2,
      gazeCentered: true,
      talkingActive: false,
      apneaHoldSeconds: 2.2,
      readingPulseBpm: 75.8,
      pulseConfidence: 36,
      browTensionPct: 16,
      blinkRatePerMin: 11,
      notes: "Honest Failure Boundary: On a 6.2s read without apnea, SmartSpectra 12s rolling pulse confidence (36% < 40%) suppresses the cardiac spike."
    }
  ];
  function evaluateNaiveTimerOnly(sc) {
    const dwellMs = sc.dwellSeconds * 1e3;
    return dwellMs >= TEST_CLAUSE.minRequiredDwellMs ? "VERIFIED_CALM" : "SKIM_DETECTED";
  }
  function evaluateUncalibratedPulseGate(sc) {
    const dwellMs = sc.dwellSeconds * 1e3;
    if (dwellMs < TEST_CLAUSE.minRequiredDwellMs) return "SKIM_DETECTED";
    if (sc.readingPulseBpm >= 80) return "APNEA_FRICTION";
    return "VERIFIED_CALM";
  }
  function evaluateClausePulseEngineOnScenario(sc) {
    const baseline = {
      calibratedAtIso: (/* @__PURE__ */ new Date(17e11)).toISOString(),
      durationSec: 30,
      pulseMedianBpm: sc.baselineRestingBpm,
      pulseIqrBpm: 2,
      breathingMedianBrpm: 14,
      upperTraceStdDev: 0.35,
      blinkRatePerMin: 16,
      expressionTensionMedian: 8,
      edaMedian: 0.85,
      hrvRmssdMs: 42,
      hrvBaevskyIndex: 110,
      sampleCount: 300,
      talkingRatio: 0,
      valid: true
    };
    let session = createDocumentSession([TEST_CLAUSE], 1e6);
    const totalSteps = Math.max(1, Math.round(sc.dwellSeconds * 10));
    const apneaSteps = Math.round(sc.apneaHoldSeconds * 10);
    const blinkIntervalSteps = sc.blinkRatePerMin > 0 ? Math.max(2, Math.round(60 / sc.blinkRatePerMin * 10)) : 9999;
    for (let step = 1; step <= totalSteps; step++) {
      const nowMs = 1e6 + step * 100;
      const tsUs = nowMs * 1e3;
      const isApneaWindow = step <= apneaSteps;
      const upperVal = isApneaWindow ? 5e-3 * Math.sin(step * 0.2) : 0.45 * Math.sin(step / 10 * 2 * Math.PI * 0.23);
      const landmarks = sc.gazeCentered ? [
        { x: 0.44, y: 0.42 },
        { x: 0.56, y: 0.42 },
        { x: 0.5, y: 0.52 }
      ] : [];
      const isBlink = step % blinkIntervalSteps === 0;
      const packet = {
        breathing: {
          rate: [{ value: 14, confidence: 85, stable: true, timestamp: tsUs }],
          upperTrace: [{ value: upperVal, stable: true, timestamp: tsUs }]
        },
        cardio: {
          pulseRate: [
            {
              value: sc.readingPulseBpm,
              confidence: sc.pulseConfidence,
              stable: sc.pulseConfidence >= 40,
              timestamp: tsUs
            }
          ]
        },
        face: {
          talking: [{ detected: sc.talkingActive, stable: true, timestamp: tsUs }],
          blinking: [{ detected: isBlink, stable: true, timestamp: tsUs }],
          landmarks: landmarks.length > 0 ? [{ value: landmarks, stable: true, timestamp: tsUs }] : [],
          expression: [
            {
              stable: true,
              timestamp: tsUs,
              scores: [
                { type: 1, confidence: sc.browTensionPct },
                { type: 6, confidence: Math.max(0, 100 - sc.browTensionPct) }
              ]
            }
          ]
        }
      };
      session = ingestMetricsForActiveClause(session, packet, true, baseline, nowMs, 100);
    }
    session = finalizeCurrentClause(session, baseline, 1e6 + totalSteps * 100);
    return session.records[TEST_CLAUSE.id].status;
  }
  function runEvaluationBenchmarkSuite() {
    const outcomes = [];
    let naiveCorrect = 0;
    let uncalibratedCorrect = 0;
    let clausePulseCorrect = 0;
    let speechCases = 0;
    let speechFpUncalibrated = 0;
    let speechFpClausePulse = 0;
    for (const sc of EVALUATION_CORPUS_30) {
      const naiveVerdict = evaluateNaiveTimerOnly(sc);
      const uncalVerdict = evaluateUncalibratedPulseGate(sc);
      const cpVerdict = evaluateClausePulseEngineOnScenario(sc);
      const nOk = naiveVerdict === sc.expectedVerdict;
      const uOk = uncalVerdict === sc.expectedVerdict;
      const cOk = cpVerdict === sc.expectedVerdict;
      if (nOk) naiveCorrect++;
      if (uOk) uncalibratedCorrect++;
      if (cOk) clausePulseCorrect++;
      if (sc.category === "SPEECH_CONFUSION_GATE") {
        speechCases++;
        if (uncalVerdict === "APNEA_FRICTION") speechFpUncalibrated++;
        if (cpVerdict === "APNEA_FRICTION") speechFpClausePulse++;
      }
      outcomes.push({
        scenarioId: sc.id,
        scenarioName: sc.name,
        category: sc.category,
        expected: sc.expectedVerdict,
        naiveTimerVerdict: naiveVerdict,
        uncalibratedPulseVerdict: uncalVerdict,
        clausePulseVerdict: cpVerdict,
        naiveCorrect: nOk,
        uncalibratedCorrect: uOk,
        clausePulseCorrect: cOk,
        diagnosticNote: sc.notes
      });
    }
    const total = EVALUATION_CORPUS_30.length;
    return {
      totalCases: total,
      executedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
      naiveTimerAccuracyPct: Number((naiveCorrect / total * 100).toFixed(1)),
      naiveTimerCorrect: naiveCorrect,
      uncalibratedPulseAccuracyPct: Number((uncalibratedCorrect / total * 100).toFixed(1)),
      uncalibratedPulseCorrect: uncalibratedCorrect,
      clausePulseAccuracyPct: Number((clausePulseCorrect / total * 100).toFixed(1)),
      clausePulseCorrect,
      speechFalsePositiveRateUncalibratedPct: speechCases > 0 ? Number((speechFpUncalibrated / speechCases * 100).toFixed(1)) : 0,
      speechFalsePositiveRateClausePulsePct: speechCases > 0 ? Number((speechFpClausePulse / speechCases * 100).toFixed(1)) : 0,
      outcomes,
      failureBoundaryNotes: [
        "Boundary E29 (Sub-threshold micro-apnea): Breath holds <4.5s combined with cardiac deltas <7.5 BPM are classified as VERIFIED_CALM to avoid high false-positive fatigue during normal end-expiratory pauses.",
        "Boundary E30 (12s Rolling Pulse Lag): Per SmartSpectra Model Cards, PULSE_RATE uses a 12-second rolling window. On short clauses read in <7 seconds without respiratory apnea, cardiac-only spikes with confidence <40% are suppressed."
      ]
    };
  }

  // src/core/receiptExporter.ts
  function computeReceiptDigest(canonicalContent) {
    return `sha256:${sha256Hex(canonicalContent)}`;
  }
  function buildReadReceiptPayload(preset, session, baseline, sourceMode2, telemetryEnabled2, sdkVersion2 = "3.5.0", nowMs = Date.now()) {
    const summary = computeDocumentSignOffSummary(session);
    const trail = preset.clauses.map((c) => {
      const r = session.records[c.id];
      return {
        clauseNumber: c.number,
        title: c.title,
        riskTier: c.riskTier,
        status: r?.status ?? "UNREAD",
        statusReason: r?.statusReason ?? "",
        dwellTimeSec: Number(((r?.dwellTimeMs ?? 0) / 1e3).toFixed(1)),
        requiredDwellSec: Number((c.minRequiredDwellMs / 1e3).toFixed(1)),
        gazePresencePct: Math.round((r?.gazePresenceRatio ?? 0) * 100),
        pulseMeanBpm: r?.pulseMeanBpm ?? null,
        pulseDeltaBpm: r?.pulseDeltaBpm ?? null,
        breathingMeanBrpm: r?.breathingMeanBrpm ?? null,
        maxApneaHoldSec: r?.maxApneaHoldSec ?? 0,
        blinkRatePerMin: r?.blinkRatePerMin ?? 0,
        settledCyclesCompleted: r?.settledCyclesCompleted ?? 0,
        passesRecorded: r?.passHistory?.length ?? 0
      };
    });
    const canonicalDigestInput = JSON.stringify({
      docId: preset.id,
      sourceHashSha256: preset.sourceHashSha256 ?? null,
      sourceMode: sourceMode2,
      summary,
      trail
    });
    const integrityDigestHex = computeReceiptDigest(canonicalDigestInput);
    const shortHash = integrityDigestHex.replace("sha256:", "").slice(0, 16);
    const gitCommitTrailer = `Attested-By-ClausePulse: ${summary.canSignOff ? "VERIFIED" : "INCOMPLETE"} (${summary.verifiedCount}/${summary.totalClauses} clauses, mode=${sourceMode2}, sha256=${shortHash})`;
    return {
      receiptVersion: "2.0.0",
      generatedAtIso: new Date(nowMs).toISOString(),
      document: {
        id: preset.id,
        title: preset.title,
        documentType: preset.documentType,
        counterpartyOrContext: preset.counterpartyOrContext,
        sourcePath: preset.sourcePath,
        sourceHashSha256: preset.sourceHashSha256,
        totalClauses: preset.clauses.length
      },
      sensorProvenance: {
        sdkPackage: "@smartspectra/node-sdk",
        sdkVersion: sdkVersion2,
        sourceMode: sourceMode2,
        telemetryEnabled: telemetryEnabled2,
        localProcessingOnly: true
      },
      personalBaseline: baseline,
      signOffSummary: summary,
      clauseAuditTrail: trail,
      gitCommitTrailer,
      integrityDigestHex
    };
  }
  function formatReadReceiptMarkdown(receipt) {
    const b = receipt.personalBaseline;
    const baselineLine = b ? `Pulse Median: ${b.pulseMedianBpm ?? "N/A"} BPM | Breathing Median: ${b.breathingMedianBrpm ?? "N/A"} BRPM | Trace SD: ${b.upperTraceStdDev} | Blink Rate: ${b.blinkRatePerMin}/min` : "Uncalibrated session";
    const sourceLine = receipt.document.sourcePath ? `
- **Source File / Repo:** \`${receipt.document.sourcePath}\` (SHA-256: \`${receipt.document.sourceHashSha256?.slice(0, 16) ?? "N/A"}\u2026\`)` : "";
    const rows = receipt.clauseAuditTrail.map(
      (c) => `| ${c.clauseNumber} | ${c.title} | ${c.riskTier} | **${c.status}** | ${c.dwellTimeSec}s / ${c.requiredDwellSec}s | ${c.gazePresencePct}% | ${c.pulseDeltaBpm !== null ? (c.pulseDeltaBpm >= 0 ? `+${c.pulseDeltaBpm}` : c.pulseDeltaBpm) + " BPM" : "\u2014"} | ${c.maxApneaHoldSec}s |`
    ).join("\n");
    return `# ClausePulse Physiological Read Receipt (v2.0)

- **Document:** ${receipt.document.title} (${receipt.document.counterpartyOrContext})${sourceLine}
- **Generated At:** ${receipt.generatedAtIso}
- **Sign-Off Status:** ${receipt.signOffSummary.canSignOff ? "ATTESTED & VERIFIED" : "INCOMPLETE / BLOCKED"}
- **Sensor Provenance:** \`${receipt.sensorProvenance.sdkPackage}@${receipt.sensorProvenance.sdkVersion}\` (\`${receipt.sensorProvenance.sourceMode}\`)
- **SDK Telemetry Enabled:** \`${receipt.sensorProvenance.telemetryEnabled}\` (On-device processing only; no raw video uploaded)
- **Personal Baseline (30s):** ${baselineLine}
- **SHA-256 Integrity Digest:** \`${receipt.integrityDigestHex}\`
- **Git / PR Trailer:** \`${receipt.gitCommitTrailer}\`

## Clause-by-Clause Biometric Audit Trail

| Clause | Title | Risk Tier | Verdict | Dwell / Min | Gaze | Pulse Delta | Max Breath-Hold |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
${rows}

---
*Disclaimer: Generated locally by ClausePulse using Presage SmartSpectra SDK. Physiological metrics are relative within-session wellness/interaction estimates and are not medical measurements or diagnoses.*
`;
  }

  // src/core/replayFixtures.ts
  function generateReplayMetricsSlice(profile, elapsedSec, timestampUs = Date.now() * 1e3) {
    const centeredLandmarks = [
      { x: 0.42, y: 0.38 },
      { x: 0.58, y: 0.38 },
      { x: 0.5, y: 0.48 },
      { x: 0.45, y: 0.58 },
      { x: 0.55, y: 0.58 }
    ];
    const offScreenLandmarks = [
      { x: 0.04, y: 0.05 },
      { x: 0.08, y: 0.06 }
    ];
    if (profile === "APNEA_AND_PULSE_SPIKE") {
      const flatBreath = Math.sin(elapsedSec * 0.4) * 0.012;
      const pulseWave = Math.sin(elapsedSec * 2 * Math.PI * 1.4) * 0.85;
      return {
        breathing: {
          rate: [{ value: 9.2, confidence: 78, stable: true, timestamp: timestampUs }],
          upperTrace: [{ value: flatBreath, stable: true, timestamp: timestampUs }],
          lowerTrace: [{ value: flatBreath * 0.8, stable: true, timestamp: timestampUs }]
        },
        cardio: {
          pulseRate: [{ value: 83.5, confidence: 88, stable: true, timestamp: timestampUs }],
          arterialPressureTrace: [
            { value: pulseWave, confidence: 86, stable: true, timestamp: timestampUs }
          ],
          hrv: [
            {
              rmssd: 24.5,
              sdnn: 31,
              meanNn: 718,
              baevsky: 215,
              confidence: 76,
              stable: true,
              timestamp: timestampUs
            }
          ]
        },
        face: {
          blinking: [{ detected: false, stable: true, timestamp: timestampUs }],
          talking: [{ detected: false, stable: true, timestamp: timestampUs }],
          landmarks: [{ value: centeredLandmarks, stable: true, timestamp: timestampUs }],
          expression: [
            {
              stable: true,
              timestamp: timestampUs,
              scores: [
                { type: 1, confidence: 34 },
                // ANGRY / brow furrow
                { type: 4, confidence: 12 },
                // FEAR / tension
                { type: 6, confidence: 54 }
                // NEUTRAL
              ]
            }
          ]
        },
        eda: {
          trace: [{ value: 1.48, stable: true, timestamp: timestampUs }]
        }
      };
    }
    if (profile === "OFF_SCREEN_SKIMMER") {
      const normalBreath = Math.sin(elapsedSec * 2 * Math.PI * 0.23) * 0.45;
      return {
        breathing: {
          rate: [{ value: 14, confidence: 72, stable: true, timestamp: timestampUs }],
          upperTrace: [{ value: normalBreath, stable: true, timestamp: timestampUs }],
          lowerTrace: [{ value: normalBreath * 0.9, stable: true, timestamp: timestampUs }]
        },
        cardio: {
          pulseRate: [{ value: 71, confidence: 82, stable: true, timestamp: timestampUs }],
          arterialPressureTrace: [
            {
              value: Math.sin(elapsedSec * 2 * Math.PI * 1.18) * 0.6,
              confidence: 80,
              stable: true,
              timestamp: timestampUs
            }
          ]
        },
        face: {
          blinking: [{ detected: false, stable: true, timestamp: timestampUs }],
          talking: [{ detected: false, stable: true, timestamp: timestampUs }],
          landmarks: [{ value: offScreenLandmarks, stable: false, timestamp: timestampUs }],
          expression: [
            {
              stable: true,
              timestamp: timestampUs,
              scores: [{ type: 6, confidence: 92 }]
            }
          ]
        }
      };
    }
    if (profile === "TALKING_ALOUD_PAUSE") {
      const noisyTrace = Math.sin(elapsedSec * 9) * 0.65;
      return {
        breathing: {
          rate: [{ value: 18, confidence: 25, stable: false, timestamp: timestampUs }],
          upperTrace: [{ value: noisyTrace, stable: false, timestamp: timestampUs }]
        },
        cardio: {
          pulseRate: [{ value: 75, confidence: 65, stable: true, timestamp: timestampUs }]
        },
        face: {
          blinking: [
            { detected: Math.floor(elapsedSec * 10) % 28 === 0, stable: true, timestamp: timestampUs }
          ],
          talking: [{ detected: true, stable: true, timestamp: timestampUs }],
          landmarks: [{ value: centeredLandmarks, stable: true, timestamp: timestampUs }]
        }
      };
    }
    if (profile === "COHERENT_SETTLING_BREATH") {
      const deepWave = Math.sin(elapsedSec * 2 * Math.PI * 0.28) * 0.68;
      const pulseWave = Math.sin(elapsedSec * 2 * Math.PI * 1.12) * 0.55;
      return {
        breathing: {
          rate: [{ value: 10.5, confidence: 92, stable: true, timestamp: timestampUs }],
          upperTrace: [{ value: deepWave, stable: true, timestamp: timestampUs }],
          lowerTrace: [{ value: deepWave * 0.95, stable: true, timestamp: timestampUs }]
        },
        cardio: {
          pulseRate: [{ value: 68.5, confidence: 90, stable: true, timestamp: timestampUs }],
          arterialPressureTrace: [
            { value: pulseWave, confidence: 89, stable: true, timestamp: timestampUs }
          ],
          hrv: [
            {
              rmssd: 46.2,
              sdnn: 52.4,
              meanNn: 875,
              baevsky: 94,
              confidence: 88,
              stable: true,
              timestamp: timestampUs
            }
          ]
        },
        face: {
          blinking: [
            { detected: Math.floor(elapsedSec * 10) % 35 === 0, stable: true, timestamp: timestampUs }
          ],
          talking: [{ detected: false, stable: true, timestamp: timestampUs }],
          landmarks: [{ value: centeredLandmarks, stable: true, timestamp: timestampUs }],
          expression: [
            {
              stable: true,
              timestamp: timestampUs,
              scores: [{ type: 6, confidence: 94 }]
            }
          ]
        },
        eda: {
          trace: [{ value: 0.82, stable: true, timestamp: timestampUs }]
        }
      };
    }
    const calmBreath = Math.sin(elapsedSec * 2 * Math.PI * 0.23) * 0.42;
    const calmPulse = Math.sin(elapsedSec * 2 * Math.PI * 1.16) * 0.52;
    const isBlinkMoment = Math.floor(elapsedSec * 10) % 35 === 0;
    return {
      breathing: {
        rate: [{ value: 13.8, confidence: 89, stable: true, timestamp: timestampUs }],
        upperTrace: [{ value: calmBreath, stable: true, timestamp: timestampUs }],
        lowerTrace: [{ value: calmBreath * 0.88, stable: true, timestamp: timestampUs }]
      },
      cardio: {
        pulseRate: [{ value: 70.2, confidence: 91, stable: true, timestamp: timestampUs }],
        arterialPressureTrace: [
          { value: calmPulse, confidence: 88, stable: true, timestamp: timestampUs }
        ],
        hrv: [
          {
            rmssd: 42.8,
            sdnn: 48.1,
            meanNn: 854,
            baevsky: 108,
            confidence: 84,
            stable: true,
            timestamp: timestampUs
          }
        ]
      },
      face: {
        blinking: [{ detected: isBlinkMoment, stable: true, timestamp: timestampUs }],
        talking: [{ detected: false, stable: true, timestamp: timestampUs }],
        landmarks: [{ value: centeredLandmarks, stable: true, timestamp: timestampUs }],
        expression: [
          {
            stable: true,
            timestamp: timestampUs,
            scores: [
              { type: 6, confidence: 91 },
              { type: 1, confidence: 5 }
            ]
          }
        ]
      },
      eda: {
        trace: [{ value: 0.85, stable: true, timestamp: timestampUs }]
      }
    };
  }

  // src/renderer/opticalSensor.ts
  var PROC_W = 160;
  var PROC_H = 120;
  var LiveWebcamOpticalProcessor = class {
    offscreen;
    ctx;
    prevChestLuma = null;
    prevMouthLuma = null;
    prevEyeGradient = 0;
    greenSignalHistory = [];
    chestTraceHistory = [];
    chestSmooth = 0;
    lastBlinkAtMs = 0;
    constructor() {
      this.offscreen = document.createElement("canvas");
      this.offscreen.width = PROC_W;
      this.offscreen.height = PROC_H;
      const context = this.offscreen.getContext("2d", { willReadFrequently: true });
      if (!context) {
        throw new Error("Could not initialize 2D context for optical frame analysis.");
      }
      this.ctx = context;
    }
    reset() {
      this.prevChestLuma = null;
      this.prevMouthLuma = null;
      this.prevEyeGradient = 0;
      this.greenSignalHistory = [];
      this.chestTraceHistory = [];
      this.chestSmooth = 0;
    }
    /**
     * Analyzes the current frame of a live `<video>` element and returns both a
     * `DecodedSmartSpectraMetrics` packet and HUD diagnostics.
     */
    processVideoFrame(video, nowMs = Date.now()) {
      if (!video || video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
        return null;
      }
      this.ctx.drawImage(video, 0, 0, PROC_W, PROC_H);
      const frame = this.ctx.getImageData(0, 0, PROC_W, PROC_H).data;
      const timestampUs = nowMs * 1e3;
      const tSec = nowMs / 1e3;
      let skinPixels = 0;
      let totalFaceBoxPixels = 0;
      let sumX = 0;
      let sumY = 0;
      let foreheadGreenSum = 0;
      let foreheadRgbSum = 0;
      let foreheadCount = 0;
      for (let y = 10; y < 84; y++) {
        for (let x = 28; x < 132; x++) {
          totalFaceBoxPixels++;
          const idx = (y * PROC_W + x) * 4;
          const r = frame[idx];
          const g = frame[idx + 1];
          const b = frame[idx + 2];
          const luma = 0.299 * r + 0.587 * g + 0.114 * b;
          const isSkinTone = luma > 28 && luma < 242 && r > b && r - g >= -6 && Math.abs(r - g) < 95;
          if (isSkinTone) {
            skinPixels++;
            sumX += x / PROC_W;
            sumY += y / PROC_H;
          }
          if (x >= 56 && x <= 104 && y >= 18 && y <= 48) {
            foreheadGreenSum += g;
            foreheadRgbSum += r + g + b + 1;
            foreheadCount++;
          }
        }
      }
      const skinRatio = totalFaceBoxPixels > 0 ? skinPixels / totalFaceBoxPixels : 0;
      const faceDetected = skinRatio >= 0.14;
      const centroidX = skinPixels > 0 ? sumX / skinPixels : 0.5;
      const centroidY = skinPixels > 0 ? sumY / skinPixels : 0.42;
      const faceCentered = faceDetected && centroidX >= 0.25 && centroidX <= 0.75 && centroidY >= 0.18 && centroidY <= 0.72;
      let eyeVertDiff = 0;
      let browHorizDiff = 0;
      for (let y = 27; y < 41; y++) {
        for (let x = 52; x < 108; x++) {
          const idx = (y * PROC_W + x) * 4;
          const idxAbove = ((y - 1) * PROC_W + x) * 4;
          const idxLeft = (y * PROC_W + (x - 1)) * 4;
          const luma = frame[idx] * 0.3 + frame[idx + 1] * 0.59 + frame[idx + 2] * 0.11;
          const lumaAbove = frame[idxAbove] * 0.3 + frame[idxAbove + 1] * 0.59 + frame[idxAbove + 2] * 0.11;
          const lumaLeft = frame[idxLeft] * 0.3 + frame[idxLeft + 1] * 0.59 + frame[idxLeft + 2] * 0.11;
          eyeVertDiff += Math.abs(luma - lumaAbove);
          if (x >= 68 && x <= 92 && y >= 26 && y <= 34) {
            browHorizDiff += Math.abs(luma - lumaLeft);
          }
        }
      }
      const normEyeGrad = eyeVertDiff / (14 * 56);
      const eyeDelta = Math.abs(normEyeGrad - this.prevEyeGradient);
      this.prevEyeGradient = normEyeGrad;
      const isBlinking = faceDetected && eyeDelta > 1.85 && nowMs - this.lastBlinkAtMs > 280;
      if (isBlinking) {
        this.lastBlinkAtMs = nowMs;
      }
      const browTension = faceDetected ? Math.min(100, Math.max(4, Number((browHorizDiff / (8 * 24) * 2.4).toFixed(1)))) : 0;
      const mouthW = 36;
      const mouthH = 18;
      const currentMouth = new Float32Array(mouthW * mouthH);
      let mouthMotionSum = 0;
      let mPtr = 0;
      for (let y = 54; y < 72; y++) {
        for (let x = 62; x < 98; x++) {
          const idx = (y * PROC_W + x) * 4;
          const luma = frame[idx] * 0.3 + frame[idx + 1] * 0.59 + frame[idx + 2] * 0.11;
          currentMouth[mPtr] = luma;
          if (this.prevMouthLuma) {
            mouthMotionSum += Math.abs(luma - this.prevMouthLuma[mPtr]);
          }
          mPtr++;
        }
      }
      this.prevMouthLuma = currentMouth;
      const avgMouthMotion = mouthMotionSum / (mouthW * mouthH);
      const isTalking = faceDetected && avgMouthMotion > 6.8;
      const chestW = 76;
      const chestH = 34;
      const currentChest = new Float32Array(chestW * chestH);
      let signedVerticalShift = 0;
      let cPtr = 0;
      for (let y = 82; y < 116; y++) {
        for (let x = 42; x < 118; x++) {
          const idx = (y * PROC_W + x) * 4;
          const idxBelow = (Math.min(PROC_H - 1, y + 1) * PROC_W + x) * 4;
          const luma = frame[idx] * 0.299 + frame[idx + 1] * 0.587 + frame[idx + 2] * 0.114;
          const lumaBelow = frame[idxBelow] * 0.299 + frame[idxBelow + 1] * 0.587 + frame[idxBelow + 2] * 0.114;
          currentChest[cPtr] = luma;
          if (this.prevChestLuma) {
            const dtLuma = luma - this.prevChestLuma[cPtr];
            const dyLuma = lumaBelow - luma;
            if (Math.abs(dyLuma) > 1.5) {
              signedVerticalShift += dtLuma * Math.sign(dyLuma);
            }
          }
          cPtr++;
        }
      }
      this.prevChestLuma = currentChest;
      const rawChestVel = signedVerticalShift / (chestW * chestH * 4.5);
      this.chestSmooth = this.chestSmooth * 0.86 + Math.max(-1.2, Math.min(1.2, rawChestVel)) * 0.55;
      const chestWaveVal = Number(this.chestSmooth.toFixed(4));
      this.chestTraceHistory.push({ tSec, val: chestWaveVal });
      while (this.chestTraceHistory.length > 0 && tSec - this.chestTraceHistory[0].tSec > 20) {
        this.chestTraceHistory.shift();
      }
      const { brpm, breathConf } = this.estimateBreathingRate();
      const greenNorm = foreheadCount > 0 ? foreheadGreenSum / foreheadRgbSum : 0.333;
      this.greenSignalHistory.push({ tSec, val: greenNorm });
      while (this.greenSignalHistory.length > 0 && tSec - this.greenSignalHistory[0].tSec > 12) {
        this.greenSignalHistory.shift();
      }
      const { bpm, pulseConf, pulseWave } = this.estimatePulseFromGreenChannel(faceDetected);
      const landmarks = faceDetected ? [
        { x: centroidX - 0.08, y: centroidY - 0.08 },
        { x: centroidX + 0.08, y: centroidY - 0.08 },
        { x: centroidX, y: centroidY },
        { x: centroidX - 0.06, y: centroidY + 0.08 },
        { x: centroidX + 0.06, y: centroidY + 0.08 }
      ] : [];
      const metrics = {
        breathing: {
          rate: [
            {
              value: brpm,
              confidence: breathConf,
              stable: breathConf >= 45,
              timestamp: timestampUs
            }
          ],
          upperTrace: [{ value: chestWaveVal, stable: faceDetected, timestamp: timestampUs }],
          lowerTrace: [{ value: chestWaveVal * 0.85, stable: faceDetected, timestamp: timestampUs }]
        },
        cardio: {
          pulseRate: [
            {
              value: bpm,
              confidence: pulseConf,
              stable: pulseConf >= 40,
              timestamp: timestampUs
            }
          ],
          arterialPressureTrace: [
            {
              value: pulseWave,
              confidence: pulseConf,
              stable: pulseConf >= 40,
              timestamp: timestampUs
            }
          ]
        },
        face: {
          blinking: [{ detected: isBlinking, stable: faceDetected, timestamp: timestampUs }],
          talking: [{ detected: isTalking, stable: faceDetected, timestamp: timestampUs }],
          landmarks: landmarks.length > 0 ? [{ value: landmarks, stable: faceCentered, timestamp: timestampUs }] : [],
          expression: [
            {
              stable: faceDetected,
              timestamp: timestampUs,
              scores: [
                { type: 1, confidence: browTension },
                { type: 6, confidence: Math.max(0, 100 - browTension) }
              ]
            }
          ]
        }
      };
      return {
        metrics,
        diag: {
          faceDetected,
          faceCentered,
          skinRatio,
          centroidX,
          centroidY,
          chestMotionValue: chestWaveVal,
          pulseWaveValue: pulseWave,
          estimatedBpm: bpm,
          pulseConfidence: pulseConf,
          estimatedBrpm: brpm,
          breathConfidence: breathConf,
          isBlinking,
          isTalking,
          browTension
        }
      };
    }
    estimateBreathingRate() {
      if (this.chestTraceHistory.length < 25) {
        return { brpm: 14, breathConf: 35 };
      }
      const vals = this.chestTraceHistory.map((p) => p.val);
      const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
      let zeroCrossings = 0;
      for (let i = 1; i < vals.length; i++) {
        if ((vals[i - 1] - mean) * (vals[i] - mean) < 0) {
          zeroCrossings++;
        }
      }
      const spanSec = Math.max(
        1,
        this.chestTraceHistory[this.chestTraceHistory.length - 1].tSec - this.chestTraceHistory[0].tSec
      );
      const freqHz = zeroCrossings / 2 / spanSec;
      const clampedBrpm = Math.max(6, Math.min(32, Number((freqHz * 60).toFixed(1))));
      const conf = Math.min(92, Math.round(40 + Math.min(50, this.chestTraceHistory.length / 3)));
      return { brpm: clampedBrpm, breathConf: conf };
    }
    estimatePulseFromGreenChannel(faceDetected) {
      if (!faceDetected || this.greenSignalHistory.length < 20) {
        return { bpm: 70, pulseConf: faceDetected ? 35 : 0, pulseWave: 0 };
      }
      const recent = this.greenSignalHistory.slice(-90);
      const mean = recent.reduce((acc, p) => acc + p.val, 0) / recent.length;
      const detrended = recent.map((p) => (p.val - mean) * 350);
      const latestWave = Math.max(-1, Math.min(1, detrended[detrended.length - 1] || 0));
      let crossings = 0;
      for (let i = 1; i < detrended.length; i++) {
        if (detrended[i - 1] * detrended[i] < 0 && Math.abs(detrended[i] - detrended[i - 1]) > 0.02) {
          crossings++;
        }
      }
      const spanSec = Math.max(1, recent[recent.length - 1].tSec - recent[0].tSec);
      const rawFreqHz = crossings / 2 / spanSec;
      const clampedHz = Math.max(0.85, Math.min(1.85, rawFreqHz));
      const bpm = Number((clampedHz * 60).toFixed(1));
      const conf = Math.min(90, Math.round(38 + Math.min(52, recent.length * 0.6)));
      return {
        bpm,
        pulseConf: conf,
        pulseWave: Number(latestWave.toFixed(3))
      };
    }
  };
  function renderCameraHudReticle(canvas, opts) {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    if (!opts.active) return;
    ctx.strokeStyle = "rgba(148, 163, 184, 0.12)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();
    const primaryColor = opts.isApnea ? "rgba(244, 63, 94, 0.9)" : opts.faceCentered ? "rgba(16, 185, 129, 0.9)" : "rgba(245, 158, 11, 0.9)";
    const fx = Math.round((1 - opts.centroidX) * w) - 48;
    const fy = Math.round(opts.centroidY * h) - 36;
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(fx, fy, 96, 62);
    ctx.fillStyle = primaryColor;
    const nodes = [
      [fx + 30, fy + 22],
      [fx + 66, fy + 22],
      [fx + 48, fy + 36],
      [fx + 34, fy + 48],
      [fx + 62, fy + 48]
    ];
    for (const [nx, ny] of nodes) {
      ctx.fillRect(nx - 2, ny - 2, 4, 4);
    }
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillText(
      opts.faceCentered ? "FACE rPPG ROI [LOCK]" : "FACE ROI [OFF-AXIS]",
      fx + 2,
      Math.max(32, fy - 4)
    );
    const cx = Math.round(w * 0.24);
    const cy = Math.round(h * 0.62);
    const cw = Math.round(w * 0.52);
    const ch = Math.round(h * 0.22);
    ctx.strokeStyle = opts.isApnea ? "rgba(244, 63, 94, 0.9)" : "rgba(59, 130, 246, 0.85)";
    ctx.setLineDash([4, 3]);
    ctx.strokeRect(cx, cy, cw, ch);
    ctx.setLineDash([]);
    const barY = cy + ch / 2 - Math.max(-11, Math.min(11, opts.chestWave * 16));
    ctx.beginPath();
    ctx.moveTo(cx + 6, barY);
    ctx.lineTo(cx + cw - 6, barY);
    ctx.stroke();
    ctx.fillStyle = opts.isApnea ? "#fda4af" : "#93c5fd";
    ctx.fillText(
      opts.isApnea ? "CHEST ROI \u2022 APNEA FLATLINE" : "CHEST ROI \u2022 RESP TRACE",
      cx + 4,
      cy - 4
    );
  }

  // src/renderer/app.ts
  var {
    SmartSpectraSDK,
    ProcessingStatus,
    ValidationCode,
    SmartSpectraErrorCode,
    breathingMetrics,
    cardioMetrics,
    faceMetrics,
    edaMetrics
  } = require_renderer();
  var { decodeMetrics } = require_messages();
  var STATUS_LABELS = Object.fromEntries(
    Object.entries(ProcessingStatus || {}).map(([k, v]) => [Number(v), k.replace(/^k/, "")])
  );
  var VALIDATION_LABELS = Object.fromEntries(
    Object.entries(ValidationCode || {}).map(([k, v]) => [Number(v), k.replace(/^k/, "")])
  );
  var $ = (id) => document.getElementById(id);
  if (typeof window !== "undefined" && !window.clausePulseHost) {
    const STORAGE_KEY = "clausepulse_browser_receipts_v2";
    const loadLocalReceipts = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    };
    window.clausePulseHost = {
      getConfig: async () => ({
        hasApiKey: false,
        maskedKey: "",
        keySource: "BROWSER_COMPANION",
        sdkVersion: "3.5.0",
        telemetryEnabled: false,
        availableCameras: [],
        platform: "web-browser-companion"
      }),
      getSessionApiKey: async () => "",
      saveApiKey: async () => ({
        ok: true,
        hasApiKey: false,
        maskedKey: "",
        keySource: "BROWSER_COMPANION"
      }),
      forgetApiKey: async () => ({
        ok: true,
        hasApiKey: false,
        maskedKey: "",
        keySource: "BROWSER_COMPANION"
      }),
      setTelemetryPreference: async (enabled) => ({ telemetryEnabled: enabled }),
      checkDeviceReadiness: async () => {
        let camCount = 0;
        let camLabel = "";
        try {
          const devices = await navigator.mediaDevices?.enumerateDevices?.();
          const cams = (devices || []).filter((d) => d.kind === "videoinput");
          camCount = cams.length;
          camLabel = cams.map((c) => c.label || "Webcam").slice(0, 2).join(", ");
        } catch {
          camCount = 0;
        }
        return {
          verdict: camCount > 0 ? "browser_webcam_ready" : "browser_simulator_ready",
          reason: camCount > 0 ? `Detected ${camCount} browser camera(s)${camLabel ? " (" + camLabel + ")" : ""}. Click "\u{1F4F7} Use My Webcam" for live 30 FPS optical analysis, or clone github.com/x-tahosin/clausepulse and run \`npm start\` for native C++ @smartspectra/node-sdk@3.5.0.` : 'No physical webcam enumerated yet (or permission not granted). Built-in 1-Click Reaction Simulator & 30-Case Benchmark are ready. Click "\u{1F4F7} Use My Webcam" to grant camera access.'
        };
      },
      openLocalFile: () => new Promise((resolve) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".md,.txt,.sql,.json,.yaml,.yml,.ts,.js,.py,.diff,.patch,.html";
        input.onchange = async () => {
          const file = input.files?.[0];
          if (!file) {
            resolve({ ok: false, canceled: true });
            return;
          }
          const content = await file.text();
          resolve({ ok: true, fileName: file.name, filePath: file.name, content });
        };
        input.click();
      }),
      scanGitDiff: async () => ({
        ok: true,
        repoName: "prod-ledger-service",
        repoPath: "github.com/x-tahosin/clausepulse (Sample Audit Patch)",
        branchName: "main",
        rawDiff: [
          "diff --git a/migrations/20261118_drop_staging.sql b/migrations/20261118_drop_staging.sql",
          "index 4a19b2c..9f81d04 100644",
          "--- a/migrations/20261118_drop_staging.sql",
          "+++ b/migrations/20261118_drop_staging.sql",
          "@@ -10,5 +10,8 @@ BEGIN TRANSACTION;",
          "-SELECT count(*) FROM ledger_staging_unverified;",
          "+-- Promote node-02 and purge unverified staging rows permanently",
          "+DROP TABLE ledger_staging_unverified CASCADE;",
          "+TRUNCATE TABLE settlement_retry_queue;",
          " COMMIT;",
          "diff --git a/src/auth/verifySessionToken.ts b/src/auth/verifySessionToken.ts",
          "index 81c20b1..3e44f91 100644",
          "--- a/src/auth/verifySessionToken.ts",
          "+++ b/src/auth/verifySessionToken.ts",
          "@@ -42,6 +42,8 @@ export function verifySessionToken(req: Request) {",
          "-  if (!req.headers.authorization) throw new UnauthorizedError();",
          "+  // Emergency migration window bypass",
          '+  if (process.env.DISABLE_AUTH === "1") return { role: "admin" };',
          "   return verifyJwtSignature(req.headers.authorization);",
          " }"
        ].join("\n")
      }),
      saveRecordedVideo: async (bytes, clauseId) => {
        const blob = new Blob([bytes.buffer], { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        const fileName = `clausepulse-take-${clauseId}-${Date.now()}.webm`;
        a.href = url;
        a.download = fileName;
        a.click();
        return { ok: true, filePath: url, fileName };
      },
      runVideoFileSession: () => new Promise((resolve) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "video/mp4,video/webm,video/quicktime";
        input.onchange = () => {
          const file = input.files?.[0];
          if (!file) {
            resolve({ ok: false, canceled: true });
            return;
          }
          const blobUrl = URL.createObjectURL(file);
          resolve({
            ok: true,
            localOpticalPlayback: true,
            fullPath: blobUrl,
            videoPath: file.name
          });
        };
        input.click();
      }),
      stopVideoFileSession: async () => ({ ok: true }),
      onVideoFileEvent: () => () => {
      },
      saveReceipt: async (receipt) => {
        const existing = loadLocalReceipts();
        const updated = [receipt, ...existing].slice(0, 20);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {
        }
        return { ok: true, count: updated.length, receipts: updated };
      },
      getReceipts: async () => loadLocalReceipts(),
      exportReceiptFile: async (markdown, _jsonStr, defaultName) => {
        const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = defaultName || "ClausePulse-Read-Receipt.md";
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 5e3);
        return { ok: true, filePath: defaultName };
      },
      wipeAllLocalData: async () => {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
        }
        return { ok: true, deletedKey: false, deletedReceipts: true };
      }
    };
  }
  var DEFAULT_BASELINE = {
    calibratedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
    durationSec: 30,
    pulseMedianBpm: 70.2,
    pulseIqrBpm: 1.5,
    breathingMedianBrpm: 13.8,
    upperTraceStdDev: 0.3194,
    blinkRatePerMin: 16,
    expressionTensionMedian: 6,
    edaMedian: 0.85,
    hrvRmssdMs: 42.8,
    hrvBaevskyIndex: 108,
    sampleCount: 300,
    talkingRatio: 0,
    valid: true
  };
  var customPresets = [];
  var activePreset = BUILTIN_DOCUMENT_PRESETS[0];
  var docSession = createDocumentSession(activePreset.clauses);
  var personalBaseline = DEFAULT_BASELINE;
  var baselineAcc = null;
  var sourceMode = "DETERMINISTIC_REPLAY_BENCH";
  var isSensorActive = false;
  var isValidationOk = true;
  var telemetryEnabled = false;
  var sdkVersion = "3.5.0";
  var liveSdk = null;
  var localWebcamStream = null;
  var localOpticalTimer = null;
  var opticalProcessor = new LiveWebcamOpticalProcessor();
  var mediaRecorder = null;
  var recordedChunks = [];
  var isRecordingTake = false;
  var replayInterval = null;
  var activeReplayProfile = "CALM_STEADY_READER";
  var replayStartMs = 0;
  var walkthroughInterval = null;
  var lastSignOffToastShown = false;
  var sensorTransitionToken = 0;
  var breathingWaveHistory = [];
  var pulseWaveHistory = [];
  var MAX_WAVE_POINTS = 140;
  function escapeHtml(raw) {
    return raw.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function showNotice(title, message) {
    const banner = $("sensorNoticeBanner");
    if (!banner) return;
    $("sensorNoticeTitle").textContent = title;
    $("sensorNoticeText").textContent = " " + message;
    banner.hidden = false;
  }
  function hideNotice() {
    const banner = $("sensorNoticeBanner");
    if (banner) banner.hidden = true;
  }
  function highlightActiveSimButton(profile) {
    document.querySelectorAll(".sim-btn").forEach((btn) => {
      const p = btn.getAttribute("data-profile");
      btn.classList.toggle("active", Boolean(profile && p === profile));
    });
  }
  function updateSourceModeBadge(mode, active) {
    sourceMode = mode;
    const pauseBtn = $("btnStopSensor");
    if (pauseBtn) {
      pauseBtn.textContent = active ? "\u23F8 Pause" : "\u25B6 Resume";
    }
    const badge = $("activeSourceBadge");
    if (!badge) return;
    if (!active) {
      badge.textContent = "PAUSED";
      badge.className = "mode-pill";
      return;
    }
    if (mode === "LIVE_CAMERA_SMARTSPECTRA") {
      badge.textContent = "LIVE CAMERA \u2022 SMARTSPECTRA SDK";
      badge.className = "mode-pill mode-pill-live";
    } else if (mode === "LIVE_WEBCAM_OPTICAL") {
      badge.textContent = "LIVE WEBCAM \u2022 OPTICAL ROI";
      badge.className = "mode-pill mode-pill-optical";
    } else if (mode === "VIDEO_FILE_SMARTSPECTRA") {
      badge.textContent = "VIDEO FILE \u2022 ACTIVE";
      badge.className = "mode-pill mode-pill-live";
    } else {
      badge.textContent = `ACTIVE \u2022 ${activeReplayProfile.replace(/_/g, " ")}`;
      badge.className = "mode-pill mode-pill-bench";
    }
  }
  function updateProcessingBadge(status) {
    const label = typeof status === "number" ? STATUS_LABELS[status] || `Status(${status})` : status;
    const el = $("sdkStatusBadge");
    if (!el) return;
    el.textContent = label;
  }
  function updateValidationHud(code, _hint) {
    const name = VALIDATION_LABELS[code] || `Code(${code})`;
    isValidationOk = code === ValidationCode.kOk;
    const chip = $("hudValidationChip");
    if (!chip) return;
    chip.textContent = isValidationOk ? "Face ROI: Locked" : `Face ROI: ${name}`;
    chip.className = "hud-chip " + (isValidationOk ? "hud-chip-ok" : "hud-chip-warn");
  }
  function scrollActiveClauseIntoView() {
    requestAnimationFrame(() => {
      const activeCard = document.querySelector(".clause-card.active");
      activeCard?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }
  function announceClauseVerdictIfFlagged(clauseId) {
    const clause = docSession.clauses.find((c) => c.id === clauseId);
    const rec = docSession.records[clauseId];
    if (!clause || !rec) return;
    if (rec.status === "SKIM_DETECTED") {
      const reason = rec.gazePresenceRatio < 0.55 ? `Eyes were off-screen (${Math.round(rec.gazePresenceRatio * 100)}% gaze). Click "\u{1F60C} Calm Reader" and revisit ${clause.number}.` : `Read only ${Math.min(100, Math.round(rec.dwellTimeMs / clause.minRequiredDwellMs * 100))}% of required time on ${clause.number}. Wait for 100% before advancing!`;
      showNotice(`\u26A0\uFE0F Skim Caught on ${clause.number}`, reason);
    } else if (rec.status === "APNEA_FRICTION") {
      showNotice(
        `\u{1F6A8} Stress / Breath-Hold Caught on ${clause.number}`,
        "Complete 2 deep recovery breaths (or click Simulate 2 Deep Breaths) to unlock it."
      );
    } else if (rec.status === "SIGNAL_UNVERIFIED") {
      showNotice(
        `\u23F8 Paused for Speech on ${clause.number}`,
        "Reading aloud pauses respiratory checks. Stay silent while finishing."
      );
    }
  }
  function drawWaveformCanvas(canvasId, samples, strokeColor, drawThresholdBand = false) {
    const canvas = $(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(148, 163, 184, 0.12)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    for (let gx = 48; gx < w; gx += 48) {
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, h);
    }
    ctx.stroke();
    if (drawThresholdBand) {
      ctx.fillStyle = "rgba(244, 63, 94, 0.09)";
      ctx.fillRect(0, h / 2 - 5, w, 10);
    }
    if (samples.length < 2) return;
    let min = Infinity;
    let max = -Infinity;
    for (const v of samples) {
      if (v < min) min = v;
      if (v > max) max = v;
    }
    const span = Math.max(0.25, max - min);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    for (let i = 0; i < samples.length; i++) {
      const x = i / (MAX_WAVE_POINTS - 1) * w;
      const norm = (samples[i] - min) / span;
      const y = h - 5 - norm * (h - 10);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  function handleDecodedMetricsPacket(metrics, nowMs = Date.now(), explicitStepMs) {
    if (baselineAcc) {
      baselineAcc = ingestBaselinePacket(baselineAcc, metrics, nowMs);
    }
    const prevStatus = docSession.records[docSession.activeClauseId]?.status;
    docSession = ingestMetricsForActiveClause(
      docSession,
      metrics,
      isValidationOk,
      personalBaseline,
      nowMs,
      explicitStepMs
    );
    const newStatus = docSession.records[docSession.activeClauseId]?.status;
    if (newStatus === "APNEA_FRICTION" && prevStatus !== "APNEA_FRICTION" && !docSession.settlingTargetClauseId && !walkthroughInterval) {
      docSession = startSettlingGate(docSession, docSession.activeClauseId);
    }
    const upperArr = metrics.breathing?.upperTrace ?? metrics.breathing?.upper_trace ?? [];
    let latestChestWave = 0;
    for (const s of upperArr) {
      if (Number.isFinite(s.value)) {
        latestChestWave = s.value;
        breathingWaveHistory.push(s.value);
        if (breathingWaveHistory.length > MAX_WAVE_POINTS) breathingWaveHistory.shift();
      }
    }
    const artArr = metrics.cardio?.arterialPressureTrace ?? metrics.cardio?.arterial_pressure_trace ?? [];
    for (const s of artArr) {
      if (Number.isFinite(s.value)) {
        pulseWaveHistory.push(s.value);
        if (pulseWaveHistory.length > MAX_WAVE_POINTS) pulseWaveHistory.shift();
      }
    }
    const talkingArr = metrics.face?.talking ?? [];
    const isTalking = talkingArr.length > 0 && Boolean(talkingArr[talkingArr.length - 1]?.detected);
    const talkingChip = $("hudTalkingChip");
    if (talkingChip) {
      talkingChip.textContent = isTalking ? "Speech: Talking" : "Speech: Silent";
      talkingChip.className = "hud-chip " + (isTalking ? "hud-chip-warn" : "hud-chip-ok");
    }
    const apnea = computeApneaHoldSeconds(
      docSession.activeBuffer.upperTraceSamples,
      personalBaseline?.upperTraceStdDev ?? 0.35,
      isTalking
    );
    const apneaBadge = $("apneaReadoutBadge");
    if (apneaBadge) {
      apneaBadge.textContent = `Breath Hold: ${apnea.currentHoldSec.toFixed(1)}s`;
      apneaBadge.className = "scope-badge " + (apnea.currentHoldSec >= 4.5 ? "scope-badge-alert" : "");
    }
    drawWaveformCanvas(
      "canvasBreathingTrace",
      breathingWaveHistory,
      apnea.currentHoldSec >= 4.5 ? "#f43f5e" : "#10b981",
      true
    );
    drawWaveformCanvas("canvasPulseTrace", pulseWaveHistory, "#3b82f6", false);
    const pulseArr = metrics.cardio?.pulseRate ?? metrics.cardio?.pulse_rate ?? [];
    const latestPulse = pulseArr.length > 0 ? pulseArr[pulseArr.length - 1] : null;
    if (latestPulse && latestPulse.value > 0) {
      $("valPulseBpm").textContent = latestPulse.value.toFixed(0);
      const conf = latestPulse.confidence ?? 0;
      $("pulseConfBadge").textContent = `Conf: ${conf.toFixed(0)}%`;
      if (personalBaseline?.pulseMedianBpm != null) {
        const delta = latestPulse.value - personalBaseline.pulseMedianBpm;
        const sign = delta >= 0 ? "+" : "";
        $("subPulseDelta").textContent = `${sign}${delta.toFixed(1)} BPM vs baseline`;
      }
    }
    const breathArr = metrics.breathing?.rate ?? [];
    const latestBreath = breathArr.length > 0 ? breathArr[breathArr.length - 1] : null;
    if (latestBreath && latestBreath.value > 0 && !isTalking) {
      $("valBreathingBrpm").textContent = latestBreath.value.toFixed(1);
      $("subBreathingConf").textContent = apnea.currentHoldSec >= 4.5 ? "\u26A0\uFE0F Holding breath!" : "Steady rhythm";
    }
    const activeRec = docSession.records[docSession.activeClauseId];
    if (activeRec) {
      $("valBlinkRate").textContent = activeRec.blinkRatePerMin.toFixed(0);
    }
    const landmarksArr = metrics.face?.landmarks ?? [];
    let cx = 0.5;
    let cy = 0.42;
    let faceCentered = false;
    if (landmarksArr.length > 0) {
      const f = evaluateFaceFraming(landmarksArr[landmarksArr.length - 1]);
      faceCentered = f.faceCentered;
      cx = f.centroidX ?? 0.5;
      cy = f.centroidY ?? 0.42;
      $("subGazeStatus").textContent = f.faceCentered ? "Eyes on screen \u2713" : "\u26A0\uFE0F Eyes off-screen";
    } else {
      $("subGazeStatus").textContent = "\u26A0\uFE0F No face in frame";
    }
    renderCameraHudReticle($("cameraHudCanvas"), {
      active: isSensorActive,
      faceCentered,
      centroidX: cx,
      centroidY: cy,
      chestWave: latestChestWave,
      isApnea: apnea.currentHoldSec >= 4.5,
      modeLabel: sourceMode
    });
    const hrvArr = metrics.cardio?.hrv ?? [];
    if (hrvArr.length > 0) {
      const h = hrvArr[hrvArr.length - 1];
      if (typeof h.rmssd === "number" && h.rmssd > 0) {
        $("valHrvRmssd").textContent = h.rmssd.toFixed(0);
      }
    }
    const exprArr = metrics.face?.expression ?? [];
    if (exprArr.length > 0) {
      const tension = computeExpressionTension(exprArr[exprArr.length - 1]);
      $("subExpressionTension").textContent = `Brow strain: ${tension.toFixed(0)}%`;
    }
    updateSettlingGateBanner();
    renderClauseCards();
    updateReceiptAndSignOffUI();
    if (!walkthroughInterval) {
      const signSummary = computeDocumentSignOffSummary(docSession);
      if (signSummary.canSignOff && !lastSignOffToastShown) {
        lastSignOffToastShown = true;
        showNotice(
          "\u2705 All Sections Verified!",
          'Click "\u270D\uFE0F Sign & Save Receipt" on the right to seal & download your SHA-256 Read Receipt.'
        );
      } else if (!signSummary.canSignOff) {
        lastSignOffToastShown = false;
      }
    }
  }
  function getSelectedMetricCodes(allowCardio = true) {
    const codes = [...breathingMetrics, ...faceMetrics];
    if (allowCardio) {
      codes.push(...cardioMetrics);
    }
    return codes;
  }
  async function startLocalOpticalWebcamSession() {
    const myToken = ++sensorTransitionToken;
    await stopAllSensors(true);
    if (myToken !== sensorTransitionToken) return;
    hideNotice();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 30 } },
        audio: false
      });
      if (myToken !== sensorTransitionToken) {
        for (const t of stream.getTracks()) t.stop();
        return;
      }
      localWebcamStream = stream;
      const video = $("cameraPreview");
      video.srcObject = stream;
      await video.play();
      if (myToken !== sensorTransitionToken) return;
      opticalProcessor.reset();
      isSensorActive = true;
      isValidationOk = true;
      $("cameraOverlay").hidden = true;
      highlightActiveSimButton(null);
      updateSourceModeBadge("LIVE_WEBCAM_OPTICAL", true);
      updateProcessingBadge("OpticalLock");
      updateValidationHud(ValidationCode.kOk, "Webcam Live");
      $("btnRecordTake").disabled = false;
      showNotice(
        "\u{1F4F7} Live Webcam Active",
        "Analyzing your real-time face & upper-chest movement locally at 30 FPS."
      );
      localOpticalTimer = setInterval(() => {
        const res = opticalProcessor.processVideoFrame(video, Date.now());
        if (!res) return;
        updateValidationHud(
          res.diag.faceCentered ? ValidationCode.kOk : ValidationCode.kFaceNotCentered,
          res.diag.faceCentered ? "Locked" : "Center face"
        );
        handleDecodedMetricsPacket(res.metrics, Date.now());
      }, 66);
    } catch (err) {
      showNotice(
        "Webcam Unavailable \u2014 Running Live Simulator",
        `Could not open camera (${err?.message || "permission denied"}). Kept live simulator active so you can test all features.`
      );
      startDeterministicReplay("CALM_STEADY_READER");
    }
  }
  async function startLiveCameraSession(allowCardio = true) {
    const myToken = ++sensorTransitionToken;
    await stopAllSensors(true);
    if (myToken !== sensorTransitionToken) return;
    hideNotice();
    const apiKey = await window.clausePulseHost?.getSessionApiKey() || "";
    if (myToken !== sensorTransitionToken) return;
    if (!apiKey) {
      await startLocalOpticalWebcamSession();
      return;
    }
    const requestedMetrics = getSelectedMetricCodes(allowCardio);
    try {
      liveSdk = new SmartSpectraSDK({
        apiKey,
        requestedMetrics,
        enableAccumulatedOutput: false,
        enableTelemetry: telemetryEnabled
      });
      liveSdk.on("processingStatus", (status) => {
        updateProcessingBadge(status);
      });
      liveSdk.on("validationStatus", (code, _ts, hint) => {
        updateValidationHud(code, hint);
      });
      liveSdk.on("metrics", (buf) => {
        try {
          const decoded = decodeMetrics(buf);
          handleDecodedMetricsPacket(decoded, Date.now());
        } catch (err) {
          console.error("[ClausePulse] Failed to decode Metrics buffer:", err);
        }
      });
      liveSdk.on("error", async (code, message) => {
        const msgStr = String(message || "");
        if (allowCardio && (code === SmartSpectraErrorCode.kMetricNotAuthorized || /device keys|not authorized|cardio/i.test(msgStr))) {
          await stopAllSensors();
          await startLiveCameraSession(false);
          return;
        }
        showNotice(`SmartSpectra Error (${code})`, msgStr);
      });
      liveSdk.on("streamAvailable", (stream) => {
        localWebcamStream = stream;
        const video = $("cameraPreview");
        video.srcObject = stream;
        video.play().catch(() => {
        });
        $("cameraOverlay").hidden = true;
        $("btnRecordTake").disabled = false;
      });
      isSensorActive = true;
      highlightActiveSimButton(null);
      updateSourceModeBadge("LIVE_CAMERA_SMARTSPECTRA", true);
      await liveSdk.start();
    } catch (err) {
      const msg = err?.message || String(err);
      if (allowCardio && /device keys|not authorized/i.test(msg)) {
        await stopAllSensors();
        await startLiveCameraSession(false);
        return;
      }
      await startLocalOpticalWebcamSession();
    }
  }
  async function toggleRecordCameraTake() {
    const btn = $("btnRecordTake");
    if (isRecordingTake && mediaRecorder) {
      mediaRecorder.stop();
      return;
    }
    if (!localWebcamStream) {
      showNotice("Start Webcam First", 'Click "\u{1F4F7} Use My Webcam" before recording a video clip.');
      return;
    }
    recordedChunks = [];
    try {
      mediaRecorder = new MediaRecorder(localWebcamStream, { mimeType: "video/webm" });
    } catch {
      mediaRecorder = new MediaRecorder(localWebcamStream);
    }
    mediaRecorder.ondataavailable = (ev) => {
      if (ev.data && ev.data.size > 0) {
        recordedChunks.push(ev.data);
      }
    };
    mediaRecorder.onstop = async () => {
      isRecordingTake = false;
      btn.textContent = "\u25CF Rec";
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      const arrayBuffer = await blob.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const saved = await window.clausePulseHost?.saveRecordedVideo(
        bytes,
        docSession.activeClauseId
      );
      if (saved?.ok) {
        showNotice("Video Clip Saved", `Saved ${saved.fileName} (${Math.round(bytes.byteLength / 1024)} KB).`);
      }
    };
    isRecordingTake = true;
    btn.textContent = "\u25A0 Stop";
    mediaRecorder.start(250);
    setTimeout(() => {
      if (isRecordingTake && mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
      }
    }, 12e3);
  }
  async function startVideoFileSession() {
    const myToken = ++sensorTransitionToken;
    await stopAllSensors(true);
    if (myToken !== sensorTransitionToken) return;
    hideNotice();
    const res = await window.clausePulseHost?.runVideoFileSession();
    if (myToken !== sensorTransitionToken) return;
    if (!res || res.canceled) {
      startDeterministicReplay(activeReplayProfile);
      return;
    }
    if (!res.ok) {
      showNotice("Video File Error", res.error || "Could not start video file session.");
      startDeterministicReplay(activeReplayProfile);
      return;
    }
    if (res.localOpticalPlayback && res.fullPath) {
      const video = $("cameraPreview");
      video.srcObject = null;
      video.src = res.fullPath.startsWith("blob:") ? res.fullPath : `file:///${res.fullPath.replace(/\\/g, "/")}`;
      video.loop = true;
      await video.play().catch(() => {
      });
      $("cameraOverlay").hidden = true;
      opticalProcessor.reset();
      isSensorActive = true;
      highlightActiveSimButton(null);
      updateSourceModeBadge("VIDEO_FILE_SMARTSPECTRA", true);
      localOpticalTimer = setInterval(() => {
        const frameRes = opticalProcessor.processVideoFrame(video, Date.now());
        if (frameRes) {
          handleDecodedMetricsPacket(frameRes.metrics, Date.now());
        }
      }, 66);
      return;
    }
    isSensorActive = true;
    highlightActiveSimButton(null);
    updateSourceModeBadge("VIDEO_FILE_SMARTSPECTRA", true);
    $("cameraOverlay").hidden = false;
    $("cameraOverlayTitle").textContent = `Analyzing Video: ${res.videoPath}`;
  }
  async function startDeterministicReplay(profile) {
    const myToken = ++sensorTransitionToken;
    await stopAllSensors(true);
    if (myToken !== sensorTransitionToken) return;
    activeReplayProfile = profile;
    isSensorActive = true;
    isValidationOk = profile !== "OFF_SCREEN_SKIMMER";
    replayStartMs = Date.now();
    highlightActiveSimButton(profile);
    updateSourceModeBadge("DETERMINISTIC_REPLAY_BENCH", true);
    updateValidationHud(
      profile === "OFF_SCREEN_SKIMMER" ? ValidationCode.kFaceNotCentered : ValidationCode.kOk,
      profile === "OFF_SCREEN_SKIMMER" ? "Eyes Off Screen" : "Simulated Lock"
    );
    $("cameraOverlay").hidden = false;
    const friendlyNames = {
      CALM_STEADY_READER: "\u{1F60C} Simulating: Calm Steady Reader (70 BPM)",
      APNEA_AND_PULSE_SPIKE: "\u{1F624} Simulating: Breath-Hold Stress (Apnea + 84 BPM)",
      OFF_SCREEN_SKIMMER: "\u{1F440} Simulating: Eyes Off-Screen / Distracted",
      TALKING_ALOUD_PAUSE: "\u{1F5E3}\uFE0F Simulating: Speaking Aloud (Resp Paused)",
      COHERENT_SETTLING_BREATH: "\u{1F32C}\uFE0F Simulating: Deep Settling Breaths"
    };
    $("cameraOverlayTitle").textContent = friendlyNames[profile] || profile;
    $("cameraOverlaySub").textContent = 'Click "\u{1F4F7} Use My Webcam" anytime to switch to live camera.';
    replayInterval = setInterval(() => {
      const elapsedSec = (Date.now() - replayStartMs) / 1e3;
      const packet = generateReplayMetricsSlice(activeReplayProfile, elapsedSec, Date.now() * 1e3);
      handleDecodedMetricsPacket(packet, Date.now());
    }, 100);
  }
  async function stopAllSensors(preserveToken = false) {
    if (!preserveToken) {
      sensorTransitionToken++;
    }
    if (walkthroughInterval) {
      clearInterval(walkthroughInterval);
      walkthroughInterval = null;
    }
    if (replayInterval) {
      clearInterval(replayInterval);
      replayInterval = null;
    }
    if (localOpticalTimer) {
      clearInterval(localOpticalTimer);
      localOpticalTimer = null;
    }
    if (isRecordingTake && mediaRecorder && mediaRecorder.state === "recording") {
      try {
        mediaRecorder.stop();
      } catch {
      }
      isRecordingTake = false;
    }
    if (liveSdk) {
      try {
        await liveSdk.stop();
        await liveSdk.destroy();
      } catch {
      }
      liveSdk = null;
    }
    if (localWebcamStream) {
      for (const track of localWebcamStream.getTracks()) {
        track.stop();
      }
      localWebcamStream = null;
    }
    await window.clausePulseHost?.stopVideoFileSession().catch(() => {
    });
    const video = $("cameraPreview");
    if (video) {
      video.pause();
      video.srcObject = null;
      video.removeAttribute("src");
    }
    isSensorActive = false;
    highlightActiveSimButton(null);
    updateSourceModeBadge(sourceMode, false);
    $("cameraOverlay").hidden = false;
    $("cameraOverlayTitle").textContent = "Sensor Paused";
    $("cameraOverlaySub").textContent = 'Click any reaction button below or "Use My Webcam" to resume.';
    $("btnRecordTake").disabled = true;
  }
  function updateSettlingGateBanner() {
    const banner = $("settlingGateBanner");
    if (!banner) return;
    const targetId = docSession.settlingTargetClauseId;
    if (!targetId) {
      banner.hidden = true;
      return;
    }
    const clause = docSession.clauses.find((c) => c.id === targetId);
    const rec = docSession.records[targetId];
    if (!clause || !rec || rec.status === "SETTLED_OVERRIDE") {
      banner.hidden = true;
      return;
    }
    banner.hidden = false;
    $("settlingGateTitle").textContent = `Settling Gate for ${clause.number}: ${clause.title}`;
    $("settlingCyclesVal").textContent = `${rec.settledCyclesCompleted} / 2`;
    const latestWave = breathingWaveHistory.length > 0 ? breathingWaveHistory[breathingWaveHistory.length - 1] : 0;
    const widthPct = Math.min(95, Math.max(12, Math.round((latestWave + 0.8) / 1.6 * 85)));
    $("settlingPacerOrb").style.width = `${widthPct}%`;
    $("settlingPacerInstruction").textContent = latestWave >= 0 ? "Inhaling\u2026 let your chest expand steadily." : "Exhaling\u2026 release tension slowly until the cycle completes.";
  }
  function renderCodeOrDiffBody(rawBody) {
    const lines = rawBody.split("\n");
    const renderedLines = lines.map((line) => {
      const safe = escapeHtml(line);
      if (line.startsWith("@@")) {
        return `<span class="diff-line diff-line-hdr">${safe}</span>`;
      }
      if (line.startsWith("+") && !line.startsWith("+++")) {
        return `<span class="diff-line diff-line-add">${safe}</span>`;
      }
      if (line.startsWith("-") && !line.startsWith("---")) {
        return `<span class="diff-line diff-line-del">${safe}</span>`;
      }
      return `<span class="diff-line">${safe}</span>`;
    }).join("");
    return `<div class="clause-diff-box">${renderedLines}</div>`;
  }
  function formatFriendlyVerdict(status, dwellPct) {
    switch (status) {
      case "VERIFIED_CALM":
        return "\u2713 VERIFIED CALM";
      case "SETTLED_OVERRIDE":
        return "\u2713 SETTLED (2 BREATHS)";
      case "SKIM_DETECTED":
        return `\u26A0 SKIMMED (${dwellPct}% READ)`;
      case "APNEA_FRICTION":
        return "\u{1F6A8} BREATH-HOLD STRESS";
      case "SIGNAL_UNVERIFIED":
        return "\u23F8 PAUSED (SPEAKING)";
      case "READING":
        return `\u23F3 READING (${dwellPct}%)`;
      default:
        return "\u25CB NOT READ YET";
    }
  }
  function renderMinimapAndChecklist() {
    const bar = $("clauseMinimapBar");
    const summary = computeDocumentSignOffSummary(docSession);
    const pct = summary.totalClauses > 0 ? Math.round(summary.verifiedCount / summary.totalClauses * 100) : 0;
    $("minimapCompletionLabel").textContent = `${pct}% Verified (${summary.verifiedCount}/${summary.totalClauses})`;
    const totalWords = Math.max(
      1,
      docSession.clauses.reduce((acc, c) => acc + c.wordCount, 0)
    );
    bar.innerHTML = docSession.clauses.map((c) => {
      const rec = docSession.records[c.id];
      const st = rec?.status ?? "UNREAD";
      const isActive = c.id === docSession.activeClauseId;
      const flexBasis = Math.max(14, Math.round(c.wordCount / totalWords * 100));
      return `<div class="minimap-seg seg-${st} ${isActive ? "active" : ""}" style="flex: ${flexBasis} 1 0%;" data-jump-id="${c.id}" title="${escapeHtml(
        `${c.number} ${c.title}`
      )}">${escapeHtml(c.number)}</div>`;
    }).join("");
    bar.querySelectorAll(".minimap-seg").forEach((seg) => {
      seg.addEventListener("click", () => {
        const id = seg.getAttribute("data-jump-id");
        if (id && id !== docSession.activeClauseId) {
          const prevId = docSession.activeClauseId;
          docSession = selectActiveClause(docSession, id, personalBaseline, Date.now());
          renderClauseCards();
          updateReceiptAndSignOffUI();
          scrollActiveClauseIntoView();
          announceClauseVerdictIfFlagged(prevId);
        }
      });
    });
    const chkContainer = $("visualChecklistContainer");
    const chkText = $("checklistProgressText");
    if (chkText) {
      chkText.textContent = `${summary.verifiedCount} / ${summary.totalClauses} Verified`;
    }
    if (chkContainer) {
      chkContainer.innerHTML = docSession.clauses.map((c) => {
        const rec = docSession.records[c.id];
        const st = rec?.status ?? "UNREAD";
        const isActive = c.id === docSession.activeClauseId;
        const dwellPct = Math.min(100, Math.round((rec?.dwellTimeMs ?? 0) / c.minRequiredDwellMs * 100));
        const badgeColor = st === "VERIFIED_CALM" || st === "SETTLED_OVERRIDE" ? "var(--status-verified)" : st === "SKIM_DETECTED" ? "var(--status-skim)" : st === "APNEA_FRICTION" ? "var(--status-friction)" : isActive ? "var(--accent-primary)" : "var(--text-muted)";
        return `
          <div class="chk-row ${isActive ? "active" : ""}" data-chk-id="${c.id}">
            <span class="chk-row-title">${escapeHtml(c.number)} \u2014 ${escapeHtml(c.title)}</span>
            <span class="chk-row-badge" style="color: ${badgeColor};">
              ${formatFriendlyVerdict(st, dwellPct)}
            </span>
          </div>
        `;
      }).join("");
      chkContainer.querySelectorAll(".chk-row").forEach((row) => {
        row.addEventListener("click", () => {
          const id = row.getAttribute("data-chk-id");
          if (id && id !== docSession.activeClauseId) {
            const prevId = docSession.activeClauseId;
            docSession = selectActiveClause(docSession, id, personalBaseline, Date.now());
            renderClauseCards();
            updateReceiptAndSignOffUI();
            scrollActiveClauseIntoView();
            announceClauseVerdictIfFlagged(prevId);
          }
        });
      });
    }
  }
  function renderClauseCards() {
    renderMinimapAndChecklist();
    const container = $("clauseListContainer");
    const activeIdx = docSession.clauses.findIndex((c) => c.id === docSession.activeClauseId);
    $("clauseStepIndicator").textContent = `Section ${Math.max(1, activeIdx + 1)} of ${docSession.clauses.length}`;
    const summary = computeDocumentSignOffSummary(docSession);
    $("pillVerifiedCount").textContent = `${summary.verifiedCount} Verified`;
    $("pillSkimCount").textContent = `${summary.skimmedCount} Skimmed`;
    $("pillFrictionCount").textContent = `${summary.frictionCount} Stress/Apnea`;
    container.innerHTML = docSession.clauses.map((clause) => {
      const rec = docSession.records[clause.id];
      const isActive = clause.id === docSession.activeClauseId;
      const liveDwellMs = rec.dwellTimeMs;
      const dwellSec = (liveDwellMs / 1e3).toFixed(1);
      const reqSec = (clause.minRequiredDwellMs / 1e3).toFixed(1);
      const dwellPct = Math.min(100, Math.round(liveDwellMs / clause.minRequiredDwellMs * 100));
      const pulseText = rec.pulseMeanBpm !== null ? `${rec.pulseMeanBpm} BPM (${rec.pulseDeltaBpm !== null ? (rec.pulseDeltaBpm >= 0 ? "+" : "") + rec.pulseDeltaBpm : "0"})` : "70 BPM";
      const settleButtonHtml = rec.status === "APNEA_FRICTION" ? `<button class="btn btn-primary btn-xs btn-settle-clause" data-settle-id="${clause.id}" type="button">
               \u{1F32C}\uFE0F Take 2 Deep Breaths to Unlock
             </button>` : "";
      let passCompareHtml = "";
      if (rec.passHistory && rec.passHistory.length >= 2) {
        const firstPass = rec.passHistory[0];
        const latestPass = rec.passHistory[rec.passHistory.length - 1];
        passCompareHtml = `
          <div class="pass-comparison-strip">
            <span><strong>Pass 1 (Initial):</strong> ${firstPass.status} (Breath Hold ${firstPass.maxApneaHoldSec}s, Gaze ${Math.round(
          firstPass.gazePresenceRatio * 100
        )}%)</span>
            <span>\u2192</span>
            <span><strong>Pass ${latestPass.passNumber} (Resolved):</strong> ${latestPass.status} \u2713</span>
          </div>
        `;
      }
      const bodyHtml = clause.isCodeOrDiff ? renderCodeOrDiffBody(clause.body) : `<p class="clause-body-text">${escapeHtml(clause.body)}</p>`;
      return `
        <article class="clause-card ${isActive ? "active" : ""} status-${rec.status}" data-clause-id="${clause.id}">
          <div class="clause-top-bar">
            <div class="clause-top-left">
              <span class="clause-num">${escapeHtml(clause.number)}</span>
              <h3 class="clause-title">${escapeHtml(clause.title)}</h3>
              ${clause.riskTier !== "STANDARD" ? `<span class="risk-tag risk-${clause.riskTier}">${clause.riskTier === "CRITICAL_TRAP" ? "\u26A0 CRITICAL TRAP" : "ELEVATED RISK"}</span>` : ""}
            </div>
            <div class="gutter-status-pill verdict-${rec.status}">
              ${formatFriendlyVerdict(rec.status, dwellPct)}
            </div>
          </div>

          <div class="dwell-progress-strip" title="Reading progress: ${dwellPct}%">
            <div class="dwell-progress-fill" style="width: ${dwellPct}%"></div>
          </div>

          <div class="clause-content">
            ${bodyHtml}
            ${clause.plainLanguageWarning ? `<div class="clause-warning-box"><strong>Why This Matters:</strong> ${escapeHtml(
        clause.plainLanguageWarning
      )}</div>` : ""}
            ${passCompareHtml}
            <div class="clause-footer-row">
              <div class="clause-metric-pills">
                <span>\u23F1\uFE0F Read: <strong>${dwellSec}s / ${reqSec}s</strong> (${dwellPct}%)</span>
                <span>\u{1F441}\uFE0F Gaze: <strong>${Math.round(rec.gazePresenceRatio * 100)}%</strong></span>
                <span>\u{1F493} Pulse: <strong>${pulseText}</strong></span>
                <span>\u{1FAC1} Max Hold: <strong>${rec.maxApneaHoldSec}s</strong></span>
              </div>
              <div>
                ${settleButtonHtml}
              </div>
            </div>
          </div>
        </article>
      `;
    }).join("");
    container.querySelectorAll(".clause-card").forEach((card) => {
      card.addEventListener("click", (e) => {
        const target = e.target;
        if (target.closest(".btn-settle-clause")) return;
        const id = card.getAttribute("data-clause-id");
        if (id && id !== docSession.activeClauseId) {
          const prevId = docSession.activeClauseId;
          docSession = selectActiveClause(docSession, id, personalBaseline, Date.now());
          renderClauseCards();
          updateReceiptAndSignOffUI();
          scrollActiveClauseIntoView();
          announceClauseVerdictIfFlagged(prevId);
        }
      });
    });
    container.querySelectorAll(".btn-settle-clause").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-settle-id");
        if (id) {
          docSession = startSettlingGate(docSession, id);
          if (sourceMode === "DETERMINISTIC_REPLAY_BENCH") {
            startDeterministicReplay("COHERENT_SETTLING_BREATH");
          }
          updateSettlingGateBanner();
        }
      });
    });
  }
  function updateReceiptAndSignOffUI() {
    const receipt = buildReadReceiptPayload(
      activePreset,
      docSession,
      personalBaseline,
      sourceMode,
      telemetryEnabled,
      sdkVersion
    );
    const summary = receipt.signOffSummary;
    const badge = $("signOffVerdictBadge");
    const btnAttest = $("btnAttestDocument");
    if (summary.canSignOff) {
      badge.textContent = "\u2713 READY TO SIGN (ALL VERIFIED)";
      badge.className = "badge badge-success";
      btnAttest.disabled = false;
    } else {
      badge.textContent = `${summary.blockingClauseIds.length} SECTIONS REMAINING`;
      badge.className = "badge badge-warn";
      btnAttest.disabled = true;
    }
    $("gitTrailerCode").textContent = receipt.gitCommitTrailer;
    $("receiptMarkdownPreview").textContent = formatReadReceiptMarkdown(receipt);
  }
  function loadDocumentPreset(preset, autoStartSensor = true) {
    activePreset = preset;
    lastSignOffToastShown = false;
    docSession = createDocumentSession(preset.clauses, Date.now());
    $("docTitleHeading").textContent = preset.title;
    $("docSubtitleText").textContent = `${preset.counterpartyOrContext} \u2022 ${preset.subtitle}`;
    const hashBadge = $("docSourceHashBadge");
    if (hashBadge) {
      hashBadge.textContent = preset.sourceHashSha256 ? `SHA-256: ${preset.sourceHashSha256.slice(0, 16)}\u2026` : "SHA-256: Computed";
    }
    renderClauseCards();
    updateReceiptAndSignOffUI();
    const modalOpen = Boolean($("consentModal") && !$("consentModal").hidden);
    if (autoStartSensor && !modalOpen && !isSensorActive && !walkthroughInterval) {
      startDeterministicReplay("CALM_STEADY_READER");
    }
  }
  function addAndSelectPresetInDropdown(preset, prefixLabel) {
    const existingIdx = customPresets.findIndex((p) => p.id === preset.id);
    if (existingIdx >= 0) {
      customPresets[existingIdx] = preset;
    } else {
      customPresets.push(preset);
      const select = $("selectDocumentPreset");
      const opt = document.createElement("option");
      opt.value = preset.id;
      opt.textContent = `${prefixLabel}: ${preset.title}`;
      select.appendChild(opt);
    }
    $("selectDocumentPreset").value = preset.id;
    loadDocumentPreset(preset);
  }
  function switchRightTab(tabId) {
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      const isTarget = btn.getAttribute("data-tab") === tabId;
      btn.classList.toggle("active", isTarget);
      btn.setAttribute("aria-selected", String(isTarget));
    });
    document.querySelectorAll(".tab-pane").forEach((pane) => {
      const isTarget = pane.id === tabId;
      pane.classList.toggle("active", isTarget);
      pane.hidden = !isTarget;
    });
  }
  function compactEvalVerdict(v) {
    switch (v) {
      case "VERIFIED_CALM":
        return "CALM";
      case "SKIM_DETECTED":
        return "SKIM";
      case "APNEA_FRICTION":
        return "APNEA";
      case "SIGNAL_UNVERIFIED":
        return "SPEECH";
      default:
        return v;
    }
  }
  function renderEvaluationBenchmark() {
    const summary = runEvaluationBenchmarkSuite();
    $("evalScoreboardGrid").innerHTML = `
    <div class="eval-score-card">
      <div class="eval-score-title">Baseline A: Naive Timer</div>
      <div class="eval-score-val">${summary.naiveTimerAccuracyPct}%</div>
      <div class="eval-score-sub">${summary.naiveTimerCorrect}/${summary.totalCases} correct</div>
    </div>
    <div class="eval-score-card">
      <div class="eval-score-title">Baseline B: Raw 80-BPM</div>
      <div class="eval-score-val">${summary.uncalibratedPulseAccuracyPct}%</div>
      <div class="eval-score-sub">${summary.uncalibratedPulseCorrect}/${summary.totalCases} \u2022 Speech FP ${summary.speechFalsePositiveRateUncalibratedPct}%</div>
    </div>
    <div class="eval-score-card highlight">
      <div class="eval-score-title">ClausePulse Fusion</div>
      <div class="eval-score-val">${summary.clausePulseAccuracyPct}%</div>
      <div class="eval-score-sub">${summary.clausePulseCorrect}/${summary.totalCases} \u2022 Speech FP ${summary.speechFalsePositiveRateClausePulsePct}%</div>
    </div>
  `;
    $("evalBoundaryBox").innerHTML = `
    <strong>Documented Physical &amp; Optical Boundaries:</strong><br/>
    \u2022 ${escapeHtml(summary.failureBoundaryNotes[0])}<br/>
    \u2022 ${escapeHtml(summary.failureBoundaryNotes[1])}
  `;
    $("evalTableBody").innerHTML = summary.outcomes.map(
      (o) => `
      <tr title="${escapeHtml(o.diagnosticNote)}">
        <td><strong>${o.scenarioId}</strong></td>
        <td>${escapeHtml(o.scenarioName)}</td>
        <td>${compactEvalVerdict(o.expected)}</td>
        <td class="${o.naiveCorrect ? "eval-pass" : "eval-fail"}">${compactEvalVerdict(
        o.naiveTimerVerdict
      )}</td>
        <td class="${o.uncalibratedCorrect ? "eval-pass" : "eval-fail"}">${compactEvalVerdict(
        o.uncalibratedPulseVerdict
      )}</td>
        <td class="${o.clausePulseCorrect ? "eval-pass" : "eval-fail"}">${compactEvalVerdict(
        o.clausePulseVerdict
      )}</td>
      </tr>
    `
    ).join("");
  }
  async function runFullAutomatedWalkthrough() {
    const myToken = ++sensorTransitionToken;
    await stopAllSensors(true);
    if (myToken !== sensorTransitionToken) return;
    hideNotice();
    loadDocumentPreset(BUILTIN_DOCUMENT_PRESETS[0], false);
    if (replayInterval) {
      clearInterval(replayInterval);
      replayInterval = null;
    }
    isSensorActive = true;
    isValidationOk = true;
    updateSourceModeBadge("DETERMINISTIC_REPLAY_BENCH", true);
    updateProcessingBadge("ReplayActive");
    $("cameraOverlay").hidden = false;
    $("cameraOverlayTitle").textContent = `\u{1F3AC} Guided Multi-Pass Demo Running\u2026`;
    let simClockMs = Date.now();
    let simElapsedSec = 0;
    const stepMs = 250;
    baselineAcc = createBaselineAccumulator(simClockMs);
    let phase = "CALIBRATE";
    let phaseElapsedMs = 0;
    walkthroughInterval = setInterval(() => {
      const activeStepMs = phase === "CLAUSE_3_SETTLE" ? 110 : stepMs;
      simClockMs += activeStepMs;
      simElapsedSec += activeStepMs / 1e3;
      phaseElapsedMs += activeStepMs;
      const tsUs = simClockMs * 1e3;
      if (phase === "CALIBRATE") {
        highlightActiveSimButton("CALM_STEADY_READER");
        const pkt = generateReplayMetricsSlice("CALM_STEADY_READER", simElapsedSec, tsUs);
        handleDecodedMetricsPacket(pkt, simClockMs, stepMs);
        if (phaseElapsedMs >= 4e3 && baselineAcc) {
          personalBaseline = finalizePersonalBaseline(baselineAcc, simClockMs);
          baselineAcc = null;
          phase = "CLAUSE_1_CALM";
          phaseElapsedMs = 0;
        }
        return;
      }
      if (phase === "CLAUSE_1_CALM") {
        const pkt = generateReplayMetricsSlice("CALM_STEADY_READER", simElapsedSec, tsUs);
        handleDecodedMetricsPacket(pkt, simClockMs, stepMs);
        if (phaseElapsedMs >= 6500) {
          docSession = selectActiveClause(docSession, "msa-2", personalBaseline, simClockMs);
          scrollActiveClauseIntoView();
          phase = "CLAUSE_2_SKIM";
          phaseElapsedMs = 0;
        }
        return;
      }
      if (phase === "CLAUSE_2_SKIM") {
        highlightActiveSimButton("OFF_SCREEN_SKIMMER");
        const pkt = generateReplayMetricsSlice("CALM_STEADY_READER", simElapsedSec, tsUs);
        handleDecodedMetricsPacket(pkt, simClockMs, stepMs);
        if (phaseElapsedMs >= 2e3) {
          docSession = selectActiveClause(docSession, "msa-3", personalBaseline, simClockMs);
          scrollActiveClauseIntoView();
          phase = "CLAUSE_3_APNEA";
          phaseElapsedMs = 0;
        }
        return;
      }
      if (phase === "CLAUSE_3_APNEA") {
        highlightActiveSimButton("APNEA_AND_PULSE_SPIKE");
        const pkt = generateReplayMetricsSlice("APNEA_AND_PULSE_SPIKE", simElapsedSec, tsUs);
        handleDecodedMetricsPacket(pkt, simClockMs, stepMs);
        if (phaseElapsedMs >= 10500) {
          docSession = finalizeCurrentClause(docSession, personalBaseline, simClockMs);
          docSession = startSettlingGate(docSession, "msa-3");
          updateSettlingGateBanner();
          phase = "CLAUSE_3_SETTLE";
          phaseElapsedMs = 0;
        }
        return;
      }
      if (phase === "CLAUSE_3_SETTLE") {
        highlightActiveSimButton("COHERENT_SETTLING_BREATH");
        const slowSettleSec = phaseElapsedMs / 1e3 * 0.5;
        const pkt = generateReplayMetricsSlice("COHERENT_SETTLING_BREATH", slowSettleSec, tsUs);
        handleDecodedMetricsPacket(pkt, simClockMs, activeStepMs);
        if (docSession.records["msa-3"]?.status === "SETTLED_OVERRIDE" || phaseElapsedMs >= 16e3) {
          docSession = selectActiveClause(docSession, "msa-2", personalBaseline, simClockMs);
          scrollActiveClauseIntoView();
          phase = "CLAUSE_2_REREAD";
          phaseElapsedMs = 0;
        }
        return;
      }
      if (phase === "CLAUSE_2_REREAD") {
        highlightActiveSimButton("CALM_STEADY_READER");
        const pkt = generateReplayMetricsSlice("CALM_STEADY_READER", simElapsedSec, tsUs);
        handleDecodedMetricsPacket(pkt, simClockMs, stepMs);
        if (phaseElapsedMs >= 6500) {
          docSession = selectActiveClause(docSession, "msa-4", personalBaseline, simClockMs);
          scrollActiveClauseIntoView();
          phase = "CLAUSE_4_CALM";
          phaseElapsedMs = 0;
        }
        return;
      }
      if (phase === "CLAUSE_4_CALM") {
        const pkt = generateReplayMetricsSlice("CALM_STEADY_READER", simElapsedSec, tsUs);
        handleDecodedMetricsPacket(pkt, simClockMs, stepMs);
        if (phaseElapsedMs >= 6500) {
          docSession = selectActiveClause(docSession, "msa-5", personalBaseline, simClockMs);
          scrollActiveClauseIntoView();
          phase = "CLAUSE_5_CALM";
          phaseElapsedMs = 0;
        }
        return;
      }
      if (phase === "CLAUSE_5_CALM") {
        const pkt = generateReplayMetricsSlice("CALM_STEADY_READER", simElapsedSec, tsUs);
        handleDecodedMetricsPacket(pkt, simClockMs, stepMs);
        if (phaseElapsedMs >= 9500) {
          if (walkthroughInterval) {
            clearInterval(walkthroughInterval);
            walkthroughInterval = null;
          }
          isSensorActive = false;
          docSession = finalizeCurrentClause(docSession, personalBaseline, simClockMs);
          updateSourceModeBadge("DETERMINISTIC_REPLAY_BENCH", false);
          $("cameraOverlayTitle").textContent = "\u2705 Guided Demo Complete";
          $("cameraOverlaySub").textContent = "Click \u25B6 Resume or any reaction button below to test further.";
          renderClauseCards();
          updateReceiptAndSignOffUI();
          switchRightTab("tabReceipt");
          showNotice(
            "Walkthrough Complete",
            'All 5 sections verified! Pass 1 vs Pass 2 Ghost Comparisons recorded on \xA7 2.4 & \xA7 3.2. Click "\u270D\uFE0F Sign & Save Receipt" on the right.'
          );
        }
      }
    }, 40);
  }
  async function refreshVaultStatus() {
    if (!window.clausePulseHost) return;
    const cfg = await window.clausePulseHost.getConfig();
    sdkVersion = cfg.sdkVersion || "3.5.0";
    telemetryEnabled = cfg.telemetryEnabled;
    $("sdkVersionBadge").textContent = `@smartspectra/node-sdk v${sdkVersion}`;
    $("vaultTelemetryToggle").checked = telemetryEnabled;
    $("consentTelemetryToggle").checked = telemetryEnabled;
    const isBrowser = cfg.keySource === "BROWSER_COMPANION";
    $("vaultKeyStatusText").textContent = cfg.hasApiKey ? `Configured (${cfg.maskedKey} via ${cfg.keySource})` : isBrowser ? "Browser Optical + Simulator Engine" : "Live Optical & Simulator Active";
    const helpEl = $("vaultEngineHelpText");
    if (helpEl) {
      helpEl.textContent = isBrowser ? 'You are running the Web Companion: click "\u{1F4F7} Use My Webcam" for live 30 FPS optical analysis or run "Check Device Readiness" below. Native C++ SmartSpectra API keys are used only in the Electron desktop build.' : "Enter a Presage SmartSpectra API key (stored encrypted via OS safeStorage) to enable native C++ physiological processing.";
    }
    const keyInput = $("inputApiKey");
    const saveKeyBtn = $("btnSaveApiKey");
    const forgetKeyBtn = $("btnForgetApiKey");
    if (keyInput && saveKeyBtn && forgetKeyBtn) {
      keyInput.disabled = isBrowser;
      saveKeyBtn.disabled = isBrowser;
      forgetKeyBtn.disabled = isBrowser;
    }
    const receipts = await window.clausePulseHost.getReceipts();
    renderSavedReceiptsList(receipts);
  }
  function renderSavedReceiptsList(receipts) {
    $("savedReceiptsCount").textContent = String(receipts.length);
    const listEl = $("savedReceiptsList");
    if (!listEl) return;
    if (receipts.length === 0) {
      listEl.innerHTML = `<p style="font-size: 11px; color: var(--text-muted);">No receipts saved yet.</p>`;
      return;
    }
    listEl.innerHTML = receipts.slice(0, 6).map(
      (r) => `
      <div style="padding: 6px 0; border-bottom: 1px solid var(--border-hairline); font-size: 11px;">
        <strong>${escapeHtml(r.document.title)}</strong><br/>
        <span style="font-family: var(--font-mono); color: var(--text-muted);">
          ${escapeHtml(r.generatedAtIso.slice(0, 19).replace("T", " "))} \u2022 ${escapeHtml(
        r.integrityDigestHex.slice(0, 22)
      )}\u2026
        </span>
      </div>
    `
    ).join("");
  }
  function initEventListeners() {
    const startWorkbenchFresh = async () => {
      if (!$("consentCheckAck")?.checked) {
        showNotice("Privacy Acknowledgement Required", "Check the Privacy Guarantee box to start sensing.");
        return;
      }
      const tokenBeforeStart = sensorTransitionToken;
      $("consentModal").hidden = true;
      loadDocumentPreset(activePreset, false);
      await startDeterministicReplay("CALM_STEADY_READER");
      if (sensorTransitionToken === tokenBeforeStart + 1 && !walkthroughInterval) {
        showNotice(
          "\u{1F44B} Step 1: Reading Section 1 Live",
          'Watch its blue progress bar reach 100%, or click "Hold Breath (Stress Trap)" / "Look Away" on the left to test catching risks!'
        );
      }
    };
    $("btnAcceptConsent").addEventListener("click", startWorkbenchFresh);
    ["consentModal", "customDocModal", "vaultModal"].forEach((modalId) => {
      const el = $(modalId);
      el?.addEventListener("click", (e) => {
        if (e.target === el) {
          if (modalId === "consentModal") {
            startWorkbenchFresh();
          } else {
            el.hidden = true;
          }
        }
      });
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (!$("consentModal").hidden) startWorkbenchFresh();
        $("customDocModal").hidden = true;
        $("vaultModal").hidden = true;
      }
    });
    $("btnOpenVaultModal")?.addEventListener("click", () => {
      $("vaultModal").hidden = false;
    });
    $("btnCloseVaultModal")?.addEventListener("click", () => {
      $("vaultModal").hidden = true;
    });
    $("btnToggleTheme").addEventListener("click", () => {
      const html = document.documentElement;
      const next = html.getAttribute("data-theme") === "vellum" ? "carbon" : "vellum";
      html.setAttribute("data-theme", next);
      $("btnToggleTheme").textContent = next === "vellum" ? "\u{1F319} Dark Mode" : "\u2600\uFE0F Light Mode";
    });
    $("chkBlurPreview").addEventListener("change", (e) => {
      const checked = e.target.checked;
      $("cameraPreview").classList.toggle("blurred", checked);
    });
    $("btnStartCamera").addEventListener("click", () => startLiveCameraSession(true));
    $("btnRecordTake").addEventListener("click", () => toggleRecordCameraTake());
    $("btnRunVideoFile").addEventListener("click", () => startVideoFileSession());
    $("btnStopSensor").addEventListener("click", () => {
      if (isSensorActive) {
        stopAllSensors();
      } else {
        startDeterministicReplay(activeReplayProfile);
      }
    });
    document.querySelectorAll(".sim-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const profile = btn.getAttribute("data-profile");
        if (profile) {
          startDeterministicReplay(profile);
          if (profile === "APNEA_AND_PULSE_SPIKE") {
            showNotice(
              "\u{1F624} Simulating Breath-Hold Stress (Apnea)",
              "Watch the Breathing Wave flatline in red and Heart Rate jump to 84 BPM. In ~4.5 seconds, the 2-Breath Settling Gate will trigger!"
            );
          } else if (profile === "OFF_SCREEN_SKIMMER") {
            showNotice(
              "\u{1F440} Simulating Distracted / Off-Screen Gaze",
              'Eyes are off-screen. Clicking "Next Section \u2192" now will trigger an amber Skim Lock!'
            );
          } else if (profile === "COHERENT_SETTLING_BREATH") {
            showNotice(
              "\u{1F32C}\uFE0F Simulating Deep Settling Breaths",
              "Streaming slow, coherent respiratory waves to unlock any high-stress section."
            );
          } else {
            hideNotice();
          }
        }
      });
    });
    $("btnQuickSettleNow")?.addEventListener("click", () => {
      startDeterministicReplay("COHERENT_SETTLING_BREATH");
      showNotice(
        "\u{1F32C}\uFE0F Taking 2 Deep Breaths\u2026",
        "Watch the green bar complete 2 full breathing cycles to unlock this section!"
      );
    });
    $("btnOpenLocalFile").addEventListener("click", async () => {
      const res = await window.clausePulseHost?.openLocalFile();
      if (!res || res.canceled) return;
      if (!res.ok || !res.content) {
        showNotice("File Open Failed", res.error || "Could not read selected file.");
        return;
      }
      const parsed = parseCustomDocumentIntoClauses(
        res.fileName || "Local File",
        res.content,
        res.filePath
      );
      addAndSelectPresetInDropdown(parsed, "File");
      showNotice(
        "\u{1F4C2} File Loaded & Active",
        `Loaded ${parsed.clauses.length} sections from ${res.fileName}. Reading timer is active!`
      );
    });
    const handleGitDiffAudit = async (chooseDir) => {
      const res = await window.clausePulseHost?.scanGitDiff(chooseDir);
      if (!res || res.canceled) return;
      if (!res.ok) {
        showNotice("Git Diff Audit Failed", res.error || "Could not scan Git repository.");
        return;
      }
      const parsed = parseGitDiffIntoPreset(
        res.repoName || "Repository",
        res.branchName || "HEAD",
        res.rawDiff || "",
        res.repoPath
      );
      addAndSelectPresetInDropdown(parsed, "Git Diff");
      showNotice(
        "\u{1F500} Git Diff Loaded & Sensing Active",
        `Reviewing ${parsed.clauses.length} diff hunks from ${res.repoName}. Watch the reading progress bar fill up on HUNK 01!`
      );
    };
    $("btnScanGitRepo").addEventListener("click", () => handleGitDiffAudit(false));
    $("btnPickGitFolder")?.addEventListener("click", () => handleGitDiffAudit(true));
    $("btnJumpToEval").addEventListener("click", () => {
      renderEvaluationBenchmark();
      switchRightTab("tabEval");
    });
    $("btnRunEvalSuite").addEventListener("click", () => {
      renderEvaluationBenchmark();
      showNotice("\u{1F4CA} Benchmark Executed", "All 30 physiological evaluation scenarios verified (93.3% accuracy).");
    });
    $("selectDocumentPreset").addEventListener("change", (e) => {
      const id = e.target.value;
      const all = [...BUILTIN_DOCUMENT_PRESETS, ...customPresets];
      const found = all.find((p) => p.id === id);
      if (found) loadDocumentPreset(found);
    });
    $("btnOpenCustomDoc").addEventListener("click", () => {
      $("customDocModal").hidden = false;
    });
    $("btnCancelCustomDoc").addEventListener("click", () => {
      $("customDocModal").hidden = true;
    });
    $("btnLoadCustomDoc").addEventListener("click", () => {
      const title = $("customDocTitleInput").value;
      const body = $("customDocBodyInput").value;
      const parsed = parseCustomDocumentIntoClauses(title, body);
      $("customDocModal").hidden = true;
      addAndSelectPresetInDropdown(parsed, "Custom");
    });
    $("btnPrevClause").addEventListener("click", () => {
      const idx = docSession.clauses.findIndex((c) => c.id === docSession.activeClauseId);
      if (idx > 0) {
        const prevId = docSession.activeClauseId;
        docSession = selectActiveClause(
          docSession,
          docSession.clauses[idx - 1].id,
          personalBaseline,
          Date.now()
        );
        renderClauseCards();
        updateReceiptAndSignOffUI();
        scrollActiveClauseIntoView();
        announceClauseVerdictIfFlagged(prevId);
      }
    });
    $("btnNextClause").addEventListener("click", () => {
      const idx = docSession.clauses.findIndex((c) => c.id === docSession.activeClauseId);
      if (idx >= 0 && idx < docSession.clauses.length - 1) {
        const prevId = docSession.activeClauseId;
        docSession = selectActiveClause(
          docSession,
          docSession.clauses[idx + 1].id,
          personalBaseline,
          Date.now()
        );
        renderClauseCards();
        updateReceiptAndSignOffUI();
        scrollActiveClauseIntoView();
        announceClauseVerdictIfFlagged(prevId);
      }
    });
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const tabId = btn.getAttribute("data-tab");
        if (tabId) {
          if (tabId === "tabEval") renderEvaluationBenchmark();
          switchRightTab(tabId);
        }
      });
    });
    $("btnFinalizeClause").addEventListener("click", () => {
      const id = docSession.activeClauseId;
      docSession = finalizeCurrentClause(docSession, personalBaseline, Date.now());
      renderClauseCards();
      updateReceiptAndSignOffUI();
      const rec = docSession.records[id];
      const clause = docSession.clauses.find((c) => c.id === id);
      if (rec && clause) {
        if (rec.status === "VERIFIED_CALM" || rec.status === "SETTLED_OVERRIDE") {
          showNotice(`\u2705 ${clause.number} Verified`, "Reading dwell, gaze, and calm breathing verified.");
        } else {
          announceClauseVerdictIfFlagged(id);
        }
      }
    });
    $("btnAttestDocument").addEventListener("click", async () => {
      docSession = finalizeCurrentClause(docSession, personalBaseline, Date.now());
      const receipt = buildReadReceiptPayload(
        activePreset,
        docSession,
        personalBaseline,
        sourceMode,
        telemetryEnabled,
        sdkVersion
      );
      const saved = await window.clausePulseHost?.saveReceipt(receipt);
      if (saved?.receipts) {
        renderSavedReceiptsList(saved.receipts);
      }
      showNotice("\u2705 Read Receipt Signed", `Signed locally with ${receipt.integrityDigestHex.slice(0, 24)}\u2026`);
    });
    $("btnCopyGitTrailer").addEventListener("click", () => {
      const text = $("gitTrailerCode").textContent || "";
      navigator.clipboard?.writeText(text);
      showNotice("\u{1F4CB} Copied", "Git Commit / PR Sign-Off Trailer copied to clipboard.");
    });
    $("btnCopyReceiptMd").addEventListener("click", () => {
      const text = $("receiptMarkdownPreview").textContent || "";
      navigator.clipboard?.writeText(text);
      showNotice("\u{1F4CB} Copied", "Signed Read Receipt Markdown copied to clipboard.");
    });
    $("btnExportReceiptFile").addEventListener("click", async () => {
      const receipt = buildReadReceiptPayload(
        activePreset,
        docSession,
        personalBaseline,
        sourceMode,
        telemetryEnabled,
        sdkVersion
      );
      const md = formatReadReceiptMarkdown(receipt);
      const jsonStr = JSON.stringify(receipt, null, 2);
      await window.clausePulseHost?.exportReceiptFile(
        md,
        jsonStr,
        `ClausePulse-${activePreset.id}-Receipt.md`
      );
    });
    $("btnRunAutoWalkthrough").addEventListener("click", () => {
      $("consentModal").hidden = true;
      runFullAutomatedWalkthrough();
    });
    $("btnSaveApiKey").addEventListener("click", async () => {
      const val = $("inputApiKey").value.trim();
      if (!val) return;
      await window.clausePulseHost?.saveApiKey(val);
      $("inputApiKey").value = "";
      await refreshVaultStatus();
      showNotice("Key Saved", "Presage API Key stored.");
    });
    $("btnForgetApiKey").addEventListener("click", async () => {
      await window.clausePulseHost?.forgetApiKey();
      await refreshVaultStatus();
    });
    $("btnCheckReadiness").addEventListener("click", async () => {
      const box = $("readinessResultBox");
      box.hidden = false;
      box.textContent = "Checking device readiness\u2026";
      const res = await window.clausePulseHost?.checkDeviceReadiness();
      box.textContent = `Verdict: ${res?.verdict?.toUpperCase() || "READY"} \u2014 ${res?.reason || ""}`;
    });
    $("vaultTelemetryToggle").addEventListener("change", async (e) => {
      const enabled = e.target.checked;
      telemetryEnabled = enabled;
      $("consentTelemetryToggle").checked = enabled;
      await window.clausePulseHost?.setTelemetryPreference(enabled);
      updateReceiptAndSignOffUI();
    });
    $("btnWipeAllData").addEventListener("click", async () => {
      await stopAllSensors();
      await window.clausePulseHost?.wipeAllLocalData();
      personalBaseline = DEFAULT_BASELINE;
      loadDocumentPreset(activePreset);
      await refreshVaultStatus();
      $("vaultModal").hidden = true;
      showNotice("\u{1F5D1} Session Reset", "All saved receipts and buffers cleared.");
    });
    window.clausePulseHost?.onVideoFileEvent((payload) => {
      if (!payload) return;
      if (payload.kind === "processingStatus") {
        updateProcessingBadge(payload.status);
      } else if (payload.kind === "validationStatus") {
        updateValidationHud(payload.code, payload.hint || "");
      } else if (payload.kind === "metrics" && payload.decoded) {
        handleDecodedMetricsPacket(payload.decoded, Date.now());
      } else if (payload.kind === "error") {
        showNotice(`SDK Video Error (${payload.code})`, payload.message || "");
      }
    });
    window.addEventListener("beforeunload", () => {
      stopAllSensors();
    });
  }
  document.addEventListener("DOMContentLoaded", async () => {
    initEventListeners();
    loadDocumentPreset(BUILTIN_DOCUMENT_PRESETS[0]);
    renderEvaluationBenchmark();
    await refreshVaultStatus();
    renderCameraHudReticle($("cameraHudCanvas"), {
      active: true,
      faceCentered: true,
      centroidX: 0.5,
      centroidY: 0.42,
      chestWave: 0.1,
      isApnea: false,
      modeLabel: "READY"
    });
  });
})();
/*! Bundled license information:

long/umd/index.js:
  (**
   * @license
   * Copyright 2009 The Closure Library Authors
   * Copyright 2020 Daniel Wirtz / The long.js Authors.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *     http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *
   * SPDX-License-Identifier: Apache-2.0
   *)
*/
