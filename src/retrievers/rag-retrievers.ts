/* THERE ARE MULTIPLE TYPES OF RETRIEVER USED TO BUILD RAG APPLICATIONS

- EVERY RETRIEVER HAVE DIFFERENT FUNCTION ACCORDING TO THE WHAT TYPE OF DATA WE WANT TO FETCH

# RETRIEVERS = THEY FETCH DATA FROM DIFFERENT SOURCES (VECTOR STORE | WEBSITES | API)
AND SEARCH THROUGH THAT DATA WITH DIFFERENT TYPES OF STRATEGIES.

================================================================================

# MMR - MAXIMAL MARGINAL RELEVANCY
- To reduce redundancy in search results like sometimes search results contain data which are very similiar to each other but wordings are different in those cases we end up showing similiar results. To get different results we use mmr.
const embeddings = new OllamaEmbeddings();
const vectorStore = new MemoryVectorStore(embeddings);

const mmrRetriever = vectorStore.asRetriever({
  searchType: "mmr",
  searchKwargs: { lambda: 0.5 },
  // lambda is 0 to 1 // 0 means more diverse 1 means more similar results
});

================================================================================

// MULTI-QUERY RETRIEVER
// - Sometimes the intent of query is different but search will happen on query wordings only and we end up getting incomplete results.
- Eg: query - "how can I stay healthy?"
this could mean: "What should I eat?" | "How often should I exercise?" | 
- For original query data will be fetched around "healthy" keyword.

To resolve this kind of conditions we use multi query retrievers

Process :
- Original Query  --> LLM --> Multiple Query's --> Retrieve Data for each --> Combine

const multiQueryRetriever = new MultiQueryRetriever.fromLLM({
  llm:,
  retriever: 
  });

================================================================================

// CONTEXTUAL COMPRESSION RETRIEVER
*/
