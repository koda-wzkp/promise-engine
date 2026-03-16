import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./schemas";

export default defineConfig({
  name: "promise-pipeline",
  title: "Promise Pipeline",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "cwvex1ty",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  plugins: [structureTool()],
  schema: {
    types: schemaTypes,
  },
});
