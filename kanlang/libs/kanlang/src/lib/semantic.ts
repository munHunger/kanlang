import { State } from './earley';
import { Token } from './tokenizer';

type MetaData = {
  type: string;
  primitive: boolean;
  constant: boolean;
};

export type Declaration = {
  name: string;
  variable?: {
    primitive: boolean;
    constant: boolean;
    type: string;
  };
  type?: {
    // empty for now but should hold our typesystem
  };
};

export type SemanticState = Omit<State, 'tree'> & {
  //meta: MetaData;
  scope: Record<string, Declaration>;
  tree: (SemanticState | Token)[];
};

export class SemanticAnalyzer {
  //Should do something here
  analyze(state: State, parent?: SemanticState): SemanticState {
    const semanticState: SemanticState = {
      ...state,
      scope: JSON.parse(JSON.stringify(parent?.scope || {})), //deep clone the state
      tree: [],
    };

    if (state.semantic) {
      const declaraction = state.semantic(semanticState.scope, state);
      if (declaraction) semanticState.scope[declaraction.name] = declaraction;
    }
    semanticState.tree = state.tree.map((child) => {
      if (this.childIsToken(child)) return child;
      const semanticChild = this.analyze(child, semanticState);
      if (state.carryScope)
        Object.assign(semanticState.scope, semanticChild.scope);
      return semanticChild;
    });

    return semanticState;
  }

  private childIsToken(child: Token | State): child is Token {
    return (child as Token).value != undefined;
  }
}
