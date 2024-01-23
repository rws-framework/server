import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { EmbeddingsInterface } from "@langchain/core/embeddings";
import { Document } from "@langchain/core/documents";
type VectorDocType = Document<Record<string, any>>[];
export default class RWSVectorStore {
    private faiss;
    private docs;
    private embeddings;
    constructor(docs: VectorDocType, embeddings: EmbeddingsInterface);
    init(): Promise<RWSVectorStore>;
    getFaiss(): FaissStore;
}
export { VectorDocType };
