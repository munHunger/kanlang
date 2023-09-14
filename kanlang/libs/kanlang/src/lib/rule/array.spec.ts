import { testCodeGen, testThrows, testToString } from '../testHelper.spec';
import { ArrayRule } from './array';
import { Body } from './body';
import { Expression } from './expression';
import { Function } from './function';
import { Main } from './main';

describe('arrays', () => {
  describe('creating arrays', () => {
    testToString('can create empty arrays', new ArrayRule(), '[]', '[]');
    testToString(
      'it handles single number value arrays',
      new ArrayRule(),
      '[1]',
      '[1]'
    );
    testToString(
      'it handles single string value arrays',
      new ArrayRule(),
      '["hello"]',
      '["hello"]'
    );
    testToString(
      'it can create variable arrays',
      new Expression(),
      'a := [1] as [num]',
      'a := ([1] as [num]) [a: [num]]'
    );
    testToString(
      'it handles arrays of arbitrary length',
      new ArrayRule(),
      '[1,2,3,4,5,6]',
      '[1,2,3,4,5,6]'
    );
    testThrows(
      'Throws errors if you mix types',
      new ArrayRule(),
      '[1,"abc"]',
      /.*cannot mix types.*/
    );
  });
  describe('expression', () => {
    testCodeGen(
      'can chain expressions',
      new Expression(),
      '[1,2,3,4,5,6][0..3][1]',
      '[1,2,3,4,5,6].slice(0, 3)[1]'
    );
    testThrows(
      'validates type of var',
      new Function(),
      '(): SysCode {a := 3; b := a[0]; return false as SysCode; }',
      /.*expression is not an array.*/
    );
  });
  describe('destructing array', () => {
    testCodeGen(
      'can join data via destructuring (prefix)',
      new ArrayRule(),
      '[1, ...[2,3,4]]',
      '[1,...[2,3,4]]'
    );
    testCodeGen(
      'can join data via destructuring (suffix)',
      new ArrayRule(),
      '[...[2,3,4], 1]',
      '[...[2,3,4],1]'
    );
    testCodeGen(
      'can join data to type aliased array',
      new Main(),
      `
      type Bag alias [string]
      (a: Bag): Bag {
        return [...a, "hello"] as Bag;
      }
      `,
      ['function Bag___Bag(a){', 'return [...a,"hello"];}'].join('\n')
    );
  });
  describe('single value', () => {
    testCodeGen(
      'can retrieve a value at position',
      new ArrayRule(),
      '[1,2,3,4,5][3]',
      '[1,2,3,4,5][3]'
    );
  });
  describe('ranges', () => {
    testCodeGen(
      'can slice an array',
      new ArrayRule(),
      `[1,2,3,4,5,6][0..3]`,
      '[1,2,3,4,5,6].slice(0, 3)'
    );
    testCodeGen(
      'slice arguments can be expressions',
      new ArrayRule(),
      '[1,2,3,4,5][0 .. 1 + 2]',
      '[1,2,3,4,5].slice(0, 1 + 2)'
    );
    testThrows(
      "throws errors if the slice arguments aren't numeric",
      new ArrayRule(),
      '[1,2,3][0.."hello"]',
      /.*not.*num.*/
    );
  });
});
