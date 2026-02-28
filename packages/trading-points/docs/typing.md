# typing.d.ts

## Overview

Ambient module declaration for PNG imports so TypeScript treats `*.png` as modules with a string default export.

## Declaration

```ts
declare module "*.png" {
  const value: string;
  export default value;
}
```

Allows `import img from "./file.png"` to type `img` as `string`.
