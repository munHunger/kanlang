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

  describe('nested', () => {
    testCodeGen(
      'type request in control statement',
      new Main(),
      `
        type Inc alias num
        (a: num): Inc { return a + 1 as Inc; }
        (): SysCode {
          for i in [1,2,3,4,5] {
            b := *Inc;
          }
          return true as SysCode;
        }
        `,
      [
        'function num___Inc(a){',
        'return a + 1;}',
        'function __SysCode(){',
        'for (let i of [1,2,3,4,5]) {',
        'let b = num___Inc(i);};',
        'return true;}',
        '__SysCode();',
      ].join('\n')
    );
    testCodeGen(
      'type request with catch in control statement',
      new Main(),
      `
        type Error alias string
        type Inc alias num
        (a: num): Inc | Error { 
          if a < 0 { return "less than 0" as Error; }
          return a + 1 as Inc; }
        (): SysCode {
          for i in [1,2,3,4,5] {
            b := *Inc {
              e: Error {
                return false as SysCode;
              }
            };
          }
          return true as SysCode;
        }
        `,
      [
        'function num___Inc_Error(a){',
        'if (a < 0) {return {Error: "less than 0"};};',
        'return {Inc: a + 1};}',
        'function __SysCode(){',
        'for (let i of [1,2,3,4,5]) {',
        'let ___Inc = num___Inc_Error(i);',
        'if(!___Inc.Inc) {',
        'if(___Inc.Error) {',
        'let e = ___Inc.Error;',
        'return false;',
        '}',
        '}',
        'let b = ___Inc.Inc;};',
        'return true;}',
        '__SysCode();',
      ].join('\n')
    );
  });

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
  testThrows(
    'throws errors when there is no path to fully transform',
    new Main(),
    `
    type Celsius alias num
    type Fahrenheit alias num
    type Kelvin alias num
    (f: Fahrenheit): Kelvin {
      return f + 1 as Kelvin;
    }
    (): num {
      a := 0 as Celsius;
      return *Kelvin + 1;
    }
  `,
    /.*Cannot find a transformation path to 'Kelvin'.*/
  );
  testCodeGen(
    `doesn't use the catch variables to request`,
    new Main(),
    `
    type Kelvin alias num
    type Error alias string
    (a: string): Kelvin | Error {
      if a == "" {
        return "" as Error;
      }
      return 0 as Kelvin;
    }
    (): SysCode {
      v := "hello";
      *Kelvin {
        e: Error {
          return false as SysCode;
        }
      };
      return true as SysCode;
    }
  `,
    `function string___Kelvin_Error(a){
      if (a == "") {return {Error: ""};};
      return {Kelvin: 0};}
      function __SysCode(){
      let v = "hello";
      let ___Kelvin = string___Kelvin_Error(v);
      if(!___Kelvin.Kelvin) {
      if(___Kelvin.Error) {
      let e = ___Kelvin.Error;
      return false;
      }
      }
      ___Kelvin.Kelvin;
      return true;}
      __SysCode();`
  );
  testCodeGen(
    'can transform when there is a supertype in scope',
    new Main(),
    `
    type Celsius alias num
    type NonNegative alias num
    (n: num): NonNegative {
      if n > 0 {
        return n as NonNegative;
      }
      return 0 as NonNegative;
    }
    (): SysCode {
      c := 14 as Celsius;
      n := *NonNegative;
      return true as SysCode;
    }
  `,
    `function num___NonNegative(n){
      if (n > 0) {return n;};
      return 0;}
      function __SysCode(){
      let c = 14;
      let n = num___NonNegative(c);
      return true;}
      __SysCode();`
      .split('\n')
      .map((l) => l.trim())
      .join('\n')
  );
  testCodeGen(
    'does not ignore iterator when inside body',
    new Main(),
    `
    type NonNegative alias num
    (n: num): NonNegative {
      if n > 0 {
        return n as NonNegative;
      }
      return 0 as NonNegative;
    }
    (): SysCode {
      for v in [1,2,3] {
        if *NonNegative != v {
          return false as SysCode;
        }
      }
      return true as SysCode;
    }
  `,
    `function num___NonNegative(n){
      if (n > 0) {return n;};
      return 0;}
      function __SysCode(){
      for (let v of [1,2,3]) {
      if (num___NonNegative(v) != v) {return false;};};
      return true;}
      __SysCode();`
      .split('\n')
      .map((l) => l.trim())
      .join('\n')
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
