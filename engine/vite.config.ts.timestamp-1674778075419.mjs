// package.json
var name = "@grove/engine";

// vite.config.ts
import { defineConfig } from "file:///home/frog/grove/engine/node_modules/vite/dist/node/index.js";
import dts from "file:///home/frog/grove/engine/node_modules/vite-plugin-dts/dist/index.mjs";
import path from "path";
var __vite_injected_original_dirname = "/home/frog/grove/engine";
var vite_config_default = defineConfig({
  build: {
    target: "esnext",
    lib: {
      entry: path.resolve(__vite_injected_original_dirname, "src/index.ts"),
      formats: ["es"],
      fileName: (format) => `index.${format}.js`,
      name
    },
    rollupOptions: {
      external: ["three", "@grove/physics", "@grove/graphics"]
    },
    outDir: "./lib"
  },
  plugins: [dts()]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9mcm9nL2dyb3ZlL2VuZ2luZVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvZnJvZy9ncm92ZS9lbmdpbmUvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvZnJvZy9ncm92ZS9lbmdpbmUvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBuYW1lIH0gZnJvbSBcIi4vcGFja2FnZS5qc29uXCI7XG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IGR0cyBmcm9tICd2aXRlLXBsdWdpbi1kdHMnO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgYnVpbGQ6IHtcbiAgICB0YXJnZXQ6ICdlc25leHQnLFxuICAgIGxpYjoge1xuICAgICAgZW50cnk6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwic3JjL2luZGV4LnRzXCIpLFxuICAgICAgZm9ybWF0czogW1wiZXNcIl0sXG4gICAgICBmaWxlTmFtZTogZm9ybWF0ID0+IGBpbmRleC4ke2Zvcm1hdH0uanNgLFxuICAgICAgbmFtZVxuICAgIH0sXG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgZXh0ZXJuYWw6IFsndGhyZWUnLCAnQGdyb3ZlL3BoeXNpY3MnLCAnQGdyb3ZlL2dyYXBoaWNzJ10sXG4gICAgfSxcbiAgICBvdXREaXI6IFwiLi9saWJcIixcbiAgfSxcbiAgcGx1Z2luczogW2R0cygpXVxufSk7Il0sCiAgIm1hcHBpbmdzIjogIjs7OztBQUNBLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sU0FBUztBQUNoQixPQUFPLFVBQVU7QUFIakIsSUFBTSxtQ0FBbUM7QUFLekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsT0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLElBQ1IsS0FBSztBQUFBLE1BQ0gsT0FBTyxLQUFLLFFBQVEsa0NBQVcsY0FBYztBQUFBLE1BQzdDLFNBQVMsQ0FBQyxJQUFJO0FBQUEsTUFDZCxVQUFVLFlBQVUsU0FBUztBQUFBLE1BQzdCO0FBQUEsSUFDRjtBQUFBLElBQ0EsZUFBZTtBQUFBLE1BQ2IsVUFBVSxDQUFDLFNBQVMsa0JBQWtCLGlCQUFpQjtBQUFBLElBQ3pEO0FBQUEsSUFDQSxRQUFRO0FBQUEsRUFDVjtBQUFBLEVBQ0EsU0FBUyxDQUFDLElBQUksQ0FBQztBQUNqQixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
