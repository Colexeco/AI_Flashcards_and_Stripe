import "cheerio";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { pull } from "langchain/hub";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { NextResponse } from "next/server";
import { SystemMessagePromptTemplate, ChatPromptTemplate } from "@langchain/core/prompts"
import OpenAI from "openai";

const systemPrompt = `
You are a flashcard creator for FlashUI: a flashcard creator for UI knowledge. Only create flashcards for knowledge about UI/UX. Refuse to make flashcards for any other knowledge domain. Your goal is to design effective and concise flashcards that aid in the learning and retention of key concepts. Each flashcard should have a clear and specific question or term on one side and a precise, informative answer on the other. When creating these flashcards:

1. **Content Focus:** Ensure that the information is accurate, relevant, and directly aligned with the learning objectives. Each card should target a single piece of information, whether it's a definition, concept, formula, or important fact.

2. **Clarity and Simplicity:** Use simple, direct language to make the content easy to understand. Avoid overly complex sentences or unnecessary jargon unless the goal is to learn that specific term.

3. **Engagement:** Include a mix of question types (e.g., true/false, multiple-choice, short answer) to keep the learning process dynamic. If applicable, incorporate mnemonic devices or visual elements (like diagrams or charts) to enhance memory retention.

4. **Pacing:** Structure the flashcards in a logical order, starting with foundational concepts and gradually progressing to more complex ideas. This approach helps build understanding step-by-step.

5. **Review and Revision:** Periodically review and update the flashcards to ensure the content remains accurate and relevant. Consider the feedback of learners to improve the effectiveness of the flashcards.

6. **Customization:** Tailor the flashcards to the specific needs of the target audience, whether they are students preparing for an exam, professionals learning new skills, or anyone else looking to acquire knowledge.

7. **Examples:** Whenever possible, provide examples or practical applications of the concepts to illustrate their real-world relevance. This approach helps learners connect theoretical knowledge with practical scenarios.

8. Only generate 10 flashcards.
9. Make sure the text in the back of the flashcard is max 3 lines long.

Example:

- **Front:** What is the capital of France?
- **Back:** Paris

- **Front:** Define photosynthesis.
- **Back:** Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize foods with the help of chlorophyll. The process involves the intake of carbon dioxide and water, which are then converted into glucose and oxygen. 

- **Front:** What is the formula for calculating the area of a circle?
- **Back:** The area of a circle is calculated using the formula \( A = \pi r^2 \), where \( r \) is the radius of the circle.

Use this approach to create flashcards for various subjects, always prioritizing the learner's understanding and retention.

Return in the following JSON format as an array of flashcards, where each flashcard has a front and back of type string:

`;
//TODO: replace verbal description of JSON format above with explicit description below (adding the following caused errors: single }, etc)
// {
//     "flashcards":[{
//         "front": str,
//         "back": str
//     }]
// }

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
        const chatPrompt = await pull("rlm/rag-prompt");
        const llm = new ChatOpenAI({ 
            model: "gpt-4o-mini", 
            temperature: 0 
        });
        const message = SystemMessagePromptTemplate.fromTemplate(systemPrompt)
        //console.log(chatPrompt.promptMessages.map((msg) => msg.prompt.template).join("\n"));
        const combinedPrompt = ChatPromptTemplate.fromMessages([
            `You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question.
            Question: {question} 
            Context: {context} 
            Answer:`,
            message,
          ]);
        const ragChain = await createStuffDocumentsChain({
            llm,
            prompt: combinedPrompt,
            outputParser: new StringOutputParser(),
        });

        const contentMatch = data.match(/content:\s*"([^"]*)"/);

        // Check if non-URL content was found
        if (contentMatch) {
            const content = contentMatch[1];

            // Remove URLs from the content
            const contentWithoutUrls = content.replace(/https?:\/\/[^\s]+/g, '').trim();

            console.log(contentWithoutUrls);
            const retrievedDocs = await retriever.invoke(contentWithoutUrls);
            const res = await ragChain.invoke({
                question: contentWithoutUrls,
                context: retrievedDocs,
            });
            console.log(res)
            return new NextResponse(res)
        } else {
            console.log("Content not found");
            const retrievedDocs = await retriever.invoke("Make me some flashcards using what you know.");
            console.log(prompt.promptMessages.map((msg) => msg.prompt.template).join("\n"));
            const res = await ragChain.invoke({
                question: "Make me some flashcards using what you know.",
                context: retrievedDocs,
            });
            console.log(res)
            return new NextResponse(res)
        }
    }
    //create a chat completion request to the OpenAI API with the system prompt and user data
    const openai = new OpenAI();
    const completion = await openai.chat.completions.create({
        messages: [
        {
            role: "system",
            content: systemPrompt,
        },
        {
            role: "user",
            content: data,
        },
        ],
        model: "gpt-4o",
        response_format: { type: "json_object" }, //shows that our response is always a json object
    });

    //choices[0] contains the response from the AI choices[1] contains the response from the user
    console.log(completion.choices[0].message.content)
    const flashcards = JSON.parse(completion.choices[0].message.content); //parse the response from the AI to JSON object
    //flashcards.flashcard is an array of objects containing front and back of the flashcard

    return NextResponse.json(flashcards.flashcards);
}