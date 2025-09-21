// Import the Pinecone library
const { Pinecone } = require('@pinecone-database/pinecone')

// Initialize a Pinecone client with your API key
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

// Create a dense index with integrated embedding
const apexAI_Index = pc.index('apex-ai');
async function createMemory({ vectors, metadata, messageId }) {
    await apexAI_Index.upsert([
        {
            id: messageId,
            values: vectors,
            metadata
        }
    ])
}
const queryMemory = async ({ queryVector, limit = 5, metadata }) => {
    const data = await apexAI_Index.query({
        vector: queryVector,
        topK: limit,
        filter: metadata ? metadata : undefined,
        includeMetadata: true

    })
    return data.matches;
}


module.exports = {
    createMemory,
    queryMemory
}