// @flow

// import { fail } from '../fail';

// describe('fail', () => {
//     const decoder = fail('Oops', 'I always fail');

//     it('valid', () => {
//         // Nothing is valid for a failing decoder :)
//     });

//     it('throws runtime error if inputs are not strings', () => {
//         expect(() => decoder('foo')).toThrow();
//         expect(() => decoder(1)).toThrow();
//         expect(() => decoder(true)).toThrow();
//         expect(() => decoder(null)).toThrow();
//         expect(() => decoder(undefined)).toThrow();
//         expect(() => decoder(NaN)).toThrow();
//         expect(() => decoder(1 / 0)).toThrow();
//         expect(() => decoder([1, 2, 3])).toThrow();
//         expect(() => decoder({ x: 1, y: 2 })).toThrow();
//     });
// });
