<img alt="Decoders logo" src="./assets/logo@2x.png" style="width: 100%; max-width: 830px; max-height: 248px" width="830" /><br />

[![npm](https://img.shields.io/npm/v/decoders.svg)](https://www.npmjs.com/package/decoders)
[![Test Status](https://github.com/nvie/decoders/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/nvie/decoders/actions)
[![Bundle size for decoders](https://pkg-size.dev/badge/bundle/4200)](https://pkg-size.dev/decoders)

Elegant and battle-tested validation library for type-safe input data for
[TypeScript](https://www.typescriptlang.org/).

## Introduction

Data entering your application from the outside world should not be trusted without
validation and often is of the `any` type, effectively disabling your type checker around
input values. It's an industry good practice to validate your expectations right at your
program's boundaries. This has two benefits: (1) your inputs are getting validated, and
(2) you can now statically know for sure the shape of the incoming data. **Decoders help
solve both of these problems at once.**

## Basic example

```typescript
import { array, iso8601, number, object, optional, string } from 'decoders';

// Incoming data at runtime
const externalData = {
  id: 123,
  name: 'Alison Roberts',
  createdAt: '1994-01-11T12:26:37.024Z',
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
//    TypeScript automatically infers this type as:
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
