# Security Policy

## Supported versions

Fixes go out on the latest release only — there are no maintenance branches for older
versions. If you aren't on the latest version, upgrade before reporting an issue.

## Reporting a vulnerability

Please **do not open a public issue** for security problems.

Report privately through GitHub's [private vulnerability reporting][gh-report] (Security →
Report a vulnerability on the repository).

Please include:

- which decoder(s) are affected, and which version you are on (`npm ls decoders`)
- a minimal reproduction — the decoder definition and the exact input value
- what the decoder does versus what you expected it to do
- what an attacker gains from it

Since this is a spare-time project, please allow a reasonable window for a fix before
disclosing publicly.

## Scope

decoders is a pure, dependency-free library that turns untrusted input into typed values.
It does no I/O, executes no user-supplied code, and ships no binaries. Its one
security-relevant promise is soundness: if a `Decoder<T>` accepts a value, that value
really is a `T`.

In scope:

- a decoder accepting input it should reject, so that the resulting value does not match
  its static type — the type system then lies to every caller downstream
- prototype pollution or other unexpected property leakage through `object()`, `exact()`,
  or `record()` — e.g. `__proto__` or `constructor` keys in the input affecting anything
  beyond the decoded result
- catastrophic backtracking (ReDoS) in one of the built-in patterns: `email`, `urlString`,
  `url`, `httpsUrl`, `isoDate`, `uuid`, `identifier`, `nanoid`, and friends. These run on
  attacker-controlled strings by design, so a quadratic path through one of them is a real
  denial of service.

Out of scope:

- ReDoS in a pattern _you_ pass to `regex()`, or work done inside your own `refine()`,
  `transform()`, or `define()` callback — decoders runs those as given
- a decoder rejecting input you believe it should accept. That is a regular [bug
  report][issues], not a vulnerability.
- unbounded memory from decoding an unbounded payload. Cap the size of the input before it
  reaches a decoder; use `sized()` if you want the cap expressed in the decoder itself.
- vulnerabilities in `devDependencies` or in the documentation site — neither is part of
  the published package, which has zero runtime dependencies

[gh-report]: https://github.com/nvie/decoders/security/advisories/new
[issues]: https://github.com/nvie/decoders/issues
