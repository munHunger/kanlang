import { testToString } from '../testHelper.spec';
import { VariableAssignment } from './variable';

describe('variable', () => {
  testToString(
    'assigns variables',
    new VariableAssignment(),
    'a := 2',
    'a := 2 [a: num]'
  );
});
