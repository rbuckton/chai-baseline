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
import * as fs from "fs";
import * as path from "path";
import { Stream } from "stream";

declare global {
    namespace Chai {
        interface ChaiStatic {
            Assertion: AssertionStatic;
        }
        interface AssertionStatic {
            new (target: any, message?: string): Assertion;
            addMethod(name: string, fn: Function): void;
        }
        interface Assertion {
            baseline(file: string, options: BaselineOptions, message?: string): PromiseLike<void>;
        }
        interface AssertStatic {
            baseline(data: string | Buffer | NodeJS.ReadableStream | undefined, file: string, options: BaselineOptions, message?: string): PromiseLike<void>;
        }
        interface UtilsStatic {
            flag(obj: any, key: string): any;
            flag(obj: any, key: string, value: any): void;
        }
    }
}

export interface BaselineOptions {
    /** The base directory for the local and reference directories. */
    base?: string;
    /** The absolute or relative (to the base directory) path for the local directory. */
    local?: string;
    /** The absolute or relative (to the base directory) path for the reference directory. */
    reference?: string;
}

export function baseline(chai: Chai.ChaiStatic, utils: Chai.UtilsStatic) {
    const { Assertion, assert } = chai;
    Assertion.addMethod("baseline", baselineAssertion);
    assert.baseline = baselineAssert;

    function baselineAssertion(this: Chai.Assertion, file: string, options: BaselineOptions, message?: string) {
        return new Promise<void>((resolve, reject) => {
            if (message) {
                utils.flag(this, "message", message);
            }
            else {
                message = utils.flag(this, "message");
            }

            let object = utils.flag(this, "object");
            let data: string | Buffer | NodeJS.ReadableStream | undefined;
            if (typeof object === "undefined" || typeof object === "string" || Buffer.isBuffer(data) || (data instanceof Stream && data.readable)) {
                data = object;
            }
            else {
                data = String(data);
            }

            const localFile = path.resolve(options.base || ".", options.local || "local", file);
            const referenceFile = path.resolve(options.base || ".", options.reference || "reference", file);
            Promise.all([
                writeLocal(localFile, data),
                readFile(referenceFile)
            ])
            .then(([local, reference]) => {
                utils.flag(this, "object", local);
                try {
                    this.equals(reference, message);
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

    function baselineAssert(data: string | Buffer | NodeJS.ReadableStream | undefined, file: string, options: BaselineOptions, message?: string) {
        return new chai.Assertion(data, message).have.baseline(file, options);
    }
}

export default baseline;

function readFile(file: string) {
    return new Promise<string | undefined>((resolve) => {
        fs.readFile(file, /*encoding*/ "utf8", (err, data) => {
            resolve(err ? undefined : data);
        });
    });
}

function writeLocal(local: string, data: string | NodeJS.ReadableStream | Buffer | undefined) {
    return new Promise<string | undefined>((resolve, reject) => {
        if (data === undefined) {
            unlink(local)
                .then(() => resolve())
                .catch(reject);
        }
        else if (typeof data === "string" || Buffer.isBuffer(data)) {
            const text = data.toString();
            writeFile(local, text)
                .then(() => resolve(text))
                .catch(reject);
        }
        else {
            writeStream(local, data)
                .then(() => readFile(local))
                .then(data => resolve(data))
                .catch(reject);
        }
    });
}

function writeFile(file: string, data: string) {
    return new Promise<void>((resolve, reject) => {
        ensureDirectory(path.dirname(file))
            .then(() => fs.writeFile(file, data, /*encoding*/ "utf8", err => err ? reject(err) : resolve()))
            .catch(reject);
    });
}

function writeStream(file: string, stream: NodeJS.ReadableStream) {
    return new Promise<void>((resolve, reject) => {
        ensureDirectory(path.dirname(file)).then(() => {
            stream
                .pipe(fs.createWriteStream(file, { encoding: "utf8" }), { end: true })
                .on("error", reject)
                .on("close", () => resolve());
        })
        .catch(reject);
    })
}

function exists(path: string) {
    return new Promise<boolean>(resolve => {
        fs.exists(path, resolve);
    });
}

function mkdir(dirname: string, mode: number) {
    return new Promise<void>((resolve, reject) => {
        fs.mkdir(dirname, mode, err => err ? reject(err) : resolve());
    });
}

function ensureDirectory(dirname: string): Promise<void> {
    return exists(dirname)
        .then(exists => Promise.resolve(path.dirname(dirname))
            .then(parentdir => parentdir && parentdir !== dirname ? ensureDirectory(parentdir) : undefined)
            .then(() => mkdir(dirname, 0o0777 & ~process.umask())));
}

function unlink(file: string) {
    return new Promise<void>((resolve) => {
        fs.unlink(file, () => resolve());
    });
}