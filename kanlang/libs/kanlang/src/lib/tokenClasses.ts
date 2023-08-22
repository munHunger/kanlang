export type TokenType =
  | 'keyword'
  | 'operator'
  | 'comment'
  | 'literal'
  | 'whitespace'
  | 'boolean'
  | 'number'
  | 'punct'
  | 'identifier';

export type TokenClass = {
  name: TokenType;
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
      match: new RegExp('(if|else|for|while|return|let|type|alias|as)'),
    },
  ],
};

export const punct: TokenClass = {
  name: 'punct',
  patterns: [
    {
      tmClass: 'support.other.kanlang',
      match: new RegExp('(;|\\(|\\)|{|}|,|:)'),
    },
  ],
};

export const operator: TokenClass = {
  name: 'operator',
  patterns: [
    {
      tmClass: 'keyword.operator.kanlang',
      match: new RegExp('(\\+|==|=|!|-|\\*|/)'),
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
      tmClass: 'constant.numeric',
      match: new RegExp(/\d+(\.\d+)?/),
    },
  ],
};

export const boolean: TokenClass = {
  name: 'boolean',
  patterns: [
    {
      tmClass: 'constant.language',
      match: new RegExp(/true|false/),
    },
  ],
};
export const identifier: TokenClass = {
  name: 'identifier',
  patterns: [
    {
      tmClass: 'variable.parameter.kanlang',
      match: new RegExp(/[a-zA-Z][a-zA-Z0-9_]*/),
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
