import { ParseTree } from '../parseTree';
import { NewRuleType, Rule } from './rule';

export class TypeRequest extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
        root: 0,
        parts: [['operator', '*'], 'identifier'],
        treeClass: class extends ParseTree {
          toJs(): string {
            //TODO: how to handle recursion?
            return this.getTransformationPath(this.type()).toJs()[0]; //TODO: should add metadata and do a smart select, not just the first option
          }
          type(): string {
            return this.tokenValue(1);
          }
          toString(): string {
            return `${this.tokenValue(1)} fetched from scope`;
          }
          validate(): void {
            const path = this.getTransformationPath(this.type());
            if (path.toJs().length == 0) {
              this.addError(
                'Cannot find a transformation path to ' + this.type()
              );
            } else {
              const possibleOutputs = path.children
                .filter((child) => child.transformation)
                .map((child) => child.transformation.to);
              if (possibleOutputs.every((output) => output.length > 1))
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
