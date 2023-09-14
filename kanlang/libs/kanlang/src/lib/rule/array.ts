import { ParseTree } from '../parseTree';
import { Expression } from './expression';
import { NewRuleType, Rule } from './rule';

export class ArrayRule extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
        parts: [
          ['punct', '['],
          ['punct', ']'],
        ], //creation
        treeClass: class extends ParseTree {
          toString(): string {
            return `[]`;
          }
          toJs(): string {
            return `[]`;
          }
          type(): string {
            return `[]`;
          }
        },
      },
      {
        parts: [['punct', '['], new ArrayData(), ['punct', ']']], //creation
        treeClass: class extends ParseTree {
          toString(): string {
            return `[${this.children[0].toString()}]`;
          }
          toJs(): string {
            return `[${this.children[0].toJs()}]`;
          }
          type(): string {
            return `[${this.children[0].type()}]`;
          }
        },
      },
      ...([this, new Expression()]
        .map((arr) => [
          {
            parts: [
              arr,
              ['punct', '['],
              new Expression(),
              ['operator', '..'],
              new Expression(),
              ['punct', ']'],
            ], //slice
            treeClass: class extends ParseTree {
              toJs(): string {
                return `${this.children[0].toJs()}.slice(${this.children[1].toJs()}, ${this.children[2].toJs()})`;
              }
              toString(): string {
                return `${this.children[0].toString()}[${this.children[1].toString()}..${this.children[1].toString()}]`;
              }
              validate(): void {
                if (!this.isArrayType(this.children[0].type())) {
                  this.addError(`expression is not an array`);
                }
                if (
                  this.children[1].type() != 'num' ||
                  this.children[2].type() != 'num'
                ) {
                  this.addError('invalid range. not numeric');
                }
              }
              type(): string {
                return `[${this.children[0].type()}]`;
              }
            },
          },
          {
            parts: [arr, ['punct', '['], new Expression(), ['punct', ']']],
            treeClass: class extends ParseTree {
              toJs(): string {
                return `${this.children[0].toJs()}[${this.children[1].toJs()}]`;
              }
              toString(): string {
                return `${this.children[0].toString()}[${this.children[1].toString()}]`;
              }
              validate(): void {
                if (!this.isArrayType(this.children[0].type())) {
                  this.addError(`expression is not an array`);
                }
                if (this.children[1].type() != 'num') {
                  this.addError('invalid index. not numeric');
                }
              }
              type(): string {
                return `${this.children[0].type()}`;
              }
            },
          },
        ])
        .flat() as NewRuleType[]),
    ];
  }
}
export class ArrayData extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
        parts: [new Expression()],
        invisibleNode: true,
      },

      {
        parts: [['operator', '...'], new Expression()], //destruct
        treeClass: class extends ParseTree {
          toJs(): string {
            return `...${this.children[0].toJs()}`;
          }
          toString(): string {
            return `destruct ${this.children[0].toString()}`;
          }
          validate(): void {
            if (
              !this.getSuperTypeOfMatching(this.children[0].type(), (type) =>
                this.isArrayType(type)
              )
            ) {
              this.addError(`expression is not an array`);
            }
          }
          type(): string {
            return this.unNestArrayType(
              this.getSuperTypeOfMatching(this.children[0].type(), (type) =>
                this.isArrayType(type)
              )
            );
          }
        },
      },
      {
        parts: [this, ['punct', ','], this],
        treeClass: class extends ParseTree {
          toString(): string {
            return `${this.children
              .map((child) => child.toString())
              .join(',')}`;
          }
          toJs(): string {
            return `${this.children.map((child) => child.toJs()).join(',')}`;
          }
          validate(): void {
            const types = [...new Set(this.children.map((c) => c.type()))];
            if (types.length > 1) {
              this.addError(
                'cannot mix types in array.\nReceived:\n   ' + types.join(', ')
              );
            }
          }
          type(): string {
            return this.children[0].type();
          }
        },
      },
    ];
  }
}
