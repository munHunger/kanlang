import { Transformation } from '../parseTree';
import { Declaration } from '../semantic';
import { Builtin } from './builtin';

export class FileSystem extends Builtin {
  getTypes(): Declaration[] {
    return [
      {
        name: 'FilePath',
        type: {
          alias: 'string',
        },
      },
      {
        name: 'FileContent',
        type: {
          alias: 'string',
        },
      },
    ];
  }

  getTransformation(): Transformation {
    return new Transformation(['FilePath'], ['FileContent']);
  }

  getImpl(): string {
    return `function ${
      this.getTransformation().functionName
    }(f) { return require('fs').readFileSync(f, 'utf-8'); }`;
  }
}
