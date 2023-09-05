import { testCodeGen, testNoThrows } from '../testHelper.spec';
import { Main } from './main';

describe('main function', () => {
  testCodeGen(
    'executes the starting rule if it exists',
    new Main(),
    `
  (): SysCode {
    return true as SysCode;
  }`,
    [
      'function LogMsg___LogResult(msg) { console.log(msg); }',
      'function __SysCode(){',
      'return true;}',
      '__SysCode();',
    ].join('\n'),
    true
  );

  testCodeGen(
    'calls built ins properly',
    new Main(),
    `
  (): SysCode {
    msg := "hello" as LogMsg; *LogResult;
    return true as SysCode;
  }`,
    [
      'function LogMsg___LogResult(msg) { console.log(msg); }',
      'function __SysCode(){',
      'let msg = "hello";',
      'LogMsg___LogResult(msg);',
      'return true;}',
      '__SysCode();',
    ].join('\n'),
    true
  );

  testNoThrows(
    `doesn't throw on bigger code sample`,
    new Main(),
    `type Celsius alias num
  type Fahrenheit alias num
  type Kelvin alias num
  
  (f: Fahrenheit): Celsius {
    return f - 32 * 5 / 9 as Celsius; 
  }
  (c: Celsius): Kelvin {
    return c - 273 as Kelvin;
  }
  (f: Fahrenheit): Kelvin {
    return *Kelvin;
  }
  (): SysCode {
    msg := "hello" as LogMsg; *LogResult;
    return true as SysCode;
  }`
  );
});
