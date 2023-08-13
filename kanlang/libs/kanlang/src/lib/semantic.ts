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
      semanticState.scope[declaraction.name] = declaraction;
    }
    semanticState.tree = state.tree.map((child) =>
      (child as any).value ? (child as Token) : this.analyze(child as State)
    );

    return semanticState;
  }
}
