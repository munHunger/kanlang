import { CompileErrors } from './compileError';
import { State } from './earley';
import { ParseTree } from './parseTree';
import { Token } from './tokenizer';

export type Declaration = {
  name: string;
  variable?: {
    constant: boolean;
    type: string;
  };
  type?: {
    // empty for now but should hold our typesystem
    alias?: string;
    properties?: Declaration[];
  };
};

export type SemanticState = Omit<State, 'tree'> & {
  //meta: MetaData;
  scope: Record<string, Declaration>;
  tree: (SemanticState | Token)[];
};

export class SemanticAnalyzer {
  analyze(state: State, parent?: ParseTree): ParseTree {
    if (parent == null) {
      ParseTree.errors = []; //reset errors when running from root
    }
    if (state.tree.length == 0) {
      //this is the epsilon case
      return;
    }
    if (state.invisibleNode) {
      if (state.parts.length > 1)
        throw new Error('cannot have invisible nodes with more than one child');
      if (this.childIsToken(state.tree[0]))
        throw new Error('cannot be invisible to a token');
      return this.analyze(state.tree[0], parent);
    }
    if (!state.invisibleNode && !state.treeClass) {
      throw new Error(
        `rule ${state.ruleRef.ruleName} is incorrectly setup. It is not invisible, but missing a tree class`
      );
    }
    const tree = new state.treeClass(state.ruleRef, state, parent);

    tree.preValidate();

    state.tree
      .filter((child) => !this.childIsToken(child))
      .forEach((child) => {
        const c = this.analyze(child as State, tree);
        if (c) {
          //removes epsilon
          tree.addChild(c);
          tree.postChildAdded();
        }
      });

    tree.validate();
    if (ParseTree.errors.length > 0) {
      if (!parent) {
        //analysis is done
        throw new CompileErrors(ParseTree.errors, tree.allTokens);
      }
    }
    return tree;
  }

  private childIsToken(child: Token | State): child is Token {
    return (child as Token).value != undefined;
  }
}
