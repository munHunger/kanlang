import { State } from './earley';
import { Token } from './tokenizer';

type MetaData = {
  type: string;
  primitive: boolean;
  constant: boolean;
};

type SemanticState = Omit<State, 'tree'> & {
  meta: MetaData;
  tree: (SemanticState | Token)[];
};

export class SemanticAnalyzer {
  //Should do something here
  analyze(state: State) {
    //
  }
}
