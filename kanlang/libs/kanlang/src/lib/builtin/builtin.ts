import { Transformation } from '../parseTree';
import { Declaration } from '../semantic';

export abstract class Builtin {
  abstract getTypes(): Declaration[];

  abstract getTransformation(): Transformation;

  abstract getImpl(): string;
}
