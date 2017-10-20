// @flow

// import { decodeNumber } from '../number';
// import { decodeObject } from '../object';
// import { optional } from '../optional';
// import { decodeString } from '../string';

// describe('objects and fields', () => {
//     it('decodes objects and fields', () => {
//         const dec = decodeObject({
//             id: decodeNumber(),
//             name: decodeString(),
//         });
//         expect(dec({ id: 1, name: 'test' })).toEqual({ id: 1, name: 'test' });
//         // Superfluous keys are just ignored
//         expect(dec({ id: 1, name: 'test', superfluous: 'abundance' })).toEqual({ id: 1, name: 'test' });
//     });

//     it('decodes objects and fields (ignore fields)', () => {
//         // Extra (unwanted) keys are ignored
//         const dec = decodeObject({
//             id: decodeNumber(),
//             name: decodeString(),
//             extra: optional(decodeString()),
//         });
//         expect(dec({ id: 1, name: 'test' })).toEqual({ id: 1, name: 'test', extra: undefined });
//         expect(dec({ id: 1, name: 'test', extra: 'foo' })).toEqual({ id: 1, name: 'test', extra: 'foo' });
//         expect(() => dec({})).toThrow(); // missing keys 'id' and 'name'
//     });
// });
