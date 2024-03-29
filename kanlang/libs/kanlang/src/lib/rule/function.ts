import { ParseTree, Transformation } from '../parseTree';
import { Body, BodyTree } from './body';
import { ReturnExpressionTree } from './expression';
import { InlineType } from './inlineType';
import { NewRuleType, Rule } from './rule';

export abstract class FunctionParseTree extends ParseTree {
  abstract get returnType(): string[];
}

export class Function extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
        parts: [
          ['punct', '('],
          new ArgumentArray(),
          ['punct', ')'],
          ['punct', ':'],
          new ReturnType(),
          ['punct', '{'],
          new Body(),
          ['punct', '}'],
        ],
        treeClass: class extends FunctionParseTree {
          get returnType(): string[] {
            return this.getChildrenOfType<ReturnTypeParseTree>(
              ReturnTypeParseTree
            )[0].types;
          }
          get argTypes(): string[] {
            const argArray =
              this.getChildrenOfType<ArgumentParseTree>(ArgumentParseTree)[0];
            if (argArray) return argArray.types;
            const arg = this.getChildrenOfRuleType(Argument)[0];
            if (arg) return [arg.type()];
            return [];
          }
          get functionTransform(): Transformation {
            return new Transformation(this.argTypes, this.returnType);
          }
          toJs(): string {
            const argArray =
              this.getChildrenOfType<ArgumentParseTree>(ArgumentParseTree)[0];
            const arg = this.getChildrenOfRuleType(Argument)[0];
            if (
              this.returnType.length == 1 &&
              this.returnType[0] == 'SysCode'
            ) {
              var mainCall = '\n__SysCode();';
            }
            return `function ${this.functionTransform.functionName}(${
              argArray?.toJs() || arg?.toJs() || ''
            }){\n${this.getChildrenOfType<BodyTree>(BodyTree)[0].toJs()}}${
              mainCall || ''
            }`;
          }
          validate(): void {
            this.addTransformation(this.functionTransform);
            const ret =
              this.getChildrenOfType<ReturnExpressionTree>(
                ReturnExpressionTree
              );
            if (ret.length === 0)
              this.addError('missing return statement from function');
            ret.forEach((type) => {
              if (!this.returnType.includes(type.returnType))
                this.addError(
                  `type missmatch. Cannot return ${
                    type.returnType
                  } in function expecting [${this.returnType.join(', ')}]`
                );
            });
            if (
              !this.returnType.every((type) =>
                ret.find((r) => r.returnType === type)
              )
            ) {
              this.addError(
                `Type error. Not all return types are matched.\nExpecting ${
                  this.returnType
                }\nReceived ${ret.map((r) => r.returnType)}`
              );
            }
          }
          toString(): string {
            const argArray =
              this.getChildrenOfType<ArgumentParseTree>(ArgumentParseTree)[0];
            const arg = this.getChildrenOfRuleType(Argument)[0];
            return `fn (${
              argArray?.toString() || arg?.toString() || ''
            }): ${this.returnType.join(
              ' | '
            )} ${this.printScope()}\n${this.getChildrenOfType<BodyTree>(
              BodyTree
            )[0].toString()}`;
          }
        },
      },
    ];
  }
}

export class ReturnTypeParseTree extends ParseTree {
  get types(): string[] {
    return [];
  }
}
export class ReturnType extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
        parts: [this, ['punct', '|'], new InlineType()],
        treeClass: class extends ReturnTypeParseTree {
          get types(): string[] {
            return (this.children[0] as ReturnTypeParseTree).types.concat([
              this.children[1].type(),
            ]);
          }
          toJs(): string {
            return ''; //Types don't really exist in JS
          }
          validate(): void {
            this.mergeParentScope();
            //type validation already taken care of
          }
        },
      },
      {
        parts: [new InlineType()],
        treeClass: class extends ReturnTypeParseTree {
          get types(): string[] {
            return [this.children[0].type()];
          }
          toJs(): string {
            return ''; //Types don't really exist in JS
          }
          validate(): void {
            this.mergeParentScope();
            //Should be taken care of further down
          }
        },
      },
    ];
  }
}

export class ArgumentParseTree extends ParseTree {
  get types(): string[] {
    return [];
  }
}
export class ArgumentArray extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
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
        parts: [new Argument()],
        invisibleNode: true,
      },
      {
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
        parts: ['identifier', ['punct', ':'], new InlineType()],
        treeClass: class extends ParseTree {
          type(): string {
            return this.children[0].type();
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
            this.mergeParentScope();
          }
        },
      },
    ];
  }
}
