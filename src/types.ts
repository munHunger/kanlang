export type AstNode = Fn | Statement;

export type AnnotatedNode = AstNode & Metadata & { parent?: AnnotatedNode };

export interface Metadata {
  variableMap: Record<string, Type>;
  functionMap: Record<string, Fn>;
}

export interface Type {
  type: string;
  alias?: string;
}

export interface Expression {
  op: string;
  args: Array<Expression>;
  var: string;
  const: number | string;
}

export interface Statement {
  return?: Expression;
}
export function isStatement(node: AstNode): node is Statement {
  return (node as Statement) !== undefined;
}

export type Fn = {
  function: {
    signature: {
      name: string;
      args: Array<{
        name: string;
        type: Type;
      }>;
      returnType: Type;
    };
    body: Array<Statement>;
  };
};
export function isFunction(node: AstNode): node is Fn {
  return (node as Fn).function !== undefined;
}
