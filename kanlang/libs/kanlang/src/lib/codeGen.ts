import { Log } from './builtin/log';
import { ParseTree } from './parseTree';

export class CodeGenerator {
  generate(tree: ParseTree, addBuiltin?: boolean): string {
    let code = '';
    if (!tree.parent && addBuiltin) {
      code += new Log().getImpl() + '\n';
    }
    const node = tree.toJs();
    code += node;
    return code;
  }
}
