---
title: JSON
parent: API Reference
nav_order: 9
---

# JSON

## Table of Contents

-   [`json`](#json)
-   [`jsonObject`](#jsonObject)
-   [`jsonArray`](#jsonArray)

---

<a name="json" href="#json">#</a> <b>json</b>: <i>Decoder&lt;JSONValue&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/json.js 'Source')

Accepts any value that's a valid JSON value:

-   `null`
-   `string`
-   `number`
-   `boolean`
-   `{ [string]: JSONValue }`
-   `Array<JSONValue>`

```javascript
const verify = guard(json);

// 👍
verify({
    name: 'Amir',
    age: 27,
    admin: true,
    image: null,
    tags: ['vip', 'staff'],
});
```

Any value returned by `JSON.parse()` should decode without failure.

---

<a name="jsonObject" href="#jsonObject">#</a> <b>jsonObject</b>:
<i>Decoder&lt;JSONObject&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/json.js 'Source')

Like `json`, but will only decode when the JSON value is an object.

<!-- prettier-ignore-start -->
```javascript
const verify = guard(json);

// 👍
verify({});                // ≈ {}
verify({ name: 'Amir' });  // ≈ { name: 'Amir' }

// 👎
verify([]);                   // throws
verify([{ name: 'Alice' }]);  // throws
verify('hello');              // throws
verify(null);                 // throws
```
<!-- prettier-ignore-end -->

---

<a name="jsonArray" href="#jsonArray">#</a> <b>jsonArray</b>:
<i>Decoder&lt;JSONArray&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/json.js 'Source')

Like `json`, but will only decode when the JSON value is an array.

<!-- prettier-ignore-start -->
```javascript
const verify = guard(json);

// 👍
verify([]);                  // ≈ []
verify([{ name: 'Amir' }]);  // ≈ [{ name: 'Amir' }]

// 👎
verify({});                 // throws
verify({ name: 'Alice' });  // throws
verify('hello');            // throws
verify(null);               // throws
```
<!-- prettier-ignore-end -->
