# Getting Started

Decoders is a TypeScript library for validating data at runtime while providing
compile-time type safety.

## Installation

```bash
npm install decoders
```

## Quick Example

```typescript
import { object, string, number, optional } from 'decoders';

const userDecoder = object({
  name: string,
  age: number,
});

// ✅ Valid input
const user = userDecoder.verify({
  /* untrusted input */
});

console.log(user.name); // string
console.log(user.age); // number
```

## Why Decoders?

Data entering your application from the outside world should not be trusted without
validation. Whether it's from APIs, user input, or configuration files, **decoders** help
you validate and transform that data safely.

::: tip

Decoders provide runtime validation with compile-time type safety - the best of both
worlds!

:::

::: tip

Just getting started? Check out the [installation guide](/guide/) and
[API reference](/api/).

:::

## Basic Usage

Import the decoders you need and start validating:

```typescript
import { string, number, object } from 'decoders';

// Simple validation
const name = string.verify('Alice'); // ✅ 'Alice'
const age = number.verify(30); // ✅ 30

// Object validation
const userDecoder = object({
  name: string,
  age: number,
});

const user = userDecoder.verify({
  name: 'Alice',
  age: 30,
}); // ✅ { name: 'Alice', age: 30 }
```

## Core Concepts

### Decoders vs Validators

Unlike traditional validators that just return `true`/`false`, **decoders**:

- ✅ Return the validated and typed data
- ✅ Provide detailed error messages
- ✅ Support data transformation
- ✅ Offer compile-time type safety

### Three Ways to Use Decoders

Every decoder provides three methods:

#### `.verify()` - Throw on Error

```typescript
try {
  const result = string.verify('hello'); // 'hello'
} catch (error) {
  // Handle validation error
}
```

#### `.value()` - Return undefined on Error

```typescript
const result = string.value('hello'); // 'hello'
const failed = string.value(123); // undefined
```

#### `.decode()` - Return Result Object

```typescript
const success = string.decode('hello'); // { ok: true, value: 'hello' }
const failure = string.decode(123); // { ok: false, error: ... }
```

## Next Steps

- [Building Your Own Decoders](/guide/building-your-own)
- [Tips & Best Practices](/guide/tips)
- [Complete API Reference](/api/)
