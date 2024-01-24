import RWSService from './_service';
import { EmbeddingsInterface } from "@langchain/core/embeddings";
import RWSVectorStore, { VectorDocType } from '../models/convo/VectorStore';
declare class VectorStoreService extends RWSService {
    createStore(docs: VectorDocType, embeddings: EmbeddingsInterface): Promise<RWSVectorStore>;
}
declare const _default: VectorStoreService;
export default _default;
