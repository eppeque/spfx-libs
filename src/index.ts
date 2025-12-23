import { type BuildOptions, type Plugin } from "rolldown";
import { dev } from "rolldown/experimental";
import hmr from "./hmr";

const experimental = {
  devMode: true,
};

const configs: BuildOptions[] = [
  {
    input: "esm/react.js",
    output: {
      file: "dist/react.js",
      format: "umd",
      name: "React",
    },
    plugins: [hmr("react.js")],
    experimental,
  },
  {
    input: "esm/react-dom.js",
    output: {
      file: "dist/react-dom.js",
      format: "umd",
      name: "ReactDOM",
      globals: {
        react: "React",
      },
    },
    external: ["react"],
    plugins: [hmr("react-dom.js")],
    experimental,
  },
  {
    input: "esm/jsx-dev-runtime.js",
    output: {
      file: "dist/jsx-dev-runtime.js",
      format: "umd",
      name: "JsxDevRuntime",
      globals: {
        react: "React",
      },
    },
    external: ["react"],
    plugins: [hmr("jsx-dev-runtime.js")],
    experimental,
  },
  {
    input: "esm/jsx-runtime.js",
    output: {
      file: "dist/jsx-runtime.js",
      format: "umd",
      name: "JsxRuntime",
      globals: {
        react: "React",
      },
    },
    external: ["react"],
    plugins: [hmr("jsx-runtime.js")],
    experimental,
  },
  {
    input: "node_modules/@fluentui/react-components/lib/index.js",
    output: {
      file: "dist/fluentui.js",
      format: "umd",
      name: "FluentUI",
      globals: {
        react: "React",
        "react-dom": "ReactDOM",
        "react/jsx-runtime": "JsxRuntime",
      },
    },
    external: ["react", "react-dom", "react/jsx-runtime"],
    plugins: [hmr("fluentui.js")],
    experimental,
  },
];

for (const config of configs) {
  console.log(`Bundling ${config.input}...`);

  const { output: outputOptions, ...inputOptions } = config;
  const devEngine = await dev(inputOptions, outputOptions, {
    onHmrUpdates(errOrUpdates) {
      if (errOrUpdates instanceof Error) {
        console.error("HMR patch error:", errOrUpdates);
      }
    },
    onOutput(errOrUpdates) {
      if (errOrUpdates instanceof Error) {
        console.error("Build error:", errOrUpdates);
      }
    },
  });

  await devEngine.run();
  await devEngine.ensureLatestBuildOutput();
  await devEngine.close();
}
