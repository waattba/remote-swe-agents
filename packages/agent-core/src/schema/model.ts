import { z } from 'zod';

export const inferenceModeSchema = z.enum(['bedrock', 'kiro-cli']);
export type InferenceMode = z.infer<typeof inferenceModeSchema>;

export const kiroModelConfigs = {
  auto: { name: 'Auto (recommended)' },
  'claude-opus-5': { name: 'Claude Opus 5' },
  'claude-opus-4.8': { name: 'Claude Opus 4.8' },
  'claude-opus-4.7': { name: 'Claude Opus 4.7' },
  'claude-opus-4.6': { name: 'Claude Opus 4.6' },
  'claude-sonnet-5': { name: 'Claude Sonnet 5' },
  'claude-sonnet-4.6': { name: 'Claude Sonnet 4.6' },
  'claude-haiku-4.5': { name: 'Claude Haiku 4.5' },
  'gpt-5.6-sol': { name: 'GPT 5.6 Sol' },
  'gpt-5.6-terra': { name: 'GPT 5.6 Terra' },
  'gpt-5.6-luna': { name: 'GPT 5.6 Luna' },
  'deepseek-3.2': { name: 'DeepSeek 3.2' },
  'minimax-m2.5': { name: 'MiniMax M2.5' },
  'glm-5': { name: 'GLM 5' },
  'qwen3-coder-next': { name: 'Qwen3 Coder Next' },
} as const satisfies Record<string, { name: string }>;

export type KiroModelId = keyof typeof kiroModelConfigs;

export const getKiroModelIds = (): KiroModelId[] => Object.keys(kiroModelConfigs) as KiroModelId[];

export const kiroModelSchema = z.enum(Object.keys(kiroModelConfigs) as [KiroModelId, ...KiroModelId[]]);

export const modelTypeList = [
  'opus5',
  'sonnet5',
  'sonnet5-5',
  'opus5-5',
  'sonnet4.6',
  'sonnet4.6-long-context-mode',
  'opus4.8',
  'fable5',
  'opus4.7',
  'opus4.6',
  'opus4.6-long-context-mode',
  'sonnet4.5',
  'sonnet4.5-long-context-mode',
  'opus4.5',
  'haiku4.5',
  'haiku5-5',
  'sonnet4',
  'sonnet4-long-context-mode',
  'opus4.1',
  'opus4',
  'sonnet3.7',
  'sonnet3.5',
  'sonnet3.5v1',
  'haiku3.5',
  'nova-pro',
  'gpt-oss-120b',
  'gpt-oss-20b',
  'gpt-6-luna',
  'qwen3-coder-30b-a3b',
  'kimi-k2.5',
  'nemotron-super-120b',
  'grok-4.7',
  'gemma-3-27b',
] as const;
export const modelTypeSchema = z.enum(modelTypeList);
export type ModelType = z.infer<typeof modelTypeSchema>;

const criRegionSchema = z.enum(['global', 'us', 'eu', 'apac', 'jp', 'au']);
export const criRegion = criRegionSchema
  .catch('us')
  .parse(process.env.NEXT_PUBLIC_BEDROCK_CRI_REGION_OVERRIDE || process.env.BEDROCK_CRI_REGION_OVERRIDE || 'us');

const modelConfigSchema = z.object({
  name: z.string(),
  modelId: z.string(),
  maxOutputTokens: z.number(),
  maxInputTokens: z.number(),
  cacheSupport: z.array(z.enum(['system', 'tool', 'message'])),
  reasoningSupport: z.boolean(),
  toolChoiceSupport: z.array(z.enum(['any', 'auto', 'tool'])),
  isHidden: z.boolean().optional(),
  interleavedThinkingSupport: z.boolean().optional(),
  adaptiveThinkingOnly: z.boolean().optional(),
  // Whether the model accepts a trailing assistant message (Anthropic "prefill").
  // Omitted / true = supported (default, all legacy models). Set false for models
  // that reject prefill (e.g. Sonnet 5, which returns a ValidationException:
  // "This model does not support assistant message prefill"). When false, a
  // trailing assistant message is stripped from the request before invoke.
  assistantPrefillSupport: z.boolean().optional(),
  // Whether the model supports CRI (Cross-Region Inference) profile prefixes.
  // CRI prefixes are region-specific and used by Anthropic and Bedrock models.
  // OpenAI models do not support CRI prefixes, so this should be false for them.
  // Default: true (for backward compatibility with existing models).
  supportsCriProfiles: z.boolean().optional(),
  supportedCriProfiles: z.array(criRegionSchema),
  additionalRequestFields: z.record(z.string(), z.unknown()).optional(),
  // Pricing per 1M tokens (matching AWS Bedrock pricing documentation)
  // Calculation: (tokens × price) / 1,000,000 = USD cost
  pricing: z.object({
    input: z.number(),
    output: z.number(),
    cacheRead: z.number(),
    cacheWrite: z.number(),
    longContextInput: z.number().optional(),
    longContextOutput: z.number().optional(),
    longContextCacheRead: z.number().optional(),
    longContextCacheWrite: z.number().optional(),
  }),
});

export const modelConfigs: Record<ModelType, z.infer<typeof modelConfigSchema>> = {
  opus5: {
    name: 'Claude Opus 5',

    modelId: 'anthropic.claude-opus-5',

    maxInputTokens: 1_000_000,

    maxOutputTokens: 128_000,

    cacheSupport: ['system', 'message', 'tool'],

    reasoningSupport: true,

    toolChoiceSupport: ['any', 'auto', 'tool'],

    interleavedThinkingSupport: true,

    adaptiveThinkingOnly: true,

    assistantPrefillSupport: false,

    supportedCriProfiles: ['global', 'us', 'eu', 'au'],

    isHidden: true,
  },

  pricing: {
    name: 'Claude Sonnet 5',

    modelId: 'anthropic.claude-sonnet-5',

    maxInputTokens: 200_000,

    maxOutputTokens: 64_000,

    cacheSupport: ['system', 'message', 'tool'],

    reasoningSupport: true,

    toolChoiceSupport: ['any', 'auto', 'tool'],

    interleavedThinkingSupport: true,

    adaptiveThinkingOnly: true,

    assistantPrefillSupport: false,

    supportedCriProfiles: ['global', 'us', 'eu', 'au'],

    isHidden: true,
  },

  pricing: {
    name: 'Claude Fable 5',

    modelId: 'anthropic.claude-fable-5',

    maxInputTokens: 1_000_000,

    maxOutputTokens: 128_000,

    cacheSupport: ['system', 'message', 'tool'],

    reasoningSupport: true,

    toolChoiceSupport: ['any', 'auto', 'tool'],

    interleavedThinkingSupport: true,

    adaptiveThinkingOnly: true,

    assistantPrefillSupport: false,

    supportedCriProfiles: ['global', 'us'],

    isHidden: true,
  },

  pricing: {
    name: 'Claude 4 Opus',

    modelId: 'anthropic.claude-opus-4-20250514-v1:0',

    maxInputTokens: 200_000,

    maxOutputTokens: 32_000,

    cacheSupport: ['system', 'message', 'tool'],

    reasoningSupport: true,

    toolChoiceSupport: ['any', 'auto', 'tool'],

    interleavedThinkingSupport: true,

    supportedCriProfiles: ['us'],

    isHidden: true,
  },

  pricing: {
    name: 'Claude 4 Sonnet',

    modelId: 'anthropic.claude-sonnet-4-20250514-v1:0',

    maxInputTokens: 200_000,

    maxOutputTokens: 64_000,

    cacheSupport: ['system', 'message', 'tool'],

    reasoningSupport: true,

    toolChoiceSupport: ['any', 'auto', 'tool'],

    interleavedThinkingSupport: true,

    supportedCriProfiles: ['global', 'us', 'eu', 'apac'],

    isHidden: true,
  },
};

export const getAvailableModelTypes = (): ModelType[] => {
  return Object.entries(modelConfigs)
    .filter(([_, config]) => !config.isHidden && config.supportedCriProfiles.includes(criRegion))
    .map(([type, _]) => type as ModelType);
};
