import { State } from '../earley';
import { Declaration } from '../semantic';
import { Token, TokenType } from '../tokenizer';
import { Expression } from './';
import { Rule, RuleType } from './rule';

export class VariableAssignment extends Rule {
  get rules(): {
    root: number;
    parts: RuleType;
    semantic?: (
      scope: Record<string, Declaration>,
      state: State
    ) => Declaration;
  }[] {
    return [
      {
        root: 0,
        parts: [
          ['keyword', 'let'],
          'identifier',
          ['operator', '='],
          new Expression(),
        ],
        semantic: (scope, state) => ({
          name: (state.tree[1] as Token).value,
          variable: {
            constant: false,
            primitive: true,
            type: 'int',
          },
        }),
      },
    ];
  }
}
