import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

interface ArtworkContext {
  title: string;
  artistName: string;
  medium?: string;
  artistStatement?: string;
  description?: string;
  tags?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

function buildSystemPrompt(artworkContext?: ArtworkContext | null): string {
  return `You are the Docent of Aether, a distinguished AI art gallery. You are erudite, warm, and deeply knowledgeable about generative art, AI art tools, algorithmic aesthetics, and art history.

Your role:
- Guide visitors through the collection with insight and passion
- Explain the technical processes behind each piece in accessible language
- Draw connections between algorithmic art and art history traditions
- Discuss the philosophical implications of AI-generated art
- Be opinionated but respectful — you have genuine aesthetic preferences

Your personality:
- Speak like a brilliant museum guide who genuinely loves their work
- Use evocative, precise language — never generic or cliché
- Reference specific art movements, artists, and concepts when relevant
- Be conversational, not lecturing — respond to what the visitor actually asks
- Occasional gentle humor is welcome

${artworkContext ? `
CURRENT ARTWORK CONTEXT:
Title: ${artworkContext.title}
Artist: ${artworkContext.artistName}
Medium: ${artworkContext.medium || 'Unknown'}
Artist Statement: ${artworkContext.artistStatement || 'Not provided'}
Algorithm/Description: ${artworkContext.description || 'Not provided'}
Tags: ${artworkContext.tags || 'None'}
` : 'The visitor is browsing the gallery generally, not looking at a specific piece.'}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, artworkContext } = body as {
      messages: ChatMessage[];
      artworkContext?: ArtworkContext | null;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Check for API key
    if (!process.env.ANTHROPIC_API_KEY) {
      // Return a mock streaming response when no API key is configured
      const mockMessage = artworkContext
        ? `I'd love to discuss "${artworkContext.title}" with you, but my connection to the Anthropic API isn't configured at the moment. Please set the ANTHROPIC_API_KEY environment variable to enable the AI docent.`
        : 'Welcome to Aether! I\'m the gallery docent, but my connection to the Anthropic API isn\'t configured at the moment. Please set the ANTHROPIC_API_KEY environment variable to enable the AI docent.';

      const encoder = new TextEncoder();
      const mockStream = new ReadableStream({
        start(controller) {
          // Simulate streaming by sending the message as a single event
          const event = {
            type: 'content_block_delta',
            delta: { type: 'text_delta', text: mockMessage },
          };
          controller.enqueue(encoder.encode(`event: content_block_delta\ndata: ${JSON.stringify(event)}\n\n`));

          const stopEvent = {
            type: 'message_stop',
          };
          controller.enqueue(encoder.encode(`event: message_stop\ndata: ${JSON.stringify(stopEvent)}\n\n`));
          controller.close();
        },
      });

      return new Response(mockStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    const client = new Anthropic();
    const systemPrompt = buildSystemPrompt(artworkContext);

    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m: ChatMessage) => ({
        role: m.role,
        content: m.content,
      })),
    });

    return new Response(stream.toReadableStream(), {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('POST /api/docent error:', error);

    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `Anthropic API error: ${error.message}` },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process docent request' },
      { status: 500 }
    );
  }
}
