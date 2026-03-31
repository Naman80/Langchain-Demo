import * as z from "zod";
import { createAgent, SystemMessage, tool } from "langchain";
import {
  LOCAL_LLM_BASE_URL,
  LOCAL_LLM_MODEL1,
  LOCAL_LLM_MODEL2,
  LOCAL_LLM_MODEL3,
} from "../config/env.ts";
import { ChatOllama } from "@langchain/ollama";

const getWeather = tool(
  ({ city }) => {
    return JSON.stringify({
      city,
      weather: "sunny",
      temperature: 25,
    });
  },
  {
    name: "get_weather",
    description: `
Get weather for a city.

IMPORTANT:
- Always call this tool when user asks about weather
- Extract "city" as a STRING
- Example:
  Input: "weather in delhi"
  Output args: { "city": "Delhi" }
`,
    schema: z.object({
      city: z.string().describe("City name"),
    }),
  },
);

const chatModel = new ChatOllama({
  model: LOCAL_LLM_MODEL1,
  baseUrl: LOCAL_LLM_BASE_URL,
});

const SYSTEM_PROMPT = `
You are a helpful assistant.

When you receive a tool result:
- DO NOT return JSON
- DO NOT wrap output
- ALWAYS respond in natural language
- Use the tool result to answer the user clearly

Example:
Tool result: "It's sunny in New Delhi"
Response: "The weather in New Delhi is sunny."
`;

const agent = createAgent({
  model: chatModel,
  tools: [getWeather],
  systemPrompt: SYSTEM_PROMPT,
});

const aiMsg = await agent.invoke({
  messages: [{ role: "user", content: "What the weather in new delhi" }],
});

console.log(aiMsg);
