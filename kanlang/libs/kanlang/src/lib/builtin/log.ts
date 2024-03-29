import { Transformation } from '../parseTree';
import { Declaration } from '../semantic';
import { Builtin } from './builtin';

export class Log extends Builtin {
  getTypes(): Declaration[] {
    return [
      {
        name: 'LogMsg',
        type: {
          alias: 'string',
        },
      },
      {
        name: 'LogResult',
        type: {
          alias: 'num',
        },
      },
    ];
  }

  getTransformation(): Transformation {
    return new Transformation(['LogMsg'], ['LogResult']);
  }

  getImpl(): string {
    return `function ${
      this.getTransformation().functionName
    }(msg) { console.log(msg); }`;
  }
}
