import { WikipediaQueryRun } from "@langchain/community/tools/wikipedia_query_run";

const wikipediaRetriever = new WikipediaQueryRun({});

const wikiData = await wikipediaRetriever.invoke(
  "when did isaac newton was born",
);

console.log("data from wikipedia", wikiData);
