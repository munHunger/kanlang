import { CompileError } from './compileError';
import { EarleyParser } from './earley';
import * as rules from './rule';
import { Tokenizer } from './tokenizer';
const tokenizer = new Tokenizer();

const parser = new EarleyParser(new rules.Expression());

describe('earley', () => {
  it('throws meaningful errors when there is an unexpected token', () => {
    expect(() => parser.parse(tokenizer.tokenize('2 + true'))).toThrow(
      CompileError
    );
  });
  it('throws meaningful errors when there is an missing token', () => {
    expect(() => parser.parse(tokenizer.tokenize('2 + '))).toThrow(
      CompileError
    );
  });
  it('throws meaningful errors where there is a wildly incorrect input', () => {
    expect(() => parser.parse(tokenizer.tokenize('a := 1 0+ true'))).toThrow(
      CompileError
    );
  });
});
