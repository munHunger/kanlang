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
});
