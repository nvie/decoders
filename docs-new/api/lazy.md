---
title: lazy
description: Utilities decoder
---

# `lazy` decoder

```typescript
lazy<T>(decoderFn: () => Decoder<T>): Decoder<T>
```

[View source](https://github.com/nvie/decoders/tree/main/src/misc.ts#L23-L29)

Lazily evaluate the given decoder. This is useful to build self-referential
types for recursive data structures.

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="lazy(() => treeDecoder)" />

## Code Examples

```typescript
type Tree = {
        value: string;
        children: Array<Tree>;
        //              ^^^^
        //              Self-reference defining a recursive type
      };

      const treeDecoder: Decoder<Tree> = object({
        value: string,
        children: array(lazy(() => treeDecoder)),
        //              ^^^^^^^^^^^^^^^^^^^^^^^
        //              Use lazy() like this to refer to the treeDecoder which is
        //              getting defined here
      });
```

