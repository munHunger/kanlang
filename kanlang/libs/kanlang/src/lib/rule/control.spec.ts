import { testCodeGen, testThrows, testToString } from '../testHelper.spec';
import { Body } from './body';

describe('control', () => {
  describe('if', () => {
    testCodeGen(
      'if statements work',
      new Body(),
      `if true {}`,
      ['if (true) {}'].join('\n')
    );

    testThrows(
      'throws if statement is not boolean',
      new Body(),
      `
    if 4 {}`,
      /.*expression is not of type boolean.*/
    );
  });
  describe('for', () => {
    testCodeGen(
      'iterating over arrays',
      new Body(),
      `sum := 0; for i in [1,2,3,4,5] {sum = sum + i;}`,
      ['let sum = 0;', 'for (let i in [1,2,3,4,5]) {sum = sum + i;};'].join(
        '\n'
      )
    );
  });
});
