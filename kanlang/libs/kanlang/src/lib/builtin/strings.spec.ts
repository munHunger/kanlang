import { testCodeOutput } from '../testHelper.spec';

describe('strings', () => {
  testCodeOutput(
    'can concat strings',
    `
    (): SysCode {
        a := "hello " as PrefixString;
        b := "world" as SuffixString;
        msg := *StringConcat as LogMsg; *LogResult;
        return true as SysCode;
    }`,
    'hello world'
  );
});
