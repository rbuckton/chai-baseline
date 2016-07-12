"use strict";
/*!
 * Copyright 2016 Ron Buckton
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var fs = require("fs");
var path = require("path");
var stream_1 = require("stream");
function baseline(chai, utils) {
    var Assertion = chai.Assertion, assert = chai.assert;
    Assertion.addMethod("baseline", baselineAssertion);
    assert.baseline = baselineAssert;
    function baselineAssertion(file, options, message) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (message) {
                utils.flag(_this, "message", message);
            }
            else {
                message = utils.flag(_this, "message");
            }
            var object = utils.flag(_this, "object");
            var data;
            if (typeof object === "undefined" || typeof object === "string" || Buffer.isBuffer(data) || (data instanceof stream_1.Stream && data.readable)) {
                data = object;
            }
            else {
                data = String(data);
            }
            var localFile = path.resolve(options.base || ".", options.local || "local", file);
            var referenceFile = path.resolve(options.base || ".", options.reference || "reference", file);
            Promise.all([
                writeLocal(localFile, data),
                readFile(referenceFile)
            ])
                .then(function (_a) {
                var local = _a[0], reference = _a[1];
                utils.flag(_this, "object", local);
                try {
                    _this.equals(reference, message);
                }
                catch (e) {
                    e.expected = reference || "";
                    e.actual = local || "";
                    e.showDiff = true;
                    throw e;
                }
            })
                .then(resolve, reject);
        });
    }
    function baselineAssert(data, file, options, message) {
        return new chai.Assertion(data, message).have.baseline(file, options);
    }
}
exports.baseline = baseline;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = baseline;
function readFile(file) {
    return new Promise(function (resolve) {
        fs.readFile(file, /*encoding*/ "utf8", function (err, data) {
            resolve(err ? undefined : data);
        });
    });
}
function writeLocal(local, data) {
    return new Promise(function (resolve, reject) {
        if (data === undefined) {
            unlink(local)
                .then(function () { return resolve(); })
                .catch(reject);
        }
        else if (typeof data === "string" || Buffer.isBuffer(data)) {
            var text_1 = data.toString();
            writeFile(local, text_1)
                .then(function () { return resolve(text_1); })
                .catch(reject);
        }
        else {
            writeStream(local, data)
                .then(function () { return readFile(local); })
                .then(function (data) { return resolve(data); })
                .catch(reject);
        }
    });
}
function writeFile(file, data) {
    return new Promise(function (resolve, reject) {
        ensureDirectory(path.dirname(file))
            .then(function () { return fs.writeFile(file, data, /*encoding*/ "utf8", function (err) { return err ? reject(err) : resolve(); }); })
            .catch(reject);
    });
}
function writeStream(file, stream) {
    return new Promise(function (resolve, reject) {
        ensureDirectory(path.dirname(file)).then(function () {
            stream
                .pipe(fs.createWriteStream(file, { encoding: "utf8" }), { end: true })
                .on("error", reject)
                .on("close", function () { return resolve(); });
        })
            .catch(reject);
    });
}
function exists(path) {
    return new Promise(function (resolve) {
        fs.exists(path, resolve);
    });
}
function mkdir(dirname, mode) {
    return new Promise(function (resolve, reject) {
        fs.mkdir(dirname, mode, function (err) { return err ? reject(err) : resolve(); });
    });
}
function ensureDirectory(dirname) {
    return exists(dirname)
        .then(function (exists) { return Promise.resolve(path.dirname(dirname))
        .then(function (parentdir) { return parentdir && parentdir !== dirname ? ensureDirectory(parentdir) : undefined; })
        .then(function () { return mkdir(dirname, 511 & ~process.umask()); }); });
}
function unlink(file) {
    return new Promise(function (resolve) {
        fs.unlink(file, function () { return resolve(); });
    });
}
