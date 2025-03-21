export default function decodeInstructionError(err: unknown): string {
  if (
    typeof err === 'object' &&
    err !== null &&
    'InstructionError' in err &&
    Array.isArray((err as any).InstructionError)
  ) {
    const [index, detail] = (err as any).InstructionError;
    if (typeof detail === 'object' && 'Custom' in detail) {
      return `Instruction #${index} failed with custom error code ${detail.Custom}`;
    } else {
      return `Instruction #${index} failed: ${JSON.stringify(detail)}`;
    }
  }

  return 'Unknown error';
}
