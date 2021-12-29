---
title: Dates
nav_order: 4
---

### Dates

<a name="date" href="#date">#</a> <b>date</b>: <i>Decoder&lt;Date&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/date.js 'Source')

Accepts only JavaScript [Date][date-api] values.

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

Accepts only [ISO8601][iso8601-fmt]-formatted strings. This is very useful for working
with dates in APIs: serialize them as `.toISOString()` when sending, decode them with
`iso8601` when receiving.

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
