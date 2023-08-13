import { testAST } from '../testHelper.spec';
import { Arithmetic } from './arithmetic';

describe('arithmetic', () => {
  testAST(
    'parses simple additions into an AST',
    new Arithmetic(),
    '1+2',
    '+(1, 2)'
  );
  testAST(
    'parses arithmetic chains',
    new Arithmetic(),
    '1+2+3',
    '+(1, +(2, 3))'
  );
  testAST(
    'Handles arithmetic ordering',
    new Arithmetic(),
    '1-2+3/2*4',
    '*(4, /(2, +(3, -(1, 2))))'
  );
});
