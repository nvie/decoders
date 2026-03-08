import {
  array,
  bigint,
  constant,
  either,
  email,
  mapping,
  number,
  object,
  optional,
  positiveInteger,
  select,
  string,
  taggedUnion,
  unknown,
} from 'decoders';

// Imported but intentionally unused — should be tree-shaken:
// bigint, positiveInteger, number
void bigint;
void mapping(positiveInteger);
void number;

const myDecoder = object({
  names: array(string),
  contact: email,
  role: optional(either(constant('admin'), constant('user'))),
  event: taggedUnion('type', {
    click: object({ type: constant('click'), x: string, y: string }),
    key: object({ type: constant('key'), code: string }),
  }),
  source: select(unknown, () => string),
});

// Side-effectful: bundler must keep this + all decoders it depends on
myDecoder.verify({});
