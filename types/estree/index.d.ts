declare namespace ESTree {
  interface BaseNode {
    type: string;
    loc?: SourceLocation | null;
    range?: [number, number];
  }

  interface Node extends BaseNode {}

  interface Position {
    line: number;
    column: number;
  }

  interface SourceLocation {
    start: Position;
    end: Position;
    source?: string | null;
  }

  interface Program extends Node {
    type: "Program";
    body: Node[];
    sourceType: "script" | "module";
  }
}

declare module "estree" {
  export = ESTree;
}
