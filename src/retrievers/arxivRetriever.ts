import { ArxivRetriever } from "@langchain/community/retrievers/arxiv";

const arxivRetriever = new ArxivRetriever({ maxSearchResults: 3 });

const docs = await arxivRetriever.invoke("about artificial intelligence");

console.log("docs", docs);
