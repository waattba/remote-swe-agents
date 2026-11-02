# Fix for Tool Name Validation Error

## Issue Description
An error occurred in session session-1793580028883-61b035a1568c with the following details:
```
An error occurred. This error will not be resolved by retrying, so the turn was stopped.

Cause: The request violated a model API constraint.

Details: 1 validation error detected: Value at 'messages.710.member.content.2.member.toolUse.name' failed to satisfy constraint: Member must satisfy regular expression pattern: [a-zA-Z0-9_-]+
```

## Root Cause Analysis
The error was caused by a tool name containing invalid characters that violated the `[a-zA-Z0-9_-]+` regex pattern required by the Bedrock API. Specifically, the tool name was malformed as `create_file}\\n</parameter` which contains characters outside the allowed set.

## Fix Status
✅ **ALREADY FIXED**

The issue has already been resolved in the codebase via commit `cfba11b` ("refactor: generalize Unicode sanitization to toolUseId and improve documentation (#100)") which added comprehensive Unicode sanitization to prevent such validation errors.

### Key Changes Made:
1. Enhanced the `sanitizeIdentifier` function in `packages/worker/src/agent/strands/message-converter.ts` to remove invisible Unicode characters including:
   - Zero-width space (U+200B)
   - Zero-width non-joiner (U+200C) 
   - Zero-width joiner (U+200D)
   - Zero-width no-break space (BOM) (U+FEFF)
   - Other invisible format characters (U+2060-U+2063)

2. Applied sanitization to both tool names and toolUseIds in the Bedrock → Strands conversion path:
   ```typescript
   return { toolUse: { toolUseId: sanitizeIdentifier(tu.toolUseId), name: sanitizeIdentifier(tu.name), input: tu.input as any } };
   ```

3. Added comprehensive test coverage to verify the fix works correctly:
   - Test cases for zero-width space in tool names
   - Test cases for zero-width joiner in toolUseIds
   - Verification that sanitized names return to their valid forms

## Verification
The fix ensures that any tool names or IDs containing invisible Unicode characters are properly sanitized before being sent to the Bedrock API, preventing the `[a-zA-Z0-9_-]+` pattern validation error.

Sessions experiencing this issue should upgrade to include commit `cfba11b` or later to benefit from this fix.
