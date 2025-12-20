import type { Plugin } from "rolldown";

export default function hmr(file: string): Plugin {
  return {
    name: "hmr-plugin",
    generateBundle(_, bundle) {
      const output = bundle[file];

      if (output.type === "chunk") {
        const endSequence = "//#endregion";
        const code = output.code;
        const start = code.indexOf("//#region rolldown:hmr");
        const end = code.indexOf(endSequence, start);

        const newCode =
          code.substring(0, start) + code.substring(end + endSequence.length);
        output.code = newCode;
      }
    },
  };
}
