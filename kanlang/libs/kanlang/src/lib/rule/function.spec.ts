import { EarleyParser } from '../earley';
import { testToString } from '../testHelper.spec';
import { Tokenizer } from '../tokenizer';
import { Function } from './function';
import { promises as fs } from 'fs';
import { Main } from './main';
import { SemanticAnalyzer } from '../semantic';
const tokenizer = new Tokenizer();

const parser = new EarleyParser(new Main());

const semantic = new SemanticAnalyzer();

describe('function', () => {
  testToString(
    'function calls work',
    new Function(),
    '(){let a = 2;}',
    '+(1, 2)'
  );

  it('can compile the functions.kan code', async () => {
    const kanlangCode = await fs.readFile(
      __dirname + '/functions.kan',
      'utf-8'
    );
    const tree = semantic.analyze(
      parser.parse(tokenizer.tokenize(kanlangCode))
    );
  });
});
