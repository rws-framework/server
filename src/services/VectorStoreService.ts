import RWSService from './_service';

import { EmbeddingsInterface } from '@langchain/core/embeddings';

import RWSVectorStore, { VectorDocType } from '../models/convo/VectorStore';

class VectorStoreService extends RWSService
{
    async createStore(docs: VectorDocType, embeddings: EmbeddingsInterface): Promise<RWSVectorStore>
    {        
        return await (new RWSVectorStore(docs, embeddings)).init();
    }    
}

export default VectorStoreService.getSingleton();
export {VectorStoreService};