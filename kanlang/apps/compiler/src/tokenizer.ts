export type Token = {
  value: string;
  type: string;
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

export class Tokenizer {
  tokenClasses: TokenClass[];
  constructor() {
    this.tokenClasses = [comment, keyword, operator];
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
    return [];
  }
}
