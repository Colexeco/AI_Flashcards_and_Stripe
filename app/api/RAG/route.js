import "cheerio";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { pull } from "langchain/hub";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { NextResponse } from "next/server";

export async function POST(req) {
    const data = await req.text(); // extracts the text data from the request body
    // extract URLs user wants to use for RAG (if any)
    const urlExtractionString = new String(data)
    // create array of URLS and string of URLS to check if user passed in any
    const urls = urlExtractionString.match(/https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,}/igm)
    const urlString = new String(urlExtractionString.match(/https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,}/igm))
    console.log(urls)
    //If user doesn't pass in any URLs, no need to do RAG
    if ((urlString != 'null') && (urlString.length > 0)) {
        const loader = new CheerioWebBaseLoader(
            ...urls,
        );
        const docs = await loader.load();

        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });
        const splits = await textSplitter.splitDocuments(docs);
        const vectorStore = await MemoryVectorStore.fromDocuments(
            splits,
            new OpenAIEmbeddings()
        );

        // Retrieve and generate using the relevant snippets of the blog.
        const retriever = vectorStore.asRetriever();
        const prompt = await pull("rlm/rag-prompt");
        const llm = new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0 });

        const ragChain = await createStuffDocumentsChain({
            llm,
            prompt,
            outputParser: new StringOutputParser(),
        });

        const encoder = new TextEncoder();
        const retrievedDocs = await retriever.invoke("What is the difference between UI and UX design?");
        console.log(prompt.promptMessages.map((msg) => msg.prompt.template).join("\n"));
        const res = await ragChain.invoke({
            question: "What is the difference between UI and UX design?",
            context: retrievedDocs,
        });
        console.log(res)
        return new NextResponse(res)
    }
    return new NextResponse("")
}