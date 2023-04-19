export type AstNode =
  | Fn
  | Statement
  | Assignment
  | TypeDef
  | DependencyInjection
  | Root;

export type AnnotatedNode = AstNode & Metadata & { parent?: AnnotatedNode };

export interface Metadata {
  variableMap: Record<string, Type>;
  functionMap: Record<string, Fn>;
}

//Not really a stack frame, but a scope change
export interface StackFrame {
  prev?: StackFrame;
  variableMap: Record<string, Type>;
  functionMap: Record<string, Fn>;
  types: Set<Type>;
}

export interface TypeDef {
  typeDef: Type;
}

export function isTypeDef(node: AstNode): node is TypeDef {
  return (node as TypeDef).typeDef !== undefined;
}

export interface DependencyInjection {
  dependency: {
    name: string;
    type: Type;
  };
}

export function isDependencyInjection(
  node: AstNode
): node is DependencyInjection {
  return (node as DependencyInjection).dependency !== undefined;
}

export interface Root {
  root: Array<AstNode>;
}

export function isRoot(node: AstNode): node is Root {
  return (node as Root).root !== undefined;
}

export interface Type {
  type: string;
  alias?: string;
}

export interface Expression {
  op: string | {fn: string};
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

export type Assignment = {
  assignment: {
    type: Type;
    name: string;
    value: Expression;
  };
};
export function isAssignment(node: AstNode): node is Assignment {
  return (node as Assignment).assignment !== undefined;
}
