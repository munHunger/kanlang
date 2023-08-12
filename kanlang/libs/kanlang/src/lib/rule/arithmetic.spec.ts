import { testAST } from '../testHelper.spec';

describe('arithmetic', () => {
  testAST('parses simple additions into an AST', '1+2', '+(1, 2)');
  testAST('parses arithmetic chains', '1+2+3', '+(1, +(2, 3))');
  testAST(
    'Handles arithmetic ordering',
    '1-2+3/2*4',
    '*(4, /(2, +(3, -(1, 2))))'
  );
});
