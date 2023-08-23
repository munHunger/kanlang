import { ParseTree } from '../parseTree';
import { Body } from './body';
import { ReturnExpressionTree } from './expression';
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
          toJs(): string {
            return `function ${(
              this.children[0] as ArgumentParseTree
            ).types.join('_')}_${
              this.returnType
            }(${this.children[0].toJs()}){${this.children[1].toJs()}}`;
          }
          validate(): void {
            //
            const body = this.children[1];
            const ret = body.children.find(
              (child) => child instanceof ReturnExpressionTree
            );
            if (!ret) this.addError('missing return statement from function');
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

export abstract class ArgumentParseTree extends ParseTree {
  abstract get types(): string[];
}
export class ArgumentArray extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
        root: 0,
        parts: [this, ['punct', ','], new Argument()],
        treeClass: class extends ArgumentParseTree {
          get types(): string[] {
            if (this.children[0] instanceof ArgumentParseTree) {
              return this.children[0].types.concat([this.children[1].type()]);
            } else if (this.children[0].toString().length == 0) {
              //epsilon rule
              return [this.children[1].type()];
            } else {
              return [this.children[0].type(), this.children[1].type()];
            }
          }
          toJs(): string {
            return `${this.children[0].toJs()}, ${this.children[1].toJs()}`;
          }
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
          type(): string {
            return this.tokenValue(2);
          }
          toString(): string {
            return `${this.tokenValue(0)}: ${this.type()}`;
          }
          toJs(): string {
            return this.tokenValue(0);
          }
          validate(): void {
            this.addToScope({
              name: this.tokenValue(0),
              variable: {
                constant: false,
                type: this.type(),
              },
            });
          }
        },
      },
    ];
  }
}
