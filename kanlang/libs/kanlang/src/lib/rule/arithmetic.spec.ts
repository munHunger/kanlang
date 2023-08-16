import { testToString } from '../testHelper.spec';
import { Arithmetic } from './arithmetic';

describe('arithmetic', () => {
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
