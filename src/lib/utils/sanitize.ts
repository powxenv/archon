const MAX_CUSTOM_INSTRUCTIONS_LENGTH = 2000;

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+(instructions|prompts|rules|directions)/i,
  /disregard\s+(all\s+)?previous\s+(instructions|prompts|rules|directions)/i,
  /forget\s+(all\s+)?previous\s+(instructions|prompts|rules|directions)/i,
  /you\s+are\s+now\s+/i,
  /new\s+instructions?\s*:/i,
  /system\s*:\s*/i,
  /override\s+(all\s+)?(previous\s+)?(instructions|rules|prompts)/i,
  /pretend\s+(you\s+are|to\s+be)\s+/i,
  /act\s+as\s+(if\s+you\s+(are|were)|a\s+)/i,
  /jailbreak/i,
  /roleplay\s+as/i,
  /<\|im_start\|>/i,
  /<\|im_end\|>/i,
  /\[INST\]/i,
  /\[\/INST\]/i,
  /```system/i,
];

function stripInjectionPatterns(input: string): string {
  let sanitized = input;

  for (const pattern of INJECTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, "[removed]");
  }

  return sanitized;
}

function removeControlCharacters(input: string): string {
  return input
    .split("\n")
    .map((line) => line.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ""))
    .join("\n");
}

export function sanitizeCustomInstructions(input: unknown): string | null {
  if (input === undefined || input === null) {
    return null;
  }

  if (typeof input !== "string") {
    return null;
  }

  const trimmed = input.trim();

  if (trimmed.length === 0) {
    return null;
  }

  const withoutControlChars = removeControlCharacters(trimmed);

  const stripped = stripInjectionPatterns(withoutControlChars);

  const collapsed = stripped.replace(/\n{3,}/g, "\n\n").trim();

  if (collapsed.length === 0) {
    return null;
  }

  return collapsed.slice(0, MAX_CUSTOM_INSTRUCTIONS_LENGTH);
}
