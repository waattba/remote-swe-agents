import type { InferenceBackend } from '@remote-swe-agents/agent-core/lib';
import { bedrockBackend } from './bedrock-backend';

const allBackends: InferenceBackend[] = [bedrockBackend];

export { bedrockBackend };

/**
 * Dispose of every backend's long-lived resources. Invoked from the worker
 * process signal handler; must be safe to call multiple times.
 */
export const disposeAllBackends = async (): Promise<void> => {
  await Promise.all(
    allBackends.map(async (backend) => {
      if (typeof backend.dispose !== 'function') return;
      try {
        await backend.dispose();
      } catch (e) {
        console.error(`[backends] ${backend.kind}.dispose() failed:`, e);
      }
    })
  );
};
