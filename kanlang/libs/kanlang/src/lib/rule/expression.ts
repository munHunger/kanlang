import { ParseTree } from '../parseTree';
import { Arithmetic } from './arithmetic';
import { BooleanRule } from './boolean';
import { StringRule } from './string';
import { Function, FunctionParseTree } from './function';
import { NewRuleType, Rule } from './rule';
import { TypeRequest } from './typeRequest';
import { VariableAssignment } from './variable';
import { ArrayRule } from './array';

export class ReturnExpressionTree extends ParseTree {
  get returnType(): string {
    return '';
  }
}

export class Return extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
        root: 0,
        parts: [['keyword', 'return'], new Expression()],
        treeClass: class extends ReturnExpressionTree {
          get returnType(): string {
            return this.children[0].type();
          }
          toJs(): string {
            const isMultipleReturn =
              (this.getParentOfType(Function) as FunctionParseTree).returnType
                .length > 1;
            if (isMultipleReturn)
              return `return {${this.returnType}: ${this.children[0].toJs()}}`;
            else return `return ${this.children[0].toJs()}`;
          }
          toString(): string {
            return `return ${this.children[0].toString()}`;
          }
          validate(): void {
            const fn = this.getParentOfType(Function) as FunctionParseTree;
            if (!fn) this.addError('cannot return outside of a function');
          }
        },
      },
    ];
  }
}

export class Expression extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
        root: 0,
        parts: [new VariableAssignment()],
        invisibleNode: true,
      },
      {
        root: 0,
        parts: [new ExpressionPart()],
        invisibleNode: true,
      },
    ];
  }
}

export class ExpressionPart extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
        root: 0,
        parts: [this, ['keyword', 'as'], 'identifier'],
        treeClass: class extends ParseTree {
          toJs(): string {
            return this.children[0].toJs(); //no types in js so no need to convert
          }
          type(): string {
            return this.tokenValue(2);
          }
          toString(): string {
            return `(${this.children[0].toString()} as ${this.type()})`;
          }
          validate(): void {
            this.validateIfTypeIsDefined(this.type());
          }
        },
      },
      {
        root: 0,
        parts: [new Arithmetic()],
        invisibleNode: true,
      },
      {
        root: 0,
        parts: [new BooleanRule()],
        invisibleNode: true,
      },
      {
        root: 0,
        parts: [new StringRule()],
        invisibleNode: true,
      },
      {
        root: 0,
        parts: [new ArrayRule()],
        invisibleNode: true,
      },
      {
        root: 0,
        parts: [new TypeRequest()],
        invisibleNode: true,
      },
    ];
  }
}
