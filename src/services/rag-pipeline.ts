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

// const searchResult = await vectorStore.similaritySearchWithScore(
//   "How we can build sustainable health systems",
// );

// console.log("vector search result", searchResult);
// console.log("===========================================");

const multiQueryRetriever = MultiQueryRetriever.fromLLM({
  llm: new ChatOllama({ baseUrl: LOCAL_LLM_BASE_URL, model: LOCAL_LLM_MODEL3 }),
  retriever: vectorStore.asRetriever({
    searchType: "similarity",
    k: 3,
  }),
  verbose: true,
});

const multiQuerySearchResult = await multiQueryRetriever.invoke(
  "How we can build sustainable health systems",
);

console.log("multi query vector search result", multiQuerySearchResult);
console.log("===========================================");
// RETRIEVE DATA FROM THEM
