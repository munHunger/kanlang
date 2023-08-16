import { testThrows, testToString } from '../testHelper.spec';
import { Function } from './function';

describe('function', () => {
  testToString(
    'function calls work',
    new Function(),
    '(a: num, b: boolean):num {return a + 1;}',
    [
      'fn (a: num, b: boolean) [a: num, b: boolean]',
      'return +(<a>, 1) [a: num, b: boolean]',
    ].join('\n')
  );

  testThrows(
    'function calls work',
    new Function(),
    '(a: num, b: boolean):num {return a + b;}',
    /.*b.*not.*numeric/
  );
});
