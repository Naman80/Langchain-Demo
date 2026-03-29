import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DirectoryLoader } from "@langchain/classic/document_loaders/fs/directory";

import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

// FOR PARSING SINGLE SINGLE PDF FILE YOU HAVE SPECIFY FILE PATH

// const pdfPath = "./pdf-documents/Lec-2.pdf";

// const loader = new PDFLoader(pdfPath, { splitPages: false });

// // if split pages is true array of documents will be returned each having page number and metadata separately.

// const singleDoc = await loader.load();
// console.log(singleDoc);

// console.log(
//   doc.map((doc) => {
//     return doc.pageContent;
//   }),
// );
// console.log(doc[0]?.metadata);

// ===================================

// FOR PARSING ALL THE PDFS PRESENT IN ONE DIRECTORY

const directoryPath = "./pdf-documents";

const directoryLoader = new DirectoryLoader(directoryPath, {
  ".pdf": (path: string) => new PDFLoader(path),
});

const loadedDocuments = await directoryLoader.load();

// console.log(loadedDocuments);  // all documents

console.log("CHUNKING PROCESS");

// CHUNKING  --> TEXT SPLITTING

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 100,
});

const chunkedDocuments = await textSplitter.splitDocuments(loadedDocuments);

console.log(chunkedDocuments[0]?.metadata);

console.log(chunkedDocuments[chunkedDocuments.length - 1]?.metadata);
