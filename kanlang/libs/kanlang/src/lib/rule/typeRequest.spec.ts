import { testToString } from '../testHelper.spec';
import { Main } from './main';

describe('typerequest', () => {
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
  return c - 273 as Kelvin; //TODO: should allow double
}
(f: Fahrenheit): Kelvin {
  return *Celsius - 273 as Kelvin; //TODO: a bit cheeky, should not be needed but here to avoid first version issues with having to variables in scope that tranforms to Kelvin (f,c)
}
    `,
    [
      '{Celsius is num}',
      '{Fahrenheit is num}',
      '{Kelvin is num}',
      'fn (f: Fahrenheit): Celsius [{Celsius is num}, {Fahrenheit is num}, {Kelvin is num}, c: Celsius, f: Fahrenheit]',
      'return (-(<f>, /(*(32, 5), 9)) as Celsius) [{Celsius is num}, {Fahrenheit is num}, {Kelvin is num}, c: Celsius, f: Fahrenheit]',
      'fn (c: Celsius): Kelvin [{Celsius is num}, {Fahrenheit is num}, {Kelvin is num}, c: Celsius, f: Fahrenheit]',
      'return (-(<c>, 273) as Kelvin) [{Celsius is num}, {Fahrenheit is num}, {Kelvin is num}, c: Celsius, f: Fahrenheit]',
      'fn (f: Fahrenheit): Kelvin [{Celsius is num}, {Fahrenheit is num}, {Kelvin is num}, c: Celsius, f: Fahrenheit]',
      'return (-(Celsius fetched from scope, 273) as Kelvin) [{Celsius is num}, {Fahrenheit is num}, {Kelvin is num}, c: Celsius, f: Fahrenheit]',
    ].join('\n')
  );
});
