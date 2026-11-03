import { defineConfig } from "drizzle-kit"
import { env } from "./shared/env"

export default defineConfig({
  out: "./drizzle",
  schema: ["./db/schemas/**/*.ts"],
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
})
