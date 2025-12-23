import type { Plugin } from "rolldown";

export default function hmr(name: string): Plugin {
  return {
    name: "hmr-plugin",
    generateBundle(_, bundle) {
      const file = bundle[name];

      if (file.type === "chunk") {
        const start = file.code.indexOf("//#region rolldown:hmr");
        const endSequence = "//#endregion";
        const end = file.code.indexOf(endSequence, start);

        file.code =
          file.code.substring(0, start) +
          file.code.substring(end + endSequence.length);
      }
    },
  };
}
