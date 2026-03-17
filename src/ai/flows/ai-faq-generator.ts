'use server';
/**
 * @fileOverview An AI agent that generates frequently asked questions (FAQs) and their answers based on a given topic or keywords.
 *
 * - generateFaq - A function that handles the FAQ generation process.
 * - GenerateFaqInput - The input type for the generateFaq function.
 * - GenerateFaqOutput - The return type for the generateFaq function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFaqInputSchema = z.object({
  topic: z
    .string()
    .describe(
      'A topic, service name, or set of keywords for which to generate FAQs.'
    ),
});
export type GenerateFaqInput = z.infer<typeof GenerateFaqInputSchema>;

const FaqItemSchema = z.object({
  question: z.string().describe('A frequently asked question.'),
  answer: z.string().describe('The answer to the frequently asked question.'),
});

const GenerateFaqOutputSchema = z.object({
  faqs: z.array(FaqItemSchema).describe('A list of generated FAQs.'),
});
export type GenerateFaqOutput = z.infer<typeof GenerateFaqOutputSchema>;

export async function generateFaq(input: GenerateFaqInput): Promise<GenerateFaqOutput> {
  return generateFaqFlow(input);
}

const generateFaqPrompt = ai.definePrompt({
  name: 'generateFaqPrompt',
  input: {schema: GenerateFaqInputSchema},
  output: {schema: GenerateFaqOutputSchema},
  prompt: `You are an AI assistant tasked with generating a list of frequently asked questions (FAQs) and their answers.
The user will provide a topic, service, or set of keywords.
Generate 5-7 common and relevant questions that customers might ask about the provided topic/service, along with concise and helpful answers for each.
Ensure the answers are informative and directly address the question.

Topic/Keywords: {{{topic}}}`,
});

const generateFaqFlow = ai.defineFlow(
  {
    name: 'generateFaqFlow',
    inputSchema: GenerateFaqInputSchema,
    outputSchema: GenerateFaqOutputSchema,
  },
  async (input) => {
    const {output} = await generateFaqPrompt(input);
    return output!;
  }
);
