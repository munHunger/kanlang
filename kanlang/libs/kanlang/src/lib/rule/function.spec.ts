import { testThrows, testToString } from '../testHelper.spec';
import { Function } from './function';

describe('function', () => {
  testToString(
    'function calls work',
    new Function(),
    '(a: num, b: boolean):num {return a + 1;}',
    [
      'fn (a: num, b: boolean): num [a: num, b: boolean]',
      'return +(<a>, 1) [a: num, b: boolean]',
    ].join('\n')
  );
  testThrows(
    'throws error if return type is not function type',
    new Function(),
    '():num {return true;}',
    /.*type missmatch.*return.*boolean.*expecting num.*/
  );

  testThrows(
    'it throws errors if you mismatch types from argument',
    new Function(),
    '(a: num, b: boolean):num {return a + b;}',
    /.*b.*not.*numeric/
  );
});
