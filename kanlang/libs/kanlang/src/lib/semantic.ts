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

type SemanticState = Omit<State, 'tree'> & {
  meta: MetaData;
  scope: Record<string, Declaration>;
  tree: (SemanticState | Token)[];
};

export class SemanticAnalyzer {
  //Should do something here
  analyze(state: State) {
    //
  }
}
