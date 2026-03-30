import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import {
  LOCAL_LLM_BASE_URL,
  LOCAL_LLM_EMBEDDING_MODEL1,
} from "../config/env.ts";
import { OllamaEmbeddings } from "@langchain/ollama";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { Document } from "langchain";

const sample_text = new Document({
  pageContent:
    "There is a optimisation technique in programming called dynamic programming to calculate complex and recursive problems very efficiently.",
  metadata: {},
});

const embeddings = new OllamaEmbeddings({
  model: LOCAL_LLM_EMBEDDING_MODEL1,
  baseUrl: LOCAL_LLM_BASE_URL,
});

const pdfPath = "./pdf-documents/Lec-1.pdf";

const loader = new PDFLoader(pdfPath);

const docs = await loader.load();

const docsContent = docs.map((doc) => doc.pageContent);

// console.log("pdf context", docsContent);

// text - splitting // CHUNKING

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 50,
});

const chunks = await textSplitter.splitDocuments(docs);

// console.log("chunks", chunks);

// const pdfContentInChunks = chunks.map((chunk) => chunk.pageContent);

// const embeddedPdfContent = await embeddings.embedDocuments(pdfContentInChunks);

// console.log("Embedded content", embeddedPdfContent);

// LEARNING ABOUT VECTOR STORE
const memoryVectorStore = new MemoryVectorStore(embeddings);

await memoryVectorStore.addDocuments([...chunks]); // not return anything

// console.log(memoryVectorStore.memoryVectors);// TO SEE EMBEDDINGS

// RATHER THAN PERFORMING SIMILARITY SEARCH DIRECTLY USE VECTOR STORE AS RETRIEVER

// const result = await memoryVectorStore.similaritySearchWithScore(
//   "functions of operating system",
//   3,
// );

const retriever = memoryVectorStore.asRetriever({
  verbose: true,
});

const result = await retriever.invoke("functions of operating system");

console.log("QUERY RESULT", result[0]);
