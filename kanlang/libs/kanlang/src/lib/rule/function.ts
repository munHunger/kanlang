import { ParseTree } from '../parseTree';
import { Body } from './body';
import { NewRuleType, Rule } from './rule';

export abstract class FunctionParseTree extends ParseTree {
  abstract get returnType(): string;
}

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
        treeClass: class extends FunctionParseTree {
          get returnType(): string {
            return this.tokenValue(4);
          }
          toString(): string {
            return `fn (${this.children[0].toString()}): ${this.tokenValue(
              4
            )} ${this.printScope()}\n${this.children[1].toString()}`;
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
        parts: [new Argument()],
        invisibleNode: true,
      },
      {
        root: 0,
        parts: [], //epsilon rule
        treeClass: class extends ParseTree {
          toString(): string {
            return ``;
          }
        },
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
      },
    ];
  }
}
