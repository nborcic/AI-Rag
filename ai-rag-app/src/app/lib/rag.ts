import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { RetrievalQAChain } from "langchain/chains";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { CharacterTextSplitter } from "langchain/text_splitter";

// Mock company documents
const COMPANY_DOCS = `
Company Policy Document (2024)

Work Hours: Standard working hours are 9 AM to 5 PM, Monday through Friday.
Employees are expected to maintain a minimum of 40 hours per week.

Remote Work Policy: Employees are allowed to work remotely up to 3 days per week,
subject to manager approval and team coordination.

Employee Benefits:
- Health Insurance: Comprehensive health coverage including medical, dental, and vision.
- 401(k) Plan: Company matches up to 5% of employee contributions.
- Paid Time Off: 20 days of PTO annually, plus 10 federal holidays.

Security Guidelines:
- All employees must use two-factor authentication for company systems.
- Passwords must be changed every 90 days and meet complexity requirements.
- Company data must not be shared on personal devices or unauthorized cloud storage.
`;

export class RAGService {
  private static instance: RAGService;
  private chain: RetrievalQAChain | null = null;

  private constructor() {}

  public static getInstance(): RAGService {
    if (!RAGService.instance) {
      RAGService.instance = new RAGService();
    }
    return RAGService.instance;
  }

  public async initialize() {
    if (this.chain) return;

    try {
      // Initialize text splitter
      const textSplitter = new CharacterTextSplitter({
        separator: "\n",
        chunkSize: 1000,
        chunkOverlap: 200,
      });

      // Split documents
      const docs = await textSplitter.createDocuments([COMPANY_DOCS]);

      // Create embeddings
      const embeddings = new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
      });

      // Create vector store
      const vectorStore = await MemoryVectorStore.fromDocuments(
        docs,
        embeddings
      );

      // Create model
      const model = new OpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY,
        temperature: 0,
        modelName: "gpt-3.5-turbo",
      });

      // Create chain
      this.chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());
    } catch (error) {
      console.error("Error initializing RAG service:", error);
      throw error;
    }
  }

  public async query(question: string): Promise<string> {
    if (!this.chain) {
      throw new Error("RAG service not initialized");
    }

    try {
      const response = await this.chain.call({
        query: question,
      });

      return response.text;
    } catch (error) {
      console.error("Error querying RAG service:", error);
      throw error;
    }
  }
}
