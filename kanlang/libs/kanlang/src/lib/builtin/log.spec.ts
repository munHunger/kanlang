import { testCodeOutput } from '../testHelper.spec';

describe('logging', () => {
  testCodeOutput(
    'can log hello world to the console',
    `
    (): SysCode {
        msg := "hello world" as LogMsg; *LogResult;
        return true as SysCode;
    }`,
    'hello world'
  );
});
