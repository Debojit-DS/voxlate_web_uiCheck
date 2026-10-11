/** Existing demo targets and illustrative vocabulary for the homepage ribbon. */
export const DEMO_LANGUAGES = [
  { language: "English", lang: "en", source: "Speak", english: "Speak" },
  { language: "Spanish", lang: "es", source: "Hola", english: "Hello" },
  { language: "French", lang: "fr", source: "Merci", english: "Thanks" },
  { language: "German", lang: "de", source: "Welt", english: "World" },
  { language: "Bengali", lang: "bn", source: "বন্ধু", english: "Friend" },
  { language: "Tamil", lang: "ta", source: "நன்றி", english: "Thanks" },
  { language: "Hindi", lang: "hi", source: "नमस्ते", english: "Hello" },
  { language: "Japanese", lang: "ja", source: "夢", english: "Dream" },
  { language: "Chinese", lang: "zh", source: "朋友", english: "Friend" },
  { language: "Arabic", lang: "ar", source: "سلام", english: "Peace" },
] as const;

export const DEMO_LANGUAGE_NAMES = DEMO_LANGUAGES.map((item) => item.language);
export const DEMO_LANGUAGE_CODES: Record<string, string> = Object.fromEntries(
  DEMO_LANGUAGES.map((item) => [item.language, item.lang]),
);
