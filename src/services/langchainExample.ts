import * as z from "zod";
import { tool } from "langchain";
import {
  LOCAL_LLM_BASE_URL,
  LOCAL_LLM_MODEL1,
  LOCAL_LLM_MODEL2,
} from "../config/env.ts";
import { ChatOllama } from "@langchain/ollama";

const getWeather = tool(
  (city) => {
    return "Its sunny in" + city;
  },
  {
    name: "Get weather",
    description: "This tools helps to get weather for a particular city",
    schema: z.object({
      city: z.string(),
    }),
  },
);

// ONLY CHAT MODEL
// const modelWithTools = new ChatOpenRouter({
//   model: MODEL_NAME,
//   temperature: 0,
//   apiKey: OPEN_ROUTER_API_KEY,
// }).bindTools([getWeather]);

const chatModel = new ChatOllama({
  model: LOCAL_LLM_MODEL2,
  baseUrl: LOCAL_LLM_BASE_URL,
});
const aiMsg = await chatModel.invoke("do you have capability of tool calling");
console.log(aiMsg);

// FOR EMBEDDING OPEN-ROUTER
