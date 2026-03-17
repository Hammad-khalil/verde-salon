'use server';
/**
 * @fileOverview An AI agent for generating SEO metadata.
 *
 * - generateSeoMetadata - A function that generates SEO titles, meta descriptions, and image ALT tags.
 * - AiSeoMetadataGeneratorInput - The input type for the generateSeoMetadata function.
 * - AiSeoMetadataGeneratorOutput - The return type for the generateSeoMetadata function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiSeoMetadataGeneratorInputSchema = z.object({
  pageContent: z.string().describe('The main text content of the page or blog post.').optional(),
  keywords: z.array(z.string()).describe('An array of relevant keywords to consider for SEO.').optional(),
  existingTitle: z.string().describe('The current SEO title of the page, if available, for refinement.').optional(),
  existingMetaDescription: z
    .string()
    .describe('The current meta description of the page, if available, for refinement.')
    .optional(),
  imageDescription: z
    .string()
    .describe('A brief description of the image for which to generate an ALT tag.')
    .optional(),
});
export type AiSeoMetadataGeneratorInput = z.infer<typeof AiSeoMetadataGeneratorInputSchema>;

const AiSeoMetadataGeneratorOutputSchema = z.object({
  seoTitle: z.string().max(60).describe('A suggested SEO title, ideally under 60 characters.'),
  metaDescription: z
    .string()
    .max(160)
    .describe('A suggested meta description, ideally under 160 characters.'),
  imageAltTag: z.string().describe('A descriptive ALT tag for the image.'),
});
export type AiSeoMetadataGeneratorOutput = z.infer<typeof AiSeoMetadataGeneratorOutputSchema>;

export async function generateSeoMetadata(
  input: AiSeoMetadataGeneratorInput
): Promise<AiSeoMetadataGeneratorOutput> {
  return aiSeoMetadataGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiSeoMetadataGeneratorPrompt',
  input: {schema: AiSeoMetadataGeneratorInputSchema},
  output: {schema: AiSeoMetadataGeneratorOutputSchema},
  prompt: `You are an expert SEO specialist and content optimizer for a high-end salon website.
Your task is to generate SEO metadata based on the provided content and keywords.

Generate a concise and compelling SEO title (under 60 characters), a rich meta description (under 160 characters), and a descriptive image ALT tag.

Consider the following information:

Page Content: {{{pageContent}}}
Keywords: {{#if keywords}}{{#each keywords}}{{{this}}}{{/each}}{{else}}None provided.{{/if}}
Existing Title: {{#if existingTitle}}{{{existingTitle}}}{{else}}None provided.{{/if}}
Existing Meta Description: {{#if existingMetaDescription}}{{{existingMetaDescription}}}{{else}}None provided.{{/if}}
Image Description: {{#if imageDescription}}{{{imageDescription}}}{{else}}No image description provided.{{/if}}

Instructions:
1. Create an SEO title that is appealing and relevant to the content, ideally under 60 characters. If an existing title is provided, refine it if necessary.
2. Create a meta description that summarizes the content, encourages clicks, and includes relevant keywords, ideally under 160 characters. If an existing meta description is provided, refine it if necessary.
3. Create a descriptive and keyword-rich ALT tag for the image, if an image description is provided.
4. Ensure the output strictly adheres to the JSON schema provided in the output instructions, including character limits for title and description.
`,
});

const aiSeoMetadataGeneratorFlow = ai.defineFlow(
  {
    name: 'aiSeoMetadataGeneratorFlow',
    inputSchema: AiSeoMetadataGeneratorInputSchema,
    outputSchema: AiSeoMetadataGeneratorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
