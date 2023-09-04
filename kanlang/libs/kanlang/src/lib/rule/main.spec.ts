import { testCodeGen } from '../testHelper.spec';
import { Main } from './main';

describe('main function', () => {
  testCodeGen(
    'executes the starting rule if it exists',
    new Main(),
    `
  (): SysCode {
    return true as SysCode;
  }`,
    ['function __SysCode(){', 'return true;}', '___SysCode();'].join('\n')
  );
});
