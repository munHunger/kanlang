import { Log } from './builtin/log';
import { ParseTree } from './parseTree';
import * as builtins from './builtin';

export class CodeGenerator {
  generate(tree: ParseTree, addBuiltin?: boolean): string {
    const builtinJs =
      Object.values(builtins)
        .filter((v) => v.prototype instanceof builtins.Builtin)
        .map((c: any) => new c() as builtins.Builtin)
        .map((b) => b.getImpl())
        .join('\n') + '\n';
    let code = '';
    if (!tree.parent && addBuiltin) {
      code += builtinJs;
    }
    const node = tree.toJs();
    code += node;
    return code;
  }
}
