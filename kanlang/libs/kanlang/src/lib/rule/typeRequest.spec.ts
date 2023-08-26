import { testCodeGen, testToString } from '../testHelper.spec';
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
      'function Fahrenheit_Celsius(f){return f - 32 * 5 / 9;}',
      'function Celsius_Kelvin(c){return c + 273.15;}',
      'function Fahrenheit_Kelvin(f){return Celsius_Kelvin(Fahrenheit_Celsius(f));}',
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
  return f - 32 * 5 / 9 as Celsius; //TODO: should have parenthesis
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
      'return (-(Celsius fetched from scope, 273) as Kelvin) [{Celsius is num}, {Fahrenheit is num}, {Kelvin is num}, f: Fahrenheit]',
    ].join('\n')
  );
});
