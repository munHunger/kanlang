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
  return f - 32 * 5 / 9; //TODO: should have parenthesis
}
(c: Celsius): Kelvin {
  return c - 273; //TODO: should allow double
}
(f: Fahrenheit): Kelvin {
  c := *Celsius;
  return c - 273; //TODO: a biit cheeky, should not be needed but here to avoid first version issues with having to variables in scope that tranforms to Kelvin (f,c)
}
    `,
    'a := 2 [a: num]'
  );
});
