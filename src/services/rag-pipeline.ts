// LOAD PDF DATA

import { DirectoryLoader } from "@langchain/classic/document_loaders/fs/directory";
import { RecursiveCharacterTextSplitter } from "@langchain/classic/text_splitter";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { ChatOllama, OllamaEmbeddings } from "@langchain/ollama";
import {
  LOCAL_LLM_BASE_URL,
  LOCAL_LLM_EMBEDDING_MODEL1,
  LOCAL_LLM_EMBEDDING_MODEL2,
  LOCAL_LLM_MODEL1,
  LOCAL_LLM_MODEL3,
} from "../config/env.ts";
import { Document } from "langchain";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { existsSync } from "fs";
import path from "path";
import { MultiQueryRetriever } from "@langchain/classic/retrievers/multi_query";
import { ContextualCompressionRetriever } from "@langchain/classic/retrievers/contextual_compression";
import { LLMChainExtractor } from "@langchain/classic/retrievers/document_compressors/chain_extract";
import { type } from "os";
import { z } from "zod";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";

const llm = new ChatOllama({
  baseUrl: LOCAL_LLM_BASE_URL,
  model: LOCAL_LLM_MODEL3,
  // verbose: true,
  temperature: 0.2,
});

const singlePdfPath = "./largePdfs/who_health_document.pdf";

const pdfLoader = new PDFLoader(singlePdfPath, { splitPages: false });

let healthPdfContent = await pdfLoader.load();

// healthPdfContent = healthPdfContent.map((page) => {
//   const shortContent = page.pageContent.slice(0, 6000);
//   return new Document({ ...page, pageContent: shortContent });
// });

const pdfPath = "./pdfs";

const directoryLoader = new DirectoryLoader(pdfPath, {
  ".pdf": (path: string) => new PDFLoader(path),
});

const pdfContentDocuments = await directoryLoader.load();

// console.log("LOADED PDF CONTENT", pdfContentDocuments);
// console.log("TOTAL PDF DOCUMENTS", pdfContentDocuments.length);
// console.log("===========================================");

// TEXT SPLIT DATA - CHUNKING

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 700,
  chunkOverlap: 200,
});

const chunkedPdfDocuments = await textSplitter.splitDocuments(healthPdfContent);

// console.log("CHUNKED PDF CONTENT", chunkedPdfDocuments);
console.log("TOTAL CHUNKED PDF DOCUMENTS", chunkedPdfDocuments.length);
console.log("===========================================");

// CREATE EMBEDDINGS

const embedder = new OllamaEmbeddings({
  baseUrl: LOCAL_LLM_BASE_URL,
  model: LOCAL_LLM_EMBEDDING_MODEL2,
});

// const documentEmbeddings = await embedder.embedDocuments(
//   chunkedPdfDocuments.map((chunk) => chunk.pageContent),
// );

// console.log("DOCUMENT EMBEDDINGS", documentEmbeddings);
// console.log("TOTAL DOCUMENT EMBEDDINGS", documentEmbeddings.length);
console.log("===========================================");

// VECTOR STORE AND ADD DOCUMENTS

const vectorStorePath = "./src/vectorstore";

function isVectorStoreReady(dir: string) {
  const indexFile = path.join(dir, "faiss.index");
  const docstoreFile = path.join(dir, "docstore.json");

  return existsSync(indexFile) && existsSync(docstoreFile);
}

async function getVectorStore() {
  try {
    if (isVectorStoreReady(vectorStorePath)) {
      console.log("♻️ loading vector store...");

      return await FaissStore.load(vectorStorePath, embedder);
    }
    throw new Error("Index not ready");
  } catch (err) {
    console.log("♻️ Rebuilding vector store...");

    const store = await FaissStore.fromDocuments(chunkedPdfDocuments, embedder);

    await store.save(vectorStorePath);
    return store;
  }
}

const vectorStore = await getVectorStore();

// console.log("vector store document ids", loadedVectorStore);
// console.log("TOTAL DOCUMENT EMBEDDINGS", ids.length);
console.log("===========================================");

const searchQuery = "How we can build sustainable health systems?";

const searchResult = await vectorStore.similaritySearchWithScore(
  "How we can build sustainable health systems",
);

console.log("vector search result", searchResult);
console.log("===========================================");

// const multiQueryRetriever = MultiQueryRetriever.fromLLM({
//   llm,
//   retriever: vectorStore.asRetriever({
//     searchType: "similarity",
//     k: 3,
//   }),
// });

// const multiQuerySearchResult = await multiQueryRetriever.invoke(
//   "How we can build sustainable health systems",
// );

// console.log("multi query vector search result", multiQuerySearchResult);
// console.log("===========================================");

// create compressor

// const compressor = LLMChainExtractor.fromLLM(llm);

// const contextualCompressionRetriever = new ContextualCompressionRetriever({
//   baseRetriever: vectorStore.asRetriever(),
//   baseCompressor: compressor,
//   // verbose: true
// });

// const contextualCompressionSearchResult =
//   await contextualCompressionRetriever.invoke(searchQuery);

// console.log(
//   "contextual Compression Search Result",
//   contextualCompressionSearchResult,
// );
// console.log("===========================================");

const searchResultContentArray = searchResult.map((doc) => doc[0].pageContent);

const contextText = searchResultContentArray.join("\n\n");

console.log("all context text", contextText);
console.log("===========================================");

// const schema = z.object({
//   query: z.string(),
//   response: z.object({
//     overall_summary: z.string(),
//     key_elements: z.array(
//       z.object({
//         element: z.string(),
//         details: z.string(),
//       }),
//     ),
//     supporting_documents: z.array(z.string()),
//   }),
// });

// const parser = StructuredOutputParser.fromZodSchema(schema);

// const formatInstructions = parser.getFormatInstructions();

const prompt = `
You are a precise helpfull AI assistant.

Rules:
- Use ONLY the provided document context
- Do NOT hallucinate
- Do NOT add markdown or code fences
- If context is insufficient, just say I don't know.

Document Context: {Context}

Question : {Question}
`;

const promptTemplate = new PromptTemplate({
  inputVariables: ["Context", "Question"],
  template: prompt,
});

const finalPrompt = await promptTemplate.invoke({
  Context: contextText,
  Question: searchQuery,
});

const response = await llm.invoke(finalPrompt);

console.log(response.content);

// const properResult = await llm.generate([
//   [
//     {
//       role: "system",
//       content: `You are a AI assitant who will two input 1. user query 2. documents fetched from db according to user query in multiple parts. You have to make a good overall content using only those documents and return in JSON format.
//         "QUERY" : ${searchQuery},
//         "DOCUMENTS" : ${JSON.stringify(searchResultContentArray)}
//         `,
//     },
//   ],
// ]);

// console.log(
//   "Proper Result after LLM",
//   properResult.generations,
//   "|||||",
//   properResult.generations[0],
// );

// const parsed = await parser.parse(response.content as string);

// console.log("Final Parsed Output:", parsed.response);
// console.log("===========================================");

// RETRIEVE DATA FROM THEM
