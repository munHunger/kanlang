import { Transformation } from '../parseTree';
import { Declaration } from '../semantic';
import { Builtin } from './builtin';

export class StringConcat extends Builtin {
  getTypes(): Declaration[] {
    return [
      {
        name: 'PrefixString',
        type: {
          alias: 'string',
        },
      },
      {
        name: 'SuffixString',
        type: {
          alias: 'string',
        },
      },
      {
        name: 'StringConcat',
        type: {
          alias: 'string',
        },
      },
    ];
  }

  getTransformation(): Transformation {
    return new Transformation(
      ['PrefixString', 'SuffixString'],
      ['StringConcat']
    );
  }

  getImpl(): string {
    return `function ${
      this.getTransformation().functionName
    }(a, b) { return a + b }`;
  }
}
