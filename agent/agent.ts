import { defineAgent } from "eve";
import { groq } from "@ai-sdk/groq";

export default defineAgent({
  model: groq("openai/gpt-oss-20b"),
});
