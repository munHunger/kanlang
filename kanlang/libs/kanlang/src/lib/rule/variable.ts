import { State } from '../earley';
import { ParseTree } from '../parseTree';
import { Declaration } from '../semantic';
import { Token, TokenType } from '../tokenizer';
import { Expression } from './';
import { NewRuleType, Rule, RuleType } from './rule';

export class VariableAssignment extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
        root: 0,
        parts: [
          ['keyword', 'let'],
          'identifier',
          ['operator', '='],
          new Expression(),
        ],
        treeClass: class extends ParseTree {
          toString(): string {
            return `${this.tokenValue(1)} := ${this.children[0].toString()}`;
          }
        },
        semantic: (scope, state) => ({
          name: (state.tree[1] as Token).value,
          variable: {
            constant: false,
            primitive: true,
            type: (state.tree[3] as State).meta(state).type,
          },
        }),
      },
    ];
  }
}
