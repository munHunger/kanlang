import { testCodeOutput } from '../testHelper.spec';
import * as fs from 'fs';
describe('fs', () => {
  beforeAll(() => {
    if (!fs.existsSync('/tmp/kanlang.test')) {
      fs.writeFileSync('/tmp/kanlang.test', 'hello world', 'utf-8');
    }
  });
  testCodeOutput(
    'can read file content',
    `
    (): SysCode {
        path := "/tmp/kanlang.test" as FilePath;
        msg := *FileContent as LogMsg; *LogResult;
        return true as SysCode;
    }`,
    'hello world'
  );
});
