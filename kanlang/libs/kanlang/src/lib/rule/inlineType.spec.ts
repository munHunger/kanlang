import { testThrows, testToString } from '../testHelper.spec';
import { InlineType } from './inlineType';
describe('inline type', () => {
  testThrows(
    'thows if the type is not defined',
    new InlineType(),
    'Celsius',
    /.*/
  );
  testToString(
    'Can define an inline alias',
    new InlineType(),
    'Celsius alias num',
    '{Celsius is num}'
  );
  testToString(
    'Can define an inline alias an array',
    new InlineType(),
    'Celsius alias [num]',
    '{Celsius is [num]}'
  );
});
