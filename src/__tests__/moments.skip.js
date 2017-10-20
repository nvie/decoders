// @flow

// import moment from 'moment';

// import { decodeMoment, decodeTimestamp } from '../moments';

// describe('decodes moments from JSON', () => {
//     const decoder = decodeMoment();

//     it('returns moment if inputs are timestamps', () => {
//         expect(decoder(63072000000).format()).toBe('1972-01-01T00:00:00Z');
//         expect(decoder(1493161667952).format()).toBe('2017-04-25T23:07:47Z');
//     });

//     it('returns UTC moments if inputs are timezone-agnostic ISO date strings', () => {
//         expect(moment.isMoment(decoder('1972-01-01'))).toBe(true);
//         expect(decoder('1972-01-01').format()).toBe('1972-01-01T00:00:00Z');
//         expect(decoder('2017-04-25T23:07:47').format()).toBe('2017-04-25T23:07:47Z');
//     });

//     it('returns UTC moments if inputs are timezone-aware ISO date strings', () => {
//         expect(moment.isMoment(decoder('2017-04-25T23:07:47+0200'))).toBe(true);
//         expect(decoder('2017-04-25T23:07:47+0200').format()).toBe('2017-04-25T23:07:47+02:00');
//     });

//     it('throws runtime error if inputs are not date representations', () => {
//         expect(() => decoder('')).toThrow();
//         expect(() => decoder('1')).toThrow();
//         expect(() => decoder('not a date')).toThrow();
//         expect(() => decoder(null)).toThrow();
//         expect(() => decoder(undefined)).toThrow();
//         expect(() => decoder(NaN)).toThrow();
//         expect(() => decoder(1 / 0)).toThrow();
//     });
// });

// describe('decodes timestamps', () => {
//     const decoder = decodeTimestamp();

//     it('returns the same values if inputs are already timestamps', () => {
//         expect(decoder(63072000000)).toBe(63072000000);
//         expect(decoder(1493161667952)).toBe(1493161667952);
//     });

//     it('returns timestamps when inputs are valid date strings', () => {
//         expect(decoder('1972-01-01')).toBe(63072000000);
//         expect(decoder('2017-04-25T23:07:47')).toBe(1493161667000);
//     });

//     it('returns timestamps in UTC, losing any timezone information', () => {
//         const t = 1493154467000;

//         // Both inputs lead to the same timestamp (so losing tz info!)
//         expect(decoder('2017-04-25T21:07:47Z')).toBe(t);
//         expect(decoder('2017-04-25T23:07:47+0200')).toBe(t);
//     });
// });
