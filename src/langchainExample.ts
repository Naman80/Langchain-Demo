import * as z from "zod";
import { tool } from "langchain";
import { ChatOpenRouter } from "@langchain/openrouter";

export const OPEN_ROUTER_API_KEY = process.env.OPEN_ROUTER_API_KEY ?? "temp";
export const MODEL_NAME = process.env.MODEL_NAME ?? "temp";

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

const modelWithTools = new ChatOpenRouter({
  model: MODEL_NAME!,
  temperature: 0,
  apiKey: OPEN_ROUTER_API_KEY!,
}).bindTools([getWeather]);

const aiMsg = await modelWithTools.invoke("whats the weather in new delhi");
console.log(aiMsg);
