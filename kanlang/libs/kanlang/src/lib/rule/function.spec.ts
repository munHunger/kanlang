import { testCodeGen, testThrows, testToString } from '../testHelper.spec';
import { Function } from './function';

describe('function', () => {
  testCodeGen(
    'function calls work',
    new Function(),
    '(a: num, b: boolean):num \n{return a + 1;}',
    'function num_boolean___num(a, b){\nreturn a + 1;}'
  );
  testToString(
    'function calls work',
    new Function(),
    '(a: num, b: boolean):num \n{return a + 1;}',
    [
      'fn (a: num, b: boolean): num [a: num, b: boolean]',
      'return +(<a>, 1) [a: num, b: boolean]',
    ].join('\n')
  );
  testThrows(
    'throws error if return type is not function type',
    new Function(),
    '():num {return true;}',
    /.*type missmatch.*return.*boolean.*expecting.*num.*/
  );
  testThrows(
    'throws error if return type is not function type',
    new Function(),
    '():num | boolean {return true;}',
    /.*Not all return types are matched.*/
  );

  testThrows(
    'throws error if missing return statement in function',
    new Function(),
    '(a:num):num {b := a + 1;}',
    /.*missing.*return.*statement/
  );

  testThrows(
    'it throws errors if you mismatch types from argument',
    new Function(),
    '(a: num, b: boolean):num\n {return a + b;}',
    /.*b.*not.*numeric/
  );
});
