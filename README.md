<img alt="Decoders logo" src="./docs/assets/logo@2x.png" style="width: 100%; max-width: 830px; max-height: 248px" width="830" /><br />

[![npm](https://img.shields.io/npm/v/decoders.svg)](https://www.npmjs.com/package/decoders)
[![Build Status](https://github.com/nvie/decoders/workflows/test/badge.svg)](https://github.com/nvie/decoders/actions)
[![Coverage Status](https://img.shields.io/coveralls/nvie/decoders/main.svg)](https://coveralls.io/github/nvie/decoders?branch=main)
[![Minified Size](https://badgen.net/bundlephobia/minzip/decoders)](https://bundlephobia.com/result?p=decoders)

Elegant and battle-tested validation library for type-safe input data for
[TypeScript](https://www.typescriptlang.org/) and [Flow](https://flow.org/).

## Motivation

Data entering your application from the outside world should not be trusted without
validation and often is of the `any` type, effectively disabling your type checker around
input values. It's an industry good practice to validate your expectations right at your
program's boundaries. This has two benefits: (1) your inputs are getting validated, and
(2) you can now statically know for sure the shape of the incoming data. **Decoders help
solve both of these problems at once.**

## Example

```typescript
import { array, iso8601, number, object, optional, string } from 'decoders';

//
// Incoming data at runtime
//
const externalData = {
    id: 123,
    name: 'Alison Roberts',
    createdAt: '1994-01-11T12:26:37.024Z',
    tags: ['foo', 'bar'],
};

//
// Write the decoder (= what you expect the data to look like)
//
const userDecoder = object({
    id: number,
    name: string,
    createdAt: optional(iso8601),
    tags: array(string),
});

//
// Call .verify() on the incoming data
//
const user = userDecoder.verify(externalData);
//    ^^^^
//    TypeScript can automatically infer this type now:
//
//    {
//      id: number;
//      name: string;
//      createdAt?: Date;
//      tags: string[];
//    }
//
```

## Documentation

<div id="$DecoderType"></div>
<div id="DecodeResult"></div>
<div id="Decoder"></div>
<div id="DecoderType"></div>
<div id="Guard"></div>
<div id="JSONArray"></div>
<div id="JSONObject"></div>
<div id="JSONValue"></div>
<div id="Scalar"></div>
<div id="adding-predicates"></div>
<div id="always"></div>
<div id="anyNumber"></div>
<div id="array"></div>
<div id="boolean"></div>
<div id="building-custom-decoders"></div>
<div id="compose"></div>
<div id="compositions"></div>
<div id="constant"></div>
<div id="date"></div>
<div id="define"></div>
<div id="describe"></div>
<div id="dict"></div>
<div id="either"></div>
<div id="email"></div>
<div id="exact"></div>
<div id="fail"></div>
<div id="guard"></div>
<div id="hardcoded"></div>
<div id="httpsUrl"></div>
<div id="inexact"></div>
<div id="instanceOf"></div>
<div id="integer"></div>
<div id="iso8601"></div>
<div id="json"></div>
<div id="jsonArray"></div>
<div id="jsonObject"></div>
<div id="lazy"></div>
<div id="mapping"></div>
<div id="maybe"></div>
<div id="mixed"></div>
<div id="never"></div>
<div id="nonEmptyArray"></div>
<div id="nonEmptyString"></div>
<div id="null_"></div>
<div id="nullable"></div>
<div id="number"></div>
<div id="numericBoolean"></div>
<div id="object"></div>
<div id="oneOf"></div>
<div id="optional"></div>
<div id="poja"></div>
<div id="pojo"></div>
<div id="positiveInteger"></div>
<div id="positiveNumber"></div>
<div id="predicate"></div>
<div id="prep"></div>
<div id="primitives"></div>
<div id="regex"></div>
<div id="set"></div>
<div id="string"></div>
<div id="taggedUnion"></div>
<div id="the-difference-between-object-exact-and-inexact"></div>
<div id="transform"></div>
<div id="transformation"></div>
<div id="truthy"></div>
<div id="tuple"></div>
<div id="undefined_"></div>
<div id="unknown"></div>
<div id="url"></div>
<div id="uuid"></div>
<div id="uuidv1"></div>
<div id="uuidv4"></div>

Documentation can be found on [https://decoders.cc](https://decoders.cc).  
(Old v1 documentation can still be found
[here](https://github.com/nvie/decoders/tree/v1.25.5#readme).)
