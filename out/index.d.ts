/// <reference types="chai" />
/// <reference types="node" />
declare global  {
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
        interface AssertionPrivate extends Assertion {
            assert(expr: boolean, msg: string | (() => string), negateMsg?: string | (() => string), expected?: any, actual?: any, showDiff?: boolean): void;
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
export declare function chaiBaseline(chai: Chai.ChaiStatic, utils: Chai.UtilsStatic): void;
export default chaiBaseline;
export {};
