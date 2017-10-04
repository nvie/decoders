/**
 * For some reason, using Flow and Jest together breaks since we don't
 * explicitly import the describe, it, and expect functions from somewhere.  So
 * we'll simply mock them out here in this declarations file.
 *
 * If any reader of this message knows a good answer, please let me know :)
 */

declare function describe(title: string, () => void): void;
declare function it(title: string, () => void): void;

declare function expect(any): any;
