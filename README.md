# File-based baseline testing for chai.

**chai-baseline** adds simplified file-based baseline testing for chai. With it you can compare data to a reference file on disk, storing a local file in the process. This allows for the use of large-scale diff tools to do additional comparisons outside of the tests themselves.

# Installation

```
npm install chai-baseline
```

# Usage

**chai-baseline** can only be used in NodeJS where it has access to the file system.

## Usage with `expect`

```ts
// ES6 syntax (TypeScript, Babel)
import { use, expect } from "chai";
import chaiBaseline from "chai-baseline";
use(chaiBaseline);

// pre-ES6 syntax
var chai = require("chai"), expect = chai.expect;
var chaiBaseline = require("chai-baseline").default;
chai.use(chaiBaseline);

// usage
it("baseline", () => {
    const text = "...output text...";
    return expect(text).to.have.baseline("transpilerOutput.txt", { base: "./baselines" }); // returns Promise
});
```

## Usage with `assert`

```ts
// ES6 syntax (TypeScript, Babel)
import { use, assert } from "chai";
import chaiBaseline from "chai-baseline";
use(chaiBaseline);

// pre-ES6 syntax
var chai = require("chai"), assert = chai.assert;
var chaiBaseline = require("chai-baseline").default;
chai.use(chaiBaseline);

// usage
it("baseline", () => {
    const text = "...output text...";
    return assert.baseline(text, "transpilerOutput.txt", { base: "./baselines" }); // returns Promise
});
```