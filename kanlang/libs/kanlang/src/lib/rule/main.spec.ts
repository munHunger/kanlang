import { testCodeGen, testNoThrows } from '../testHelper.spec';
import { Main } from './main';

describe('main function', () => {
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
