// @flow

// import { optional } from '../optional';
// import { decodeString } from '../string';

// describe('optional', () => {
//     const decoder = optional(decodeString());

//     it('valid', () => {
//         expect(decoder(undefined)).toBeUndefined();
//         expect(decoder('')).toBe('');
//         expect(decoder('foo')).toBe('foo');
//         expect(decoder(' 1 2 3 ')).toBe(' 1 2 3 ');
//     });

//     it('invalid', () => {
//         expect(() => decoder(1)).toThrow();
//         expect(() => decoder(true)).toThrow();
//         expect(() => decoder(null)).toThrow();
//         expect(() => decoder(NaN)).toThrow();
//         expect(() => decoder(1 / 0)).toThrow();
//     });
// });
