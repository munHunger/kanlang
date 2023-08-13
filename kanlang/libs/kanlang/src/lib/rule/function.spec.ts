import { testAST } from '../testHelper.spec';
import { Function } from './function';

describe('function', () => {
  testAST('function calls work', new Function(), '(){let a = 2;}', '+(1, 2)');
});
