import { EarleyParser } from './earley';
import { Rule } from './rule/rule';
import { SemanticAnalyzer } from './semantic';
import { CodeGenerator } from './codeGen';
import { Tokenizer } from './tokenizer';
const tokenizer = new Tokenizer();

const codeGenerator = new CodeGenerator();

export function testCodeGen(
  message: string,
  startingRule: Rule,
  input: string,
  expected: string,
  withBuiltin?: boolean
) {
  const parser = new EarleyParser(startingRule);
  it(message + ':\n' + input, () =>
    expect(
      codeGenerator
        .generate(
          new SemanticAnalyzer().analyze(
            parser.parse(tokenizer.tokenize(input))
          ),
          withBuiltin
        )
        .split('\n')
        .map((l) => l.trim())
        .filter((v) => v)
        .join('\n')
    ).toEqual(expected)
  );
}

export function testToString(
  message: string,
  startingRule: Rule,
  input: string,
  expected: string
) {
  const parser = new EarleyParser(startingRule);
  it(message + ':\n' + input, () =>
    expect(
      new SemanticAnalyzer()
        .analyze(parser.parse(tokenizer.tokenize(input)))
        .toString()
    ).toEqual(expected)
  );
}

export function testThrows(
  message: string,
  startingRule: Rule,
  input: string,
  expectedError: RegExp
) {
  const parser = new EarleyParser(startingRule);
  it(message + ':' + input, () =>
    expect(() =>
      new SemanticAnalyzer()
        .analyze(parser.parse(tokenizer.tokenize(input)))
        .toString()
    ).toThrow(expectedError)
  );
}
export function testNoThrows(
  message: string,
  startingRule: Rule,
  input: string
) {
  const parser = new EarleyParser(startingRule);
  it(message + ':' + input, () =>
    expect(
      new SemanticAnalyzer()
        .analyze(parser.parse(tokenizer.tokenize(input)))
        .toJs()
    ).toBeDefined()
  );
}
//Need to have a test here (fail otherwise) and don't want this to be a "normal" file
describe('dummy', () => {
  it('1+1', () => expect(true).toBeTruthy());
});
