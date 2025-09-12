import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || ""
});

interface SummarizeRequest {
  uri: string;
}

interface SummarizeResponse {
  summary: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SummarizeResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      summary: '',
      error: 'Method not allowed' 
    });
  }

  try {
    const { uri }: SummarizeRequest = req.body;

    if (!uri) {
      return res.status(400).json({ 
        summary: '',
        error: 'URI is required' 
      });
    }

    // Convert IPFS URI to HTTP gateway URL
    let metadataUrl = uri;
    if (uri.startsWith('ipfs://')) {
      const hash = uri.replace('ipfs://', '');
      metadataUrl = `https://ipfs.io/ipfs/${hash}`;
    }

    // Fetch metadata from IPFS
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const metadataResponse = await fetch(metadataUrl, {
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!metadataResponse.ok) {
      throw new Error(`Failed to fetch metadata: ${metadataResponse.status}`);
    }

    const metadata = await metadataResponse.json();
    const metadataText = JSON.stringify(metadata, null, 2);

    // Use OpenAI for summarization if API key is available
    const apiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY;
    
    if (apiKey && apiKey.trim() && apiKey !== "default_key") {
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025
          messages: [
            {
              role: "system",
              content: "You are an AI assistant that summarizes dataset metadata. Provide a concise 1-2 sentence summary focusing on the key aspects of the dataset including its purpose, content type, and potential use cases."
            },
            {
              role: "user",
              content: `Please summarize this dataset metadata:\n\n${metadataText}`
            }
          ],
          max_tokens: 150,
          temperature: 0.7,
        });

        const aiSummary = response.choices[0]?.message?.content || '';
        
        if (aiSummary.trim()) {
          return res.status(200).json({ summary: aiSummary.trim() });
        }
      } catch (openaiError) {
        console.error('OpenAI API error:', openaiError);
        // Fall through to fallback summary
      }
    }

    // Fallback: Use first 200 characters of metadata
    const fallbackSummary = metadataText.length > 200 
      ? metadataText.substring(0, 200) + '...'
      : metadataText;

    return res.status(200).json({ 
      summary: `Dataset metadata preview: ${fallbackSummary}` 
    });

  } catch (error) {
    console.error('Summarization error:', error);
    
    return res.status(500).json({ 
      summary: '',
      error: error instanceof Error ? error.message : 'Failed to summarize dataset'
    });
  }
}
