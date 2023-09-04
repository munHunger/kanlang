import { testCodeGen, testThrows } from '../testHelper.spec';
import { BooleanRule } from './boolean';
import { Main } from './main';

describe('boolean logic', () => {
  testCodeGen(
    'can generate boolean expressions comparing numbers',
    new BooleanRule(),
    '13 == 14',
    '13 == 14'
  );
  testCodeGen(
    'can invert an expression',
    new BooleanRule(),
    '!false',
    '!false'
  );
  testThrows(
    'throws when comparing numbers to boolean',
    new BooleanRule(),
    '13 > true',
    /.*comparison.*different types.*/
  );
  testCodeGen(
    'comparing different types of the same superset',
    new Main(),
    `
    type Celsius alias num
    type NonFreezingCelsius alias Celsius
    (c: Celsius): NonFreezingCelsius {
        if c > 0 {
            return c as NonFreezingCelsius;
        }
        return 0 as NonFreezingCelsius;
    }`,
    [
      'function Celsius___NonFreezingCelsius(c){',
      'if (c > 0) {return c;};',
      'return 0;}',
    ].join('\n')
  );
});
