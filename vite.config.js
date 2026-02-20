import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/MVP/", //тут должно быть название вашего репозитория в гитхабе
});
