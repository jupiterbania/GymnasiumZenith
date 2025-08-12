'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting relevant categories for gallery uploads.
 *
 * The flow takes a title and description of a gallery item as input and returns a list of suggested categories.
 *
 * @interface SuggestGalleryCategoriesInput - The input type for the suggestGalleryCategories function.
 * @interface SuggestGalleryCategoriesOutput - The output type for the suggestGalleryCategories function.
 * @function suggestGalleryCategories - A function that takes SuggestGalleryCategoriesInput and returns a Promise of SuggestGalleryCategoriesOutput.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestGalleryCategoriesInputSchema = z.object({
  title: z.string().describe('The title of the gallery item.'),
  description: z.string().describe('The description of the gallery item.'),
});

export type SuggestGalleryCategoriesInput = z.infer<
  typeof SuggestGalleryCategoriesInputSchema
>;

const SuggestGalleryCategoriesOutputSchema = z.object({
  categories: z
    .array(z.string())
    .describe('A list of suggested categories for the gallery item.'),
});

export type SuggestGalleryCategoriesOutput = z.infer<
  typeof SuggestGalleryCategoriesOutputSchema
>;

export async function suggestGalleryCategories(
  input: SuggestGalleryCategoriesInput
): Promise<SuggestGalleryCategoriesOutput> {
  return suggestGalleryCategoriesFlow(input);
}

const suggestCategoriesPrompt = ai.definePrompt({
  name: 'suggestCategoriesPrompt',
  input: {schema: SuggestGalleryCategoriesInputSchema},
  output: {schema: SuggestGalleryCategoriesOutputSchema},
  prompt: `You are a helpful assistant that suggests categories for gallery items based on their title and description.

  Given the following title and description, suggest a list of relevant categories:

  Title: {{{title}}}
  Description: {{{description}}}

  Categories:`,
});

const suggestGalleryCategoriesFlow = ai.defineFlow(
  {
    name: 'suggestGalleryCategoriesFlow',
    inputSchema: SuggestGalleryCategoriesInputSchema,
    outputSchema: SuggestGalleryCategoriesOutputSchema,
  },
  async input => {
    const {output} = await suggestCategoriesPrompt(input);
    return output!;
  }
);
