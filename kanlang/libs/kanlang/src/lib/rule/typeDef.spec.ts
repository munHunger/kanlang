import { testToString } from '../testHelper.spec';
import { Main } from './main';
import { TypeDef } from './typeDef';

describe('TypeDef', () => {
  testToString(
    'can alias primitive type',
    new TypeDef(),
    'type a alias num',
    '{a is num}'
  );
  testToString(
    'can do arithmetic with something that aliases num',
    new Main(),
    'type Unit alias num\n' + '(a: Unit):num {return a + 1;}',
    [
      '{Unit is num}',
      'fn (a: Unit): num [{Unit is num}, a: Unit]',
      'return +(<a>, 1) [{Unit is num}, a: Unit]',
    ].join('\n')
  );
});
