'use server';
/**
 * @fileOverview A Genkit flow for an AI-powered blog content assistant.
 *
 * - aiBlogContentAssistant - A function that assists content editors with blog post ideas, outlines, and section suggestions.
 * - AiBlogContentAssistantInput - The input type for the aiBlogContentAssistant function.
 * - AiBlogContentAssistantOutput - The return type for the aiBlogContentAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// 1. Define Input Schema
const AiBlogContentAssistantInputSchema = z.object({
  keywords: z.array(z.string()).describe('A list of keywords or key topics relevant to the desired blog content.'),
  serviceCategory: z.string().optional().describe('The salon service category the blog content should relate to (e.g., "Hair Styling", "Skincare", "Nail Care").'),
  existingContent: z.string().optional().describe('Existing blog content for which additional section suggestions are needed.'),
});
export type AiBlogContentAssistantInput = z.infer<typeof AiBlogContentAssistantInputSchema>;

// 2. Define Output Schema
const BlogSectionSchema = z.object({
  heading: z.string().describe('The heading for this section of the blog post.'),
  contentSummary: z.string().describe('A brief summary or key points to cover in this section.'),
});

const BlogOutlineSchema = z.object({
  title: z.string().describe('The suggested title for the blog post.'),
  introduction: z.string().describe('A brief introductory paragraph for the blog post.'),
  sections: z.array(BlogSectionSchema).describe('An array of main body sections for the blog post.'),
  conclusion: z.string().describe('A concluding paragraph for the blog post.'),
});

const AiBlogContentAssistantOutputSchema = z.object({
  suggestedTopics: z.array(z.string()).describe('A list of 3-5 engaging blog post topics relevant to the input keywords and/or service category.'),
  blogOutline: BlogOutlineSchema.describe('A detailed outline for one potential blog post, chosen from the suggested topics, including a title, introduction, 3-5 main sections (each with a heading and a brief content summary), and a conclusion, based on the input keywords and/or service category.'),
  additionalSections: z.array(z.string()).optional().describe('If existing content was provided, this is a list of 2-3 suggestions for additional sections or sub-topics that could enhance the existing blog content.'),
});
export type AiBlogContentAssistantOutput = z.infer<typeof AiBlogContentAssistantOutputSchema>;

// 3. Define the prompt
const aiBlogContentAssistantPrompt = ai.definePrompt({
  name: 'aiBlogContentAssistantPrompt',
  input: { schema: AiBlogContentAssistantInputSchema },
  output: { schema: AiBlogContentAssistantOutputSchema },
  prompt: `You are an expert content editor and SEO specialist for a high-end salon website named Verde Salon.
Your task is to assist in generating blog post content based on the user's input.
The goal is to help a non-technical editor quickly create engaging and comprehensive blog content.

---
Input Details:

{{#if serviceCategory}}
The blog content should be relevant to the "{{{serviceCategory}}}" service category.
{{/if}}

{{#if keywords}}
Key topics and keywords to consider: {{#each keywords}} "{{{this}}}" {{/each}}.
{{/if}}

{{#if existingContent}}
You are also provided with existing blog content. Please analyze it and suggest additional sections to enhance it.
Existing content for analysis:

```
{{{existingContent}}}
```
{{/if}}

---
Please provide your response in JSON format according to the output schema.

Specifically, generate:
1.  \`suggestedTopics\`: A list of 3-5 engaging blog post topics.
2.  \`blogOutline\`: A detailed outline for one blog post, chosen from the suggested topics, including a compelling title, a brief introduction, 3-5 main body sections (each with a descriptive heading and a concise content summary), and a strong conclusion. This outline should be based on the provided service category and keywords.
{{#if existingContent}}
3.  \`additionalSections\`: A list of 2-3 new section ideas or sub-topics that could be added to the \`existingContent\` to make it more comprehensive and valuable.
{{/if}}`,
});

// 4. Define the flow
const aiBlogContentAssistantFlow = ai.defineFlow(
  {
    name: 'aiBlogContentAssistantFlow',
    inputSchema: AiBlogContentAssistantInputSchema,
    outputSchema: AiBlogContentAssistantOutputSchema,
  },
  async (input) => {
    const { output } = await aiBlogContentAssistantPrompt(input);
    if (!output) {
      throw new Error('Failed to generate blog content assistant output.');
    }
    return output;
  }
);

// 5. Export the wrapper function
export async function aiBlogContentAssistant(
  input: AiBlogContentAssistantInput
): Promise<AiBlogContentAssistantOutput> {
  return aiBlogContentAssistantFlow(input);
}
