import { State } from '../earley';
import { ParseTree } from '../parseTree';
import { Token } from '../tokenizer';
import { Body } from './body';
import { NewRuleType, Rule } from './rule';

/**
 * (identifier: type): type {
 *  body
 * }
 */
export class Function extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
        root: 0,
        parts: [
          ['punct', '('],
          new ArgumentArray(),
          ['punct', ')'],
          ['punct', ':'],
          'identifier',
          ['punct', '{'],
          new Body(),
          ['punct', '}'],
        ],
        carryScope: true,
        treeClass: class extends ParseTree {
          toString(): string {
            return `fn (${this.children[0].toString()}) ${this.printScope()}\n${this.children[1].toString()}`;
          }
        },
      },
    ];
  }
}

export class ArgumentArray extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
        root: 0,
        parts: [this, ['punct', ','], new Argument()],
        carryScope: true,
        treeClass: class extends ParseTree {
          toString(): string {
            return `${this.children[0].toString()}, ${this.children[1].toString()}`;
          }
          validate(): void {
            this.mergeParentScope();
          }
        },
      },
      {
        root: 0,
        carryScope: true,
        parts: [new Argument()],
        invisibleNode: true,
      },
      {
        root: 0,
        parts: [], //epsilon rule
      },
    ];
  }
}

export class Argument extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
        root: 0,
        parts: ['identifier', ['punct', ':'], 'identifier'],
        carryScope: true,
        treeClass: class extends ParseTree {
          toString(): string {
            return `${this.tokenValue(0)}: ${this.tokenValue(2)}`;
          }
          validate(): void {
            this.addToScope({
              name: this.tokenValue(0),
              type: this.tokenValue(2),
            });
          }
        },
        meta: (state) => ({
          name: getValue(state.tree[0]),
          type: getValue(state.tree[2]),
        }),
        semantic: (scope, state) => ({
          name: (state.tree[0] as Token).value,
          variable: {
            constant: false,
            primitive: true, //TODO: is it?
            type: (state.tree[2] as Token).value,
          },
        }),
      },
    ];
  }
}
function getValue(part: State | Token): string {
  return (part as Token).value; //lets assume this is safe
}
