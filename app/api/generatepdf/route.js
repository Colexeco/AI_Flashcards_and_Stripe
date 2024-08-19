import { NextResponse } from "next/server";
import OpenAI from "openai";
import pdf from "pdf-parse";

export async function GET() {
    console.log('GET route hit');
    return NextResponse.json({ message: 'GET route working' });
  }

const systemPrompt = `
The content provided will be extracted from a PDF document.
1. **Content Focus:** Ensure that the information is accurate, relevant, and directly aligned with the learning objectives. Each card should target a single piece of information, whether it's a definition, concept, formula, or important fact.

2. **Clarity and Simplicity:** Use simple, direct language to make the content easy to understand. Avoid overly complex sentences or unnecessary jargon unless the goal is to learn that specific term.

3. **Engagement:** Include a mix of question types (e.g., true/false, multiple-choice, short answer) to keep the learning process dynamic. If applicable, incorporate mnemonic devices or visual elements (like diagrams or charts) to enhance memory retention.

4. **Pacing:** Structure the flashcards in a logical order, starting with foundational concepts and gradually progressing to more complex ideas. This approach helps build understanding step-by-step.

5. **Review and Revision:** Periodically review and update the flashcards to ensure the content remains accurate and relevant. Consider the feedback of learners to improve the effectiveness of the flashcards.

6. **Customization:** Tailor the flashcards to the specific needs of the target audience, whether they are students preparing for an exam, professionals learning new skills, or anyone else looking to acquire knowledge.

7. **Examples:** Whenever possible, provide examples or practical applications of the concepts to illustrate their real-world relevance. This approach helps learners connect theoretical knowledge with practical scenarios.

8. Only generate 10 flashcards.
9. Make sure the text in the back of the flashcard is max 3 lines long.

Return in the following JSON format:
{
    "flashcards":[{
        "front": str,
        "back": str
    }]
}
`;

export async function POST(req) {
    console.log('PDF generation route hit');
  try {
    const openai = new OpenAI();
    const data = await req.formData();
    const file = data.get('file');
    
    if (!file || !file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: "Invalid file type. Please upload a PDF." }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    
    // Extract text from PDF
    const pdfData = await pdf(Buffer.from(buffer));
    const extractedText = pdfData.text;

    if (extractedText.length > 100000) {
      return NextResponse.json({ error: "PDF content too long" }, { status: 400 });
    }

    // Create a chat completion request
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: extractedText,
        },
      ],
      model: "gpt-4o",
      response_format: { type: "json_object" },
    });
    console.log(completion.choices[0].message.content)

    const flashcards = JSON.parse(completion.choices[0].message.content);

    return NextResponse.json(flashcards.flashcards);
  } catch (error) {
    console.error("Error processing PDF:", error);
    return NextResponse.json({ error: "Error processing PDF" }, { status: 500 });
  }
}