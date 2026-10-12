const EMERGENCY_RE =
  /\b(swallow(ed|ing)?|overdos\w*|poison\w*|choking|choked|ate too (much|many)|drank (some|the|a lot)|tragó|tragar|sobredosis|envenen\w*|intoxic\w*|atragant\w*)\b/i;

const EMERGENCY_ANSWER: Record<string, string> = {
  en: "This may be an emergency. Call your local emergency services or poison control right now, and keep the package with you. Do not wait for an answer here.",
  es: "Esto puede ser una emergencia. Llama ahora a los servicios de emergencia locales o al centro de toxicología, y ten el envase a mano. No esperes una respuesta aquí.",
};

export function isEmergency(question: string): boolean {
  return EMERGENCY_RE.test(question);
}

export function emergencyAnswer(language: string): string {
  return EMERGENCY_ANSWER[language] ?? EMERGENCY_ANSWER.en!;
}
