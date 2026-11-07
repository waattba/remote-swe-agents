import { authenticateApiKey } from '../auth/api-key';
import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@remote-swe-agents/agent-core/lib';
import { z } from 'zod';
import { modelTypeSchema } from '@remote-swe-agents/agent-core/schema';

// Schema for request validation
const createSessionSchema = z.object({
  message: z.string().min(1),
  modelOverride: modelTypeSchema.optional(),
});

export async function POST(request: NextRequest) {
  // Authenticate and get sender info
  const auth = await authenticateApiKey(request);
  if (!auth.ok) {
    return auth.response;
  }

  // Use ownerId if available, otherwise use the api key id
  const userId = auth.sender.ownerId ?? auth.sender.id;

  // Parse and validate request body
  const body = await request.json();
  const parsedBody = createSessionSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json({ error: 'Invalid request data', details: parsedBody.error.format() }, { status: 400 });
  }

  const { message, modelOverride } = parsedBody.data;

  const workerId = await createSession({
    message,
    initiator: `rest#${userId}`,
    modelOverride,
    senderUserId: userId,
    senderType: 'webapp',
    senderDisplayName: auth.sender.displayName,
  });

  return NextResponse.json({ sessionId: workerId }, { status: 201 });
}
