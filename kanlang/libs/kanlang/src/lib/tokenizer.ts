export type TokenType =
  | 'keyword'
  | 'operator'
  | 'comment'
  | 'literal'
  | 'whitespace'
  | 'number';
export type Token = {
  value: string;
  type: TokenType;
  start: number;
  end: number;
};

type TokenClass = {
  name: string;
  patterns: {
    tmClass: string;
    match: RegExp;
  }[];
};

export const keyword: TokenClass = {
  name: 'keyword',
  patterns: [
    {
      tmClass: 'keyword.control.kanlang',
      match: new RegExp('(if|else|for|while|return)'),
    },
  ],
};
export const operator: TokenClass = {
  name: 'operator',
  patterns: [
    {
      tmClass: 'keyword.operator.kanlang',
      match: new RegExp('(\\+|=)'),
    },
  ],
};

export const comment: TokenClass = {
  name: 'comment',
  patterns: [
    {
      tmClass: 'comment.block',
      match: new RegExp('//.*'),
    },
  ],
};

export const literal: TokenClass = {
  name: 'literal',
  patterns: [
    {
      tmClass: 'string',
      match: new RegExp(/".*"/),
    },
  ],
};

export const number: TokenClass = {
  name: 'number',
  patterns: [
    {
      tmClass: 'constant',
      match: new RegExp(/\d+(\.\d+)?/),
    },
  ],
};

export const ws: TokenClass = {
  name: 'whitespace',
  patterns: [
    {
      tmClass: 'whitespace.kanlang',
      match: new RegExp(/\s/),
    },
  ],
};

export class Tokenizer {
  tokenClasses: TokenClass[];
  constructor() {
    this.tokenClasses = [comment, keyword, ws, literal, number, operator];
  }

  get tmLang(): any {
    return {
      name: 'Kanlang',
      patterns: this.tokenClasses.map((tc) => ({ include: '#' + tc.name })),
      repository: this.tokenClasses.reduce((acc, val) => {
        acc[val.name] = {
          patterns: val.patterns.map((pattern) => ({
            name: pattern.tmClass,
            match: '' + pattern.match.source,
          })),
        };
        return acc;
      }, {}),
      scopeName: 'text.kanlang',
    };
  }

  tokenize(input: string): Token[] {
    if (input == undefined) throw new Error('cannot handle null strings');
    if (input.length == 0) return [];
    const result: Token[] = [];
    let index = 0;
    let lineNumber = 0;
    let character = 0;
    while (input.length > 0) {
      let hasMatch = false;
      for (const tC of this.tokenClasses) {
        const match = tC.patterns
          .map((pattern) => {
            pattern.match.lastIndex = 0; //reset the regex
            return pattern.match.exec(input);
          })
          .find((v) => v && v.index == 0);
        if (match) {
          result.push({
            value: match[0],
            start: index,
            end: index + match[0].length,
            type: tC.name as any, //TODO: should fix this
          });
          input = input.substring(match[0].length);
          index += match[0].length;
          character += match[0].length;
          if (match[0] == '\n') {
            lineNumber++;
            character = 0;
          }
          hasMatch = true;
          break;
        }
      }
      if (!hasMatch) {
        throw new TokenizerError(
          index,
          lineNumber,
          character,
          input,
          `unrecognized character`
        );
      }
    }
    return result;
  }
}

export class TokenizerError extends Error {
  constructor(
    public charIndex: number,
    public lineNumber: number,
    public character: number,
    public inputString: string,
    message: string
  ) {
    super(
      `could not tokenize input. \n${message}\nat ${charIndex}\nnear ${inputString.substring(
        0,
        15
      )}`
    );

    this.name = TokenizerError.name;
  }

  get length(): number {
    let l = this.inputString.indexOf('\n');
    if (l === -1) l = this.inputString.length;
    return l;
  }
}
