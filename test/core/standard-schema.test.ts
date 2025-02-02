import { describe, expect, test } from 'vitest';

import { string } from '~/strings';

describe('standard-schema', () => {
  test('valid', () => {
    const schema = string;
    const result = schema['~standard']['validate']("I'm a string");

    if (result instanceof Promise) {
      throw new Error('Expected synchronous result');
    }

    if (result.issues) {
      expect.unreachable('Expected no issues');
    }

    expect(result.value).toEqual("I'm a string");
  });

  test('invalid', () => {
    const schema = string;
    const result = schema['~standard']['validate'](42);

    if (result instanceof Promise) {
      throw new Error('Expected synchronous result');
    }

    if (!result.issues) {
      expect.unreachable('Expected issues');
    }

    expect(result.issues.length).toEqual(1);
  });
});
