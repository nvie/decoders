<img alt="Decoders logo" src="./assets/logo@2x.png" style="width: 100%; max-width: 830px; max-height: 248px" width="830" /><br />

[![npm](https://img.shields.io/npm/v/decoders.svg)](https://www.npmjs.com/package/decoders)
[![Test Status](https://github.com/nvie/decoders/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/nvie/decoders/actions)
[![Bundle size for decoders](https://pkg-size.dev/badge/bundle/4200)](https://pkg-size.dev/decoders)

Elegant and battle-tested validation library for type-safe input data for TypeScript.

## Basic example

```typescript
import { array, iso8601, number, object, optional, string } from 'decoders';

// Incoming data at runtime, e.g. the request body
// The point is that this data is untrusted and its type unknown
const externalData = {
  id: 123,
  name: 'Alison Roberts',
  createdAt: '2026-01-11T12:26:37.024Z',
  tags: ['foo', 'bar'],
};

// Write the decoder (= what you expect the data to look like)
const userDecoder = object({
  id: number,
  name: string,
  createdAt: optional(iso8601),
  tags: array(string),
});

// Call .verify() on the incoming data
const user = userDecoder.verify(externalData);
//    ^^^^
//    TypeScript will infer this type as:
//    {
//      id: number;
//      name: string;
//      createdAt?: Date;
//      tags: string[];
//    }
```

## Installation

```bash
npm install decoders
```

## Requirements

You must set `strict: true` in your `tsconfig.json` in order for type inference to work
correctly!

```js
// tsconfig.json
{
  "compilerOptions": {
    "strict": true
  }
}
```

## Documentation

Documentation can be found on [decoders.cc](https://decoders.cc).

There is a dedicated page that explains how to
[build your own decoders](https://decoders.cc/docs/building-your-own).
