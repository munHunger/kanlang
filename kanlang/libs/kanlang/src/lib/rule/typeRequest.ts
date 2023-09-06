import { ParseTree } from '../parseTree';
import { Body } from './body';
import { Expression, ExpressionPart } from './expression';
import { NewRuleType, Rule } from './rule';
import { VariableAssignment, VariableTree } from './variable';

export class TypeRequestTree extends ParseTree {
  getCatch(): TypeRequestCatchTree {
    throw new Error('Not implemented');
  }
  getExpression(): ParseTree {
    return undefined;
  }
  get tempVarName(): string {
    return `_${this.getExpression().type()}_${this.type()}`;
  }
  getHoistJs(): string {
    const variable = this.getParentOfType(VariableAssignment) as VariableTree;

    let hoist = [];
    const p = this.getChildrenOfType<VariableTree>(VariableTree);
    if (p.length == 0) {
      const exp = this.getExpression();
      if (exp) {
        hoist.push(`let ${this.tempVarName} = ${exp.toJs()};`);
      }
    }
    const catchTree = this.getCatch();
    if (catchTree) {
      hoist.push(`\nlet ___${this.type()} = ${
        this.getTransformationPath(this.type(), variable?.getName()).toJs()[0]
      };
      if(!___${this.type()}.${this.type()}) {
        ${catchTree
          .getCatchVars()
          .map(
            (type) =>
              `if(___${this.type()}.${type.type}) {
                let ${type.name} = ___${this.type()}.${type.type};
                ${catchTree.toJs()}
              }`
          )
          .join('\n')}
      }`);
    }
    return hoist.join('\n');
  }
  validate(): void {
    const variable = this.getParentOfType(VariableAssignment) as VariableTree;
    this.validateIfTypeIsDefined(this.type());
    if (
      this.getTransformationPaths(this.type(), variable?.getName()).children
        .length == 0
    ) {
      this.addError(`no possible path to transform to ${this.type()}`);
    }
  }
}

export class TypeRequest extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
        parts: [
          new ExpressionPart(),
          ['keyword', 'to'],
          'identifier',
          new TypeRequestCatch(),
        ],
        treeClass: class extends TypeRequestTree {
          getCatch(): TypeRequestCatchTree {
            return this.children[1] as TypeRequestCatchTree;
          }
          getExpression(): ParseTree {
            return this.children[0];
          }
          type(): string {
            return this.tokenValue(2);
          }
          toString(): string {
            return `${this.children[0].toString()} transformed to ${this.type()} ${
              this.children[1]?.toString() || ''
            }`;
          }
          toJs(): string {
            const variable = this.getParentOfType(
              VariableAssignment
            ) as VariableTree;

            const p = this.getChildrenOfType<VariableTree>(VariableTree);
            if (this.getCatch()) return `___${this.type()}.${this.type()}`;
            else if (p.length > 0)
              //TODO: handle when there are multiple, ex: a + b
              return this.getTransformationPaths(
                this.type(),
                variable?.getName()
              )
                .filterIncludeVariable({ name: p[0].getName() })
                .toJs2()
                .join(' || ');
            else {
              this.addToScope({
                name: this.tempVarName,
                variable: {
                  type: this.getExpression().type(),
                  constant: true,
                },
              });
              return this.getTransformationPaths(
                this.type(),
                variable?.getName()
              )
                .filterIncludeVariable({ name: this.tempVarName })
                .toJs2()
                .join(' || ');
            }
          }
          validate(): void {
            super.validate();
            this.mergeParentScope(); //not sure about this one, but seems to be working
          }
        },
      },
      {
        parts: [['operator', '*'], 'identifier', new TypeRequestCatch()],
        treeClass: class extends TypeRequestTree {
          getCatch(): TypeRequestCatchTree {
            return this.children[0] as TypeRequestCatchTree;
          }
          toJs(): string {
            if (this.getCatch()) return `___${this.type()}.${this.type()}`;
            else return this.getTransformationPath(this.type()).toJs()[0];
          }
          type(): string {
            return this.tokenValue(1);
          }
          toString(): string {
            return `${this.tokenValue(1)} fetched from scope ${
              this.children[0]?.toString() || ''
            }`;
          }
          validate(): void {
            super.validate();
            const path = this.getTransformationPath(this.type());
            if (path.toJs().length == 0) {
              this.addError(
                'Cannot find a transformation path to ' + this.type()
              );
            } else {
              const possibleOutputs = path.children
                .filter((child) => child.transformation)
                .map((child) => child.transformation.to);
              const catchTree = this.children[0] as TypeRequestCatchTree;
              if (catchTree) {
                //TODO: check if the correct cases are covered
              } else if (possibleOutputs.every((output) => output.length > 1))
                this.addError(
                  `You haven't covered all cases: ${[
                    ...new Set(possibleOutputs.flat()),
                  ]}`
                );
            }
          }
        },
      },
    ];
  }
}

abstract class TypeRequestCatchTree extends ParseTree {
  abstract getCatchTypes(): string[];
  abstract getCatchVars(): { name: string; type: string }[];
}

export class TypeRequestCatch extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
        parts: [], //epsilon
        invisibleNode: true,
      },
      {
        parts: [
          ['punct', '{'],
          'identifier',
          ['punct', ':'],
          'identifier',
          ['punct', '{'],
          new Body(),
          ['punct', '}'],
          ['punct', '}'],
        ],
        treeClass: class extends TypeRequestCatchTree {
          validate(): void {
            this.validateIfTypeIsDefined(this.type());
          }
          getCatchVars(): { name: string; type: string }[] {
            return [
              {
                name: this.tokenValue(1),
                type: this.type(),
              },
            ];
          }
          getCatchTypes(): string[] {
            return [this.type()];
          }
          toString(): string {
            return `catch {${this.children[0].toString()}}`;
          }
          toJs(): string {
            return this.children[0].toJs();
          }
          type(): string {
            return this.tokenValue(3);
          }
          preValidate(): void {
            this.addToScope({
              name: this.tokenValue(1),
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
