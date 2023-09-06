import { testCodeGen, testThrows, testToString } from '../testHelper.spec';
import { Main } from './main';

describe('typerequest', () => {
  testCodeGen(
    'can request variables (js)',
    new Main(),
    `
type Celsius alias num
type Fahrenheit alias num
type Kelvin alias num

(f: Fahrenheit): Celsius {
  return f - 32 * 5 / 9 as Celsius;
}
(c: Celsius): Kelvin {
  return c + 273.15 as Kelvin;
}
(f: Fahrenheit): Kelvin {
  return *Kelvin;
}
    `,
    [
      'function Fahrenheit___Celsius(f){',
      'return f - 32 * 5 / 9;}',
      'function Celsius___Kelvin(c){',
      'return c + 273.15;}',
      'function Fahrenheit___Kelvin(f){',
      'return Celsius___Kelvin(Fahrenheit___Celsius(f));}',
    ].join('\n')
  );

  testThrows(
    'can handle multiple return types',
    new Main(),
    `
  type Celsius alias num
  type Fahrenheit alias num
  type Kelvin alias num

  (f: Fahrenheit): Celsius | Kelvin {
    return f - 32 * 5 / 9 as Celsius;
    return f - 32 * 5 / 9 + 273.15 as Kelvin;
  }
  (f: Fahrenheit): Kelvin {
    return *Celsius + 273.15 as Kelvin;
  }
      `,
    /.*covered.*all cases.*/
  );

  testCodeGen(
    'can request when there are multiple return types if that is handled',
    new Main(),
    `
    type Celsius alias num
    type Fahrenheit alias num
    type Kelvin alias num
  
    (f: Fahrenheit): Celsius | Kelvin {
      if false {
        return f - 32 * 5 / 9 as Celsius;
      }
      return f - 32 * 5 / 9 + 273.15 as Kelvin;
    }
    (f: Fahrenheit): Kelvin {
      c := *Celsius {
        k: Kelvin {
            return k;
        }
      };
      return c + 273.15 as Kelvin;
    }
    `,
    [
      'function Fahrenheit___Celsius_Kelvin(f){',
      'if (false) {return {Celsius: f - 32 * 5 / 9};};',
      'return {Kelvin: f - 32 * 5 / 9 + 273.15};}',
      'function Fahrenheit___Kelvin(f){',
      'let ___Celsius = Fahrenheit___Celsius_Kelvin(f);',
      'if(!___Celsius.Celsius) {',
      'if(___Celsius.Kelvin) {',
      'let k = ___Celsius.Kelvin;',
      'return k;',
      '}',
      '}',
      'let c = ___Celsius.Celsius;',
      'return c + 273.15;}',
    ].join('\n')
  );

  testCodeGen(
    'Can print to the console',
    new Main(),
    `
  (): SysCode {
    msg := "hello world" as LogMsg; *LogResult;
    return true as SysCode;
  }
  `,
    [
      'function __SysCode(){',
      'let msg = "hello world";',
      'LogMsg___LogResult(msg);',
      'return true;}',
      '__SysCode();',
    ].join('\n')
  );

  testToString(
    'Can print to the console',
    new Main(),
    `
  (): SysCode {
    msg := "hello world" as LogMsg; *LogResult;
    return true as SysCode;
  }
  `,
    [
      'fn (): SysCode []',
      'msg := ("hello world" as LogMsg) [msg: LogMsg] [msg: LogMsg]',
      'LogResult fetched from scope  [msg: LogMsg]',
      'return (true as SysCode) [msg: LogMsg]',
    ].join('\n')
  );

  testThrows(
    'throws errors when there is no path to transform',
    new Main(),
    `
    type Celsius alias num
    type Kelvin alias num
    
    (): Kelvin {
      a := 0 as Celsius;
      x := a to Kelvin;
      return 0 as Kelvin;
    }
  `,
    /.*no possible path.*Kelvin.*/
  );
  testCodeGen(
    'Can explicitly ask for type conversion (js)',
    new Main(),
    `
    type Celsius alias num
    type Kelvin alias num
    (c: Celsius): Kelvin {
      return c + 1 as Kelvin;
    }
    (): Kelvin {
      a := 0 as Celsius;
      b := 0 as Celsius;
      c := 0 as Kelvin;
      x := a to Kelvin;
      y := b to Kelvin;
      z := 64 as Celsius to Kelvin;
      return 0 as Kelvin;
    }
  `,
    [
      'function Celsius___Kelvin(c){',
      'return c + 1;}',
      'function __Kelvin(){',
      'let a = 0;',
      'let b = 0;',
      'let c = 0;',
      'let x = Celsius___Kelvin(a);',
      'let y = Celsius___Kelvin(b);',
      'let _Celsius_Kelvin = 64;',
      'let z = Celsius___Kelvin(_Celsius_Kelvin);',
      'return 0;}',
    ].join('\n')
  );

  testToString(
    'Can explicitly ask for type conversion',
    new Main(),
    `
    type Celsius alias num
    type Kelvin alias num
    (c: Celsius): Kelvin {
      return c + 1 as Kelvin;
    }
    (): Kelvin {
      a := 0 as Celsius;
      x := a to Kelvin;
      return 0 as Kelvin;
    }
  `,
    [
      '{Celsius is num}',
      '{Kelvin is num}',
      'fn (c: Celsius): Kelvin [{Celsius is num}, {Kelvin is num}, c: Celsius]',
      'return (+(<c>, 1) as Kelvin) [{Celsius is num}, {Kelvin is num}, c: Celsius]',
      'fn (): Kelvin [{Celsius is num}, {Kelvin is num}]',
      'a := (0 as Celsius) [{Celsius is num}, {Kelvin is num}, a: Celsius] [{Celsius is num}, {Kelvin is num}, a: Celsius]', //scope gets double printed but it is "fine"
      'x := <a> transformed to Kelvin  [{Celsius is num}, {Kelvin is num}, a: Celsius, x: Kelvin] [{Celsius is num}, {Kelvin is num}, a: Celsius, x: Kelvin]',
      'return (0 as Kelvin) [{Celsius is num}, {Kelvin is num}, a: Celsius, x: Kelvin]',
    ].join('\n')
  );

  testToString(
    'can request variables',
    new Main(),
    `
type Celsius alias num
type Fahrenheit alias num
type Kelvin alias num

(f: Fahrenheit): Celsius {
  return f - 32 * 5 / 9 as Celsius;
}
(c: Celsius): Kelvin {
  return c - 273 as Kelvin;
}
(f: Fahrenheit): Kelvin {
  return *Celsius - 273 as Kelvin;
}
    `,
    [
      '{Celsius is num}',
      '{Fahrenheit is num}',
      '{Kelvin is num}',
      'fn (f: Fahrenheit): Celsius [{Celsius is num}, {Fahrenheit is num}, {Kelvin is num}, f: Fahrenheit]',
      'return (-(<f>, /(*(32, 5), 9)) as Celsius) [{Celsius is num}, {Fahrenheit is num}, {Kelvin is num}, f: Fahrenheit]',
      'fn (c: Celsius): Kelvin [{Celsius is num}, {Fahrenheit is num}, {Kelvin is num}, c: Celsius]',
      'return (-(<c>, 273) as Kelvin) [{Celsius is num}, {Fahrenheit is num}, {Kelvin is num}, c: Celsius]',
      'fn (f: Fahrenheit): Kelvin [{Celsius is num}, {Fahrenheit is num}, {Kelvin is num}, f: Fahrenheit]',
      'return (-(Celsius fetched from scope , 273) as Kelvin) [{Celsius is num}, {Fahrenheit is num}, {Kelvin is num}, f: Fahrenheit]',
    ].join('\n')
  );
});
