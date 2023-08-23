import { ParseTree } from './parseTree';

export class CodeGenerator {
  generate(tree: ParseTree): string {
    let code = '';
    const node = tree.toJs();
    code += node;
    return code;
  }
}
