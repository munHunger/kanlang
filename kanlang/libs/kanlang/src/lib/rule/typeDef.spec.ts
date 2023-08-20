import { testToString } from '../testHelper.spec';
import { TypeDef } from './typeDef';

describe('TypeDef', () => {
  testToString(
    'can alias primitive type',
    new TypeDef(),
    'type a alias num',
    '{a is num}'
  );
});
