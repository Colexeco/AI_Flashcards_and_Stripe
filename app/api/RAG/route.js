import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { pull } from "langchain/hub";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import { formatDocumentsAsString } from "langchain/util/document";

export async function POST(req) {
    const llm = new ChatOpenAI({
        model: "gpt-4o-mini",
        temperature: 0
    });
      
    const prompt = await pull("rlm/rag-prompt");
    const exampleMessages = await prompt.invoke({
        context: "filler context",
        question: "filler question",
    });
    exampleMessages;
    console.log(exampleMessages.messages[0].content);
    const ragChain = RunnableSequence.from([
    {
        context: retriever.pipe(formatDocumentsAsString),
        question: new RunnablePassthrough(),
    },
    prompt,
    llm,
    new StringOutputParser(),
    ]);
    for await (const chunk of await ragChain.stream(
        "What is task decomposition?"
    )) {
    console.log(chunk);
    }
}