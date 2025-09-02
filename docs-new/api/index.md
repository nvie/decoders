# API

Welcome to the complete API reference for Decoders. This library provides over 50 built-in
decoders organized into logical categories.

## Quick Navigation

::: tip

Use Search Press `Cmd+K` (or `Ctrl+K`) to quickly search for any decoder!

:::

### Most Common Decoders

- [`string`](/api/string) - Validates string values
- [`number`](/api/number) - Validates finite numbers
- [`boolean`](/api/boolean) - Validates boolean values
- [`array`](/api/array) - Validates arrays with element validation
- [`object`](/api/object) - Validates objects with field validation
- [`optional`](/api/optional) - Makes any decoder optional
- [`either`](/api/either) - Union types (A | B)

### By Category

#### 🔤 [Strings](/api/#strings)

Basic string validation and specialized string formats.

#### 🔢 [Numbers](/api/#numbers)

Number validation with various constraints.

#### ☑️ [Booleans](/api/#booleans)

Boolean and truthy value validation.

#### 📅 [Dates](/api/#dates)

Date validation and parsing.

#### 📋 [Arrays](/api/#arrays)

Array validation with element type checking.

#### 🏗️ [Objects](/api/#objects)

Object structure validation.

#### 🔄 [Unions & Optionals](/api/#unions-optionals)

Union types, optional fields, and nullable values.

#### 📚 [Collections](/api/#collections)

Maps, records, and other collection types.

#### 🧰 [Utilities](/api/#utilities)

Advanced decoder construction and composition.

## Decoder Class Methods

Every decoder instance provides these methods:

- [`.verify()`](/api/decoder-class#verify) - Validate and return value or throw
- [`.value()`](/api/decoder-class#value) - Validate and return value or undefined
- [`.decode()`](/api/decoder-class#decode) - Validate and return result object
- [`.transform()`](/api/decoder-class#transform) - Transform the decoded value
- [`.refine()`](/api/decoder-class#refine) - Add additional validation
- [`.pipe()`](/api/decoder-class#pipe) - Chain decoders together

## JSON Support

Special decoders for JSON data:

- [`json`](/api/json) - Any valid JSON value
- [`jsonObject`](/api/jsonObject) - JSON objects only
- [`jsonArray`](/api/jsonArray) - JSON arrays only

---

_Looking for something specific? Use the search above or browse the categories in the
sidebar._
