import { string, numeric } from '../dist/index.js';
import { expectAssignable, expectError, expectType } from 'tsd';
import type { StandardSchemaV1 } from '@standard-schema/spec';

expectAssignable<StandardSchemaV1>(string);
expectAssignable<StandardSchemaV1<unknown>>(string);
expectAssignable<StandardSchemaV1<unknown, string>>(string);

declare const input: StandardSchemaV1.InferInput<typeof numeric>;
declare const output: StandardSchemaV1.InferOutput<typeof numeric>;

expectType<unknown>(input);
expectType<number>(output);

// A generic function that accepts an arbitrary spec-compliant validator
declare function standardValidate<T extends StandardSchemaV1>(
  schema: T,
  input: StandardSchemaV1.InferInput<T>,
): StandardSchemaV1.InferOutput<T>;

// `string` and `stringToNumber` are accepted by `standardValidate`
expectError(standardValidate(() => "I'm not a standard validator", 42));
expectType<string>(standardValidate(string, "I'm a string"));
expectType<number>(standardValidate(numeric, "I'm a string"));
expectType<number>(standardValidate(numeric, ['not', 'a', 'string']));
