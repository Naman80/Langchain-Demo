import "dotenv/config.js";

const LOCAL_BY_HTTPS = true;

export const OPEN_ROUTER_API_KEY = process.env.OPEN_ROUTER_API_KEY;
export const MODEL_NAME = process.env.MODEL_NAME;

// LOCAL LLM ENV
export const LOCAL_LLM_BASE_URL = LOCAL_BY_HTTPS
  ? process.env.LOCAL_LLM_HTTPS_BASE_URL
  : process.env.LOCAL_LLM_BASE_URL;

export const LOCAL_LLM_MODEL1 = process.env.LOCAL_LLM_MODEL1;
export const LOCAL_LLM_MODEL2 = process.env.LOCAL_LLM_MODEL2;
export const LOCAL_LLM_MODEL3 = process.env.LOCAL_LLM_MODEL3;
export const LOCAL_LLM_EMBEDDING_MODEL1 =
  process.env.LOCAL_LLM_EMBEDDING_MODEL1;
export const LOCAL_LLM_EMBEDDING_MODEL2 =
  process.env.LOCAL_LLM_EMBEDDING_MODEL2;
