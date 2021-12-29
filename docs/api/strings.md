---
title: Strings
parent: API Reference
nav_order: 1
---

# Strings

## Table of Contents

-   [`string`](#string)
-   [`nonEmptyString`](#nonEmptyString)
-   [`regex`](#regex)
-   [`email`](#email)
-   [`url`](#url)
-   [`httpsUrl`](#httpsUrl)

---

<a name="string" href="#string">#</a> <b>string</b>: <i>Decoder&lt;string&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/string.js 'Source')

Accepts only string values.

<!-- prettier-ignore-start -->
```javascript
const verify = guard(string);

// 👍
verify('hello world') === 'hello world';
verify('🚀') === '🚀';
verify('') === '';

// 👎
verify(123);   // throws
verify(true);  // throws
verify(null);  // throws
```
<!-- prettier-ignore-end -->

---

<a name="nonEmptyString" href="#nonEmptyString">#</a> <b>nonEmptyString</b>:
<i>Decoder&lt;string&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/string.js 'Source')

Like `string`, but will reject the empty string, or strings containing only whitespace.

<!-- prettier-ignore-start -->
```javascript
const verify = guard(nonEmptyString);

// 👍
verify('hello world') === 'hello world';
verify('🚀') === '🚀';

// 👎
verify(123);   // throws
verify('  ');  // throws
verify('');    // throws
```
<!-- prettier-ignore-end -->

---

<a name="regex" href="#regex">#</a> <b>regex</b>(): <i>Decoder&lt;string&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/string.js 'Source')

Accepts only string values that match the given regular expression.

<!-- prettier-ignore-start -->
```javascript
const verify = guard(regex(/^[0-9][0-9]+$/));

// 👍
verify('42') === '42';
verify('83401648364738') === '83401648364738';

// 👎
verify('');     // throws
verify('1');    // throws
verify('foo');  // throws
```
<!-- prettier-ignore-end -->

---

<a name="email" href="#email">#</a> <b>email</b>: <i>Decoder&lt;string&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/string.js 'Source')

Accepts only strings that are syntactically valid email addresses. (This will not mean
that the email address actually exist.)

<!-- prettier-ignore-start -->
```javascript
const verify = guard(email);

// 👍
verify('alice@acme.org') === 'alice@acme.org';

// 👎
verify('foo');               // throws
verify('@acme.org');         // throws
verify('alice @ acme.org');  // throws
```
<!-- prettier-ignore-end -->

---

<a name="url" href="#url">#</a> <b>url</b>: <i>Decoder&lt;URL&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/string.js 'Source')

Accepts strings that are valid URLs, returns the value as a URL instance.

<!-- prettier-ignore-start -->
```javascript
const verify = guard(url);

// 👍
verify('http://nvie.com') === new URL('http://nvie.com/');
verify('https://nvie.com') === new URL('https://nvie.com/');
verify('git+ssh://user@github.com/foo/bar.git') === new URL('git+ssh://user@github.com/foo/bar.git');

// 👎
verify('foo');               // throws
verify('@acme.org');         // throws
verify('alice @ acme.org');  // throws
verify('/search?q=foo');     // throws
```
<!-- prettier-ignore-end -->

---

<a name="httpsUrl" href="#httpsUrl">#</a> <b>httpsUrl</b>: <i>Decoder&lt;URL&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/string.js 'Source')

Accepts strings that are valid URLs, but only HTTPS ones. Returns the value as a URL
instance.

<!-- prettier-ignore-start -->
```javascript
const verify = guard(httpsUrl);

// 👍
verify('https://nvie.com:443') === new URL('https://nvie.com/');

// 👎
verify('http://nvie.com');                        // throws, not HTTPS
verify('git+ssh://user@github.com/foo/bar.git');  // throws, not HTTPS
```
<!-- prettier-ignore-end -->

**Tip!** If you need to limit URLs to different protocols than HTTP, you can do as the
HTTPS decoder is implemented: as a predicate on top of a regular `url` decoder.

```typescript
import { predicate, url } from 'decoders';

const gitUrl: Decoder<URL> = predicate(
    url,
    (value) => value.protocol === 'git:',
    'Must be a git:// URL',
);
```
