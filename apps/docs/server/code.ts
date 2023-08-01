export interface CodeGenerator {
  generateCode(schema: any): string;
}

export class CssCodeGenerator implements CodeGenerator {
  generateCode(schema: any): string {
    return "";
  }
}
