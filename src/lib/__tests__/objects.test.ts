import { dict, exact, inexact, mapping, object, pojo } from '../objects';
import { hardcoded, optional, unknown } from '../basics';
import { number } from '../numbers';
import { string } from '../strings';

describe('objects', () => {
    it('decodes objects and fields', () => {
        const decoder = object({
            id: number,
            name: string,
        });

        expect(decoder.verify({ id: 1, name: 'test' })).toEqual({
            id: 1,
            name: 'test',
        });

        // Unexpected extra keys are just ignored
        expect(decoder.verify({ id: 1, name: 'test', extra: 'abundance' })).toEqual({
            id: 1,
            name: 'test',
        });
    });

    it('empty objects', () => {
        const decoder = object({});
        expect(decoder.verify({ id: 1, name: 'test' })).toEqual({});
        expect(decoder.verify({})).toEqual({});
    });

    it('decodes objects and fields (ignore unknown fields)', () => {
        // Unexpected extra keys are ignored
        const decoder = object({
            id: number,
            name: string,
            extra: optional(string),
        });

        expect(decoder.verify({ id: 1, name: 'test' })).toEqual({
            id: 1,
            name: 'test',
        });
        expect(decoder.verify({ id: 1, name: 'test', extra: 'foo' })).toEqual({
            id: 1,
            name: 'test',
            extra: 'foo',
        });
    });

    it('objects with optional fields will be implicit-undefined', () => {
        const defaults = {
            extra: 'default',
        };

        const decoder = object({
            id: number,
            name: string,
            extra: optional(string),
        });

        expect({
            ...defaults,
            ...decoder.verify({ id: 1, name: 'test' }),
        }).toEqual({
            id: 1,
            name: 'test',
            extra: 'default',
        });
    });

    it('reports all errors at once', () => {
        const decoder = object({
            id: number,
            name: string,
            extra: optional(string),
        });

        // All good (no missing/decoding errors)
        expect(() => decoder.verify({ id: 1, name: 'valid' })).not.toThrow(
            'Must be string',
        );
        expect(() => decoder.verify({ id: 1, name: 'valid' })).not.toThrow('Missing key');
        expect(() =>
            decoder.verify({ id: 1, name: 'valid', extra: undefined }),
        ).not.toThrow('Must be string');
        expect(() =>
            decoder.verify({ id: 1, name: 'valid', extra: undefined }),
        ).not.toThrow('Missing key');

        // Test missing key errors
        expect(() => decoder.verify({ name: 'valid' })).toThrow('Missing key: "id"');
        expect(() => decoder.verify({ name: 'valid' })).not.toThrow('Must be string');
        expect(() => decoder.verify({ name: 'valid', extra: undefined })).toThrow(
            'Missing key: "id"',
        );
        expect(() => decoder.verify({ name: 'valid', extra: undefined })).not.toThrow(
            'Must be string',
        );
        expect(() => decoder.verify({ extra: 'valid' })).toThrow(
            'Missing keys: "id", "name"',
        );
        expect(() => decoder.verify({ extra: 'valid' })).not.toThrow('Must be string');
        expect(() => decoder.verify({ name: undefined, extra: 'valid' })).toThrow(
            'Missing keys: "id", "name"',
        );
        expect(() => decoder.verify({ name: undefined, extra: 'valid' })).not.toThrow(
            'Must be string',
        );

        // Now test that both errors are part of the same error!
        expect(() => decoder.verify({ name: 42 })).toThrow('Must be string');
        expect(() => decoder.verify({ name: 42 })).toThrow('Missing key: "id"');

        // Both of these messages are part of the same error!
        expect(() => decoder.verify({ extra: 42 })).toThrow('Must be string');

        // More than one error
        expect(() => decoder.verify({ name: 42, id: 'hi' })).toThrow();
    });

    it('errors on non-objects', () => {
        const decoder = object({ id: string });

        expect(decoder.decode('foo').ok).toBe(false);
        expect(decoder.decode(3.14).ok).toBe(false);
        expect(decoder.decode([]).ok).toBe(false);
        expect(decoder.decode(undefined).ok).toBe(false);
        expect(decoder.decode(NaN).ok).toBe(false);
        expect(decoder.decode({ foo: [1, 2, 3] }).ok).toBe(false); // Missing key "id"
        expect(decoder.decode({ id: 3 }).ok).toBe(false); // Invalid field value for "id"
    });
});

describe('exact objects', () => {
    it('decodes objects and fields', () => {
        const decoder = exact({ id: number, name: string });
        expect(decoder.verify({ id: 1, name: 'test' })).toEqual({
            id: 1,
            name: 'test',
        });
    });

    it('fails on superfluous keys', () => {
        const decoder = exact({ id: number, name: string });
        expect(() =>
            decoder.verify({ id: 1, name: 'test', superfluous: 'abundance' }),
        ).toThrow('Unexpected extra keys');
    });

    it('retains extra hardcoded fields', () => {
        const decoder = exact({
            id: number,
            name: string,
            extra: hardcoded('extra'),
        });
        expect(decoder.verify({ id: 1, name: 'test' })).toEqual({
            id: 1,
            name: 'test',
            extra: 'extra',
        });
        expect(decoder.verify({ id: 1, name: 'test', extra: 42 })).toEqual({
            id: 1,
            name: 'test',
            extra: 'extra',
        });
        expect(() =>
            decoder.verify({ id: 1, name: 'test', superfluous: 'abundance' }),
        ).toThrow('Unexpected extra keys');
        expect(() =>
            decoder.verify({ id: 1, name: 'test', extra: 42, superfluous: 'abundance' }),
        ).toThrow('Unexpected extra keys');
    });

    it('empty objects', () => {
        const decoder = exact({});
        expect(() => decoder.verify({ id: 1, name: 'test' })).toThrow();
        expect(decoder.verify({})).toEqual({});
    });

    it('errors on non-objects', () => {
        const decoder = exact({ id: string });

        expect(decoder.decode('foo').ok).toBe(false);
        expect(decoder.decode(3.14).ok).toBe(false);
        expect(decoder.decode([]).ok).toBe(false);
        expect(decoder.decode(undefined).ok).toBe(false);
        expect(decoder.decode(NaN).ok).toBe(false);
        expect(decoder.decode({ foo: [1, 2, 3] }).ok).toBe(false); // Missing key "id"
        expect(decoder.decode({ id: 3 }).ok).toBe(false); // Invalid field value for "id"
    });

    it('exact objects with optional fields will be implicit-undefined', () => {
        const defaults = {
            extra: 'default',
        };

        const decoder = exact({
            id: number,
            name: string,
            extra: optional(string),
        });

        expect({
            ...defaults,
            ...decoder.verify({ id: 1, name: 'test' }),
        }).toEqual({
            id: 1,
            name: 'test',
            extra: 'default',
        });
    });
});

describe('inexact objects', () => {
    it('decodes objects and fields', () => {
        const decoder = inexact({ id: number, name: string });
        expect(decoder.verify({ id: 1, name: 'test' })).toEqual({
            id: 1,
            name: 'test',
        });

        // Extra properties will be retained, but "unknown"
        expect(
            decoder.verify({ id: 1, name: 'test', extra1: 123, extra2: 'hey' }),
        ).toEqual({
            id: 1,
            name: 'test',
            extra1: 123,
            extra2: 'hey',
        });
    });

    it('retains extra hardcoded fields', () => {
        const decoder = inexact({ id: number, name: string, extra: hardcoded('extra') });
        expect(decoder.verify({ id: 1, name: 'test', extra: 42 })).toEqual({
            id: 1,
            name: 'test',
            extra: 'extra',
        });
        expect(decoder.verify({ id: 1, name: 'test' })).toEqual({
            id: 1,
            name: 'test',
            extra: 'extra',
        });

        // Extra properties will be retained, but "unknown"
        expect(
            decoder.verify({ id: 1, name: 'test', extra1: 123, extra2: 'hey' }),
        ).toEqual({
            id: 1,
            name: 'test',
            extra: 'extra',
            extra1: 123,
            extra2: 'hey',
        });
    });

    it('empty objects', () => {
        const decoder = inexact({});
        expect(decoder.verify({ id: 1, name: 'test' })).toEqual({ id: 1, name: 'test' });
        expect(decoder.verify({})).toEqual({});
    });

    it('errors on non-objects', () => {
        const decoder = inexact({ id: string });

        expect(decoder.decode('foo').ok).toBe(false);
        expect(decoder.decode(3.14).ok).toBe(false);
        expect(decoder.decode([]).ok).toBe(false);
        expect(decoder.decode(undefined).ok).toBe(false);
        expect(decoder.decode(NaN).ok).toBe(false);
        expect(decoder.decode({ foo: [1, 2, 3] }).ok).toBe(false); // Missing key "id"
        expect(decoder.decode({ id: 3 }).ok).toBe(false); // Invalid field value for "id"
    });

    it('inexact objects with optional fields will be implicit-undefined', () => {
        const defaults = {
            foo: 'default',
            bar: 'default',
        };

        const decoder = inexact({
            foo: optional(string),
        });

        expect(
            //
            // NOTE: We'll have to prettier-ignore this line, because the
            // suppression location of this [cannot-spread-indexer] error has
            // moved between Flow versions we want to support. By putting this
            // expression on a single line, we avoid CI from failing when
            // running Flow checks between old and new versions ;)
            //
            // prettier-ignore
            // $FlowFixMe[cannot-spread-indexer]
            { ...defaults, ...decoder.verify(({ foo: undefined, bar: undefined })) },
        ).toEqual({
            foo: 'default', // 'foo' is known and allowed-optional, so this will be implicit-undefined
            bar: undefined, // 'bar' is ignored so the explicit-undefined will override here
        });
    });
});

describe('pojo', () => {
    it('decodes objects and fields', () => {
        const decoder = pojo;
        expect(decoder.verify({})).toEqual({});
        expect(decoder.verify({ a: 1 })).toEqual({ a: 1 });

        // Not
        expect(() => decoder.verify(null)).toThrow();
        expect(() => decoder.verify(42)).toThrow();
    });
});

describe('objects w/ circular refs', () => {
    // Take any decoder and pass in some self-referential object
    const value = { foo: 42 };
    const self = value;
    // $FlowFixMe[prop-missing] - let's create a self-referential object
    value.self = self;

    it('valid', () => {
        expect(object({ foo: number }).verify(value)).toEqual({ foo: 42 });
        expect(object({ foo: number, self: unknown }).verify(value)).toEqual({
            foo: 42,
            self,
        });
        expect(object({ foo: number, self: pojo }).verify(value)).toEqual({
            foo: 42,
            self,
        });
        expect(
            object({ foo: number, self: object({ foo: number }) }).verify(value),
        ).toEqual({
            foo: 42,
            self: { foo: 42 },
        });
        expect(
            object({
                foo: number,
                self: object({
                    foo: number,
                    self: object({ self: object({ foo: number }) }),
                }),
            }).verify(value),
        ).toEqual({
            foo: 42,
            self: {
                foo: 42,
                self: {
                    self: {
                        foo: 42,
                    },
                },
            },
        });
    });

    it('invalid', () => {
        expect(object({ foo: string }).decode(value).ok).toBe(false);
        expect(object({ foo: string, self: unknown }).decode(value).ok).toBe(false);
        expect(object({ foo: string, self: pojo }).decode(value).ok).toBe(false);
        expect(
            object({ foo: number, self: object({ foo: string }) }).decode(value).ok,
        ).toBe(false);
        expect(
            object({
                foo: number,
                self: object({
                    foo: number,
                    self: object({ self: object({ foo: string }) }),
                }),
            }).decode(value).ok,
        ).toBe(false);
    });
});

describe('arrays are not objects', () => {
    const decoder1 = object({});
    const decoder2 = object({
        opt: optional(string),
    });

    it('valid', () => {
        expect(decoder1.verify({ what: 'ever' })).toEqual({});
        expect(decoder2.verify({ what: 'ever' })).toEqual({});
    });

    it('invalid (basic types)', () => {
        expect(() => decoder1.verify([])).toThrow('Must be an object');
        expect(() => decoder2.verify([])).toThrow('Must be an object');
        expect(() => decoder1.verify('an string')).toThrow('Must be an object');
        expect(() => decoder2.verify('an string')).toThrow('Must be an object');
    });

    it('invalid (custom classes)', () => {
        expect(() => decoder1.verify(new String())).toThrow('Must be an object');
        expect(() => decoder2.verify(new String())).toThrow('Must be an object');
        expect(() => decoder1.verify(new Error('foo'))).toThrow('Must be an object');
        expect(() => decoder2.verify(new Error('foo'))).toThrow('Must be an object');
        expect(() => decoder1.verify(new Date())).toThrow('Must be an object');
        expect(() => decoder2.verify(new Date())).toThrow('Must be an object');
    });
});

describe('mapping', () => {
    const decoder = mapping(object({ name: string }));

    it('valid', () => {
        const input = {
            '18': { name: 'foo' },
            '23': { name: 'bar' },
            key: { name: 'value' },
        };
        const output = new Map([
            ['18', { name: 'foo' }],
            ['23', { name: 'bar' }],
            ['key', { name: 'value' }],
        ]);
        expect(decoder.verify(input)).toEqual(output);
    });

    it('invalid', () => {
        expect(() => decoder.verify('foo')).toThrow('Must be an object');
        expect(() => decoder.verify({ foo: 1 })).toThrow('Must be an object');
        expect(() => decoder.verify({ foo: {} })).toThrow('Missing key: "name"');
        expect(() =>
            decoder.verify({
                '124': { invalid: true },
                '125': { name: 'bar' },
            }),
        ).toThrow('Missing key: "name"');

        // More than one error
        expect(() => decoder.verify({ foo: 42, bar: 42 })).toThrow();
    });
});

describe('dict', () => {
    const decoder = dict(object({ name: string }));

    it('valid', () => {
        const input = {
            '18': { name: 'foo' },
            '23': { name: 'bar' },
            key: { name: 'value' },
        };
        expect(decoder.verify(input)).toEqual(input);
    });

    it('invalid', () => {
        expect(() => decoder.verify('foo')).toThrow('Must be an object');
        expect(() => decoder.verify({ foo: 1 })).toThrow('Must be an object');
        expect(() => decoder.verify({ foo: {} })).toThrow('Missing key: "name"');
        expect(() =>
            decoder.verify({
                '124': { invalid: true },
                '125': { name: 'bar' },
            }),
        ).toThrow('Missing key: "name"');
    });
});
