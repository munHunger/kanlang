import { Main } from '../rule';
import { testCodeGen, testCodeOutput } from '../testHelper.spec';

describe('strings', () => {
  testCodeOutput(
    'can split a string',
    `
  (): SysCode {
      a := "hello world";
      b := " " as SplitOperator;
      for w in *[SubString] {
        msg := w as LogMsg; *LogResult;
      }
      return true as SysCode;
  }
  `,
    ['hello', 'world']
  );
  testCodeOutput(
    'can concat strings',
    `
    (): SysCode {
        a := "hello " as PrefixString;
        b := "world" as SuffixString;
        msg := *StringConcat as LogMsg; *LogResult;
        return true as SysCode;
    }`,
    'hello world'
  );
  // testCodeOutput(
  //   'can convert num to string',
  //   `
  //   (): SysCode {
  //       a := 42;
  //       msg := *NumericString as LogMsg; *LogResult;
  //       return true as SysCode;
  //   }`,
  //   '42'
  // );
  // testCodeOutput(
  //   'can run larger code sample',
  //   `
  //   type Celsius alias num
  //   type Fahrenheit alias num
  //   type Kelvin alias num

  //   (f: Fahrenheit): Celsius {
  //     return (f - 32) * 5 / 9 as Celsius;
  //   }
  //   (c: Celsius): Kelvin {
  //     return c + 273.15 as Kelvin;
  //   }
  //   (f: Fahrenheit): Kelvin {
  //     return *Kelvin;
  //   }
  //   (): SysCode {
  //     f := 3 as Fahrenheit;
  //     k := *Kelvin as num;
  //     msg := *NumericString as LogMsg; *LogResult;
  //     return true as SysCode;
  //   }`,
  //   '257.0388888888889'
  // );
});
