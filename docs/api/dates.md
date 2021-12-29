---
title: Dates
parent: API Reference
nav_order: 4
---

# Dates

## Table of Contents

-   [`date`](#date)
-   [`iso8601`](#iso8601)

---

<a name="date" href="#date">#</a> <b>date</b>: <i>Decoder&lt;Date&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/date.js 'Source')

Accepts only JavaScript [Date][1] values.

<!-- prettier-ignore-start -->
```javascript
const verify = guard(date);
const now = new Date();

// 👍
verify(now) === now;

// 👎
verify(123);      // throws
verify('hello');  // throws
```
<!-- prettier-ignore-end -->

---

<a name="iso8601" href="#iso8601">#</a> <b>iso8601</b>: <i>Decoder&lt;Date&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/date.js 'Source')

Accepts only [ISO8601][2]-formatted strings. This is very useful for working with dates in
APIs: serialize them as `.toISOString()` when sending, decode them with `iso8601` when
receiving.

**NOTE:** This decoder accepts _strings_, but returns _Date_ instances.

<!-- prettier-ignore-start -->
```javascript
const verify = guard(iso8601);

// 👍
verify('2020-06-01T12:00:00Z'); // ≈ new Date('2020-06-01T12:00:00Z')

// 👎
verify('2020-06-01');  // throws
verify('hello');       // throws
verify(123);           // throws
verify(new Date());    // throws (does not accept dates)
```
<!-- prettier-ignore-end -->

---

[1]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
[2]: https://en.wikipedia.org/wiki/ISO_8601
