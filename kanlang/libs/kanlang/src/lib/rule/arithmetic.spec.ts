import { testCodeGen, testToString } from '../testHelper.spec';
import { Arithmetic } from './arithmetic';

describe('arithmetic', () => {
  testCodeGen(
    'can generate code',
    new Arithmetic(),
    '1-2+3/2*4',
    '1 - 2 + 3 / 2 * 4'
  );

  testCodeGen('negative numbers are fine', new Arithmetic(), '-1', '-1');

  testToString(
    'parses simple additions into an AST',
    new Arithmetic(),
    '1+2',
    '+(1, 2)'
  );
  testToString(
    'parses arithmetic chains',
    new Arithmetic(),
    '1+2+3',
    '+(1, +(2, 3))'
  );
  testToString(
    'Handles arithmetic ordering',
    new Arithmetic(),
    '1-2+3/2*4',
    '-(1, +(2, *(/(3, 2), 4)))'
  );
});
