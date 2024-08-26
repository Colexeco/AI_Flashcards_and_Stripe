import { NextResponse } from "next/server";
import "@mendable/firecrawl-js";
import { FireCrawlLoader } from "@langchain/community/document_loaders/web/firecrawl";
import OpenAI from "openai";

const systemPrompt = `You are a flashcard creator for FlashUI: a flashcard creator for UI knowledge. Only create flashcards for knowledge about UI/UX. Refuse to make flashcards for any other knowledge domain. Your goal is to design effective and concise flashcards that aid in the learning and retention of key concepts. Each flashcard should have a clear and specific question or term on one side and a precise, informative answer on the other. When creating these flashcards:

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

    Return in the following JSON format. Do not add json or use backticks, just return the json itself:
    {
        "flashcards":[{
            "front": str,
            "back": str
        }]
    }
`;

export async function POST(req) {
    const data = await req.text();
    const urlExtractionString = new String(data);
    const urls = urlExtractionString.match(/(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])/igm);

    if (urls && urls.length > 0) {
        console.log("URL(s) found!")
        console.log(urls)
        let scrapedData = []
        for (const currURL of urls) {
            try {
                const loader = new FireCrawlLoader({
                    url: new String(currURL),
                    mode: "scrape",
                });

                const docs = await loader.load();
                if (docs[0].metadata.pageStatusCode != 200) {
                    console.error(`Failed to fetch data from URL: ${currURL}`);
                    continue;
                }
                scrapedData.push(docs[0].pageContent)
            } catch (error) {
              console.error(
                `Error occurred while processing URL: ${currURL}`,
                error.message
              );
            }
        }
        const data = scrapedData.join();
        const openai = new OpenAI();
        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: data },
            ],
            model: "gpt-4o",
        });
        const content = completion.choices[0].message.content;

        if (content) {
            //choices[0] contains the response from the AI choices[1] contains the response from the user
            console.log(completion.choices[0].message.content)
            const flashcards = JSON.parse(completion.choices[0].message.content); //parse the response from the AI to JSON object
            //flashcards.flashcard is an array of objects containing front and back of the flashcard
            return NextResponse.json(flashcards.flashcards);
        } else {
            return NextResponse.json({ error: "No content received from OpenAI." });
        }
    } else { //No URLs, so RAG not trigged, use code from /api/generate as before
        console.log("No URLs found.")
        const openai = new OpenAI();
        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: data },
            ],
            model: "gpt-4o",
        });

        const content = completion.choices[0].message.content;
        console.log("OpenAI Response:", content);

        if (content) {
            //choices[0] contains the response from the AI choices[1] contains the response from the user
            console.log(completion.choices[0].message.content)
            const flashcards = JSON.parse(completion.choices[0].message.content); //parse the response from the AI to JSON object
            //flashcards.flashcard is an array of objects containing front and back of the flashcard
            return NextResponse.json(flashcards.flashcards);
        } else {
            return NextResponse.json({ error: "No content received from OpenAI." });
        }
    }
}