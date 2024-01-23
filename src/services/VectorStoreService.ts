import { RWSService, ConsoleService, getAppConfig } from 'rws-js-server'

import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { EmbeddingsInterface } from "@langchain/core/embeddings";

import RWSVectorStore, { VectorDocType } from '../models/convo/VectorStore';

class VectorStoreService extends RWSService
{
    async createStore(docs: VectorDocType, embeddings: EmbeddingsInterface): Promise<RWSVectorStore>
    {        
        return await (new RWSVectorStore(docs, embeddings)).init();
    }    
}

export default VectorStoreService.getSingleton();