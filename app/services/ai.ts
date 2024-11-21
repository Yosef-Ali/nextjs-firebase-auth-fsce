import { Mistral } from '@mistralai/mistralai';

const apiKey = process.env.NEXT_PUBLIC_MISTRAL_API_KEY;
const client = new Mistral({ apiKey });

export const aiService = {
  async enhanceContent(text: string): Promise<string> {
    try {
      const response = await client.chat.complete({
        model: 'mistral-large-latest',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that enhances text content. Return ONLY the enhanced text without any prefix or explanation.'
          },
          {
            role: 'user',
            content: `Enhance this text: ${text}`
          }
        ],
      });

      return response.choices[0]?.message?.content?.replace(/^(Here's|This is) .+?:\s*/i, '').trim() || text;
    } catch (error) {
      console.error('Error enhancing content:', error);
      return text;
    }
  },

  async fixSpellingAndGrammar(text: string): Promise<string> {
    try {
      const response = await client.chat.complete({
        model: 'mistral-large-latest',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that fixes spelling and grammar. Return ONLY the corrected text without any prefix or explanation.'
          },
          {
            role: 'user',
            content: `Fix spelling and grammar in this text: ${text}`
          }
        ],
      });

      return response.choices[0]?.message?.content?.replace(/^(Here's|This is) .+?:\s*/i, '').trim() || text;
    } catch (error) {
      console.error('Error fixing spelling and grammar:', error);
      return text;
    }
  },

  async improveFormatting(text: string): Promise<string> {
    try {
      const response = await client.chat.complete({
        model: 'mistral-large-latest',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that improves text formatting. Format the text using HTML tags for emphasis: <strong> for bold and <em> for italics. Use these tags to enhance readability and emphasis where appropriate. Return ONLY the formatted HTML without any prefix or explanation.'
          },
          {
            role: 'user',
            content: `Format this text with appropriate bold and italic emphasis: ${text}`
          }
        ],
      });

      return response.choices[0]?.message?.content?.replace(/^(Here's|This is) .+?:\s*/i, '').trim() || text;
    } catch (error) {
      console.error('Error improving formatting:', error);
      return text;
    }
  }
};
