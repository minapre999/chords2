import Dexie from "dexie";

export const patternsDB = new Dexie("patternsDB");

patternsDB.version(1).stores({
  patterns: "++id, value" // auto-increment id, pattern string
});

