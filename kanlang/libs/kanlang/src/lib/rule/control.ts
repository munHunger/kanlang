import { ParseTree } from '../parseTree';
import { Body } from './body';
import { Expression } from './expression';
import { NewRuleType, Rule } from './rule';

export class If extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
        parts: [
          ['keyword', 'if'],
          new Expression(),
          ['punct', '{'],
          new Body(),
          ['punct', '}'],
        ],
        treeClass: class extends ParseTree {
          toJs(): string {
            return `if (${this.children[0].toJs()}) {${
              this.children[1]?.toJs() || ''
            }}`;
          }

          validate(): void {
            if (this.children[0].type() != 'boolean') {
              this.addError(
                'expression is not of type boolean. Received ' +
                  this.children[0].type()
              );
            }
          }
        },
      },
    ];
  }
}
export class ForTree extends ParseTree {
  get iteratorName(): string {
    return '';
  }
}
export class For extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
        parts: [
          ['keyword', 'for'],
          'identifier',
          ['keyword', 'in'],
          new Expression(),
          ['punct', '{'],
          new Body(),
          ['punct', '}'],
        ],
        treeClass: class extends ForTree {
          toJs(): string {
            return `for (let ${
              this.iteratorName
            } of ${this.children[0].toJs()}) {${
              this.children[1]?.toJs() || '/*empty-body*/'
            }}`;
          }

          get iteratorName(): string {
            return this.tokenValue(1);
          }

          postChildAdded(): void {
            //Add identifier only after the array expression has been added (before the body is run)
            if (this.children.length == 1) {
              this.addToScope({
                name: this.iteratorName,
                variable: {
                  type: this.unNestArrayType(
                    this.getSuperTypeOfMatching(
                      this.children[0].type(),
                      this.isArrayType
                    )
                  ),
                  constant: false,
                },
              });
            }
          }

          validate(): void {
            if (
              !this.getSuperTypeOfMatching(
                this.children[0].type(),
                this.isArrayType
              )
            ) {
              this.addError(
                'expression is not of type array. Received ' +
                  this.children[0].type()
              );
            }
          }
        },
      },
    ];
  }
}
