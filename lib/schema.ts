import { z } from "zod";

const Severity = z.enum(["danger", "caution", "info"]);
const LabelType = z.enum(["food", "medicine", "household", "other"]);

export const QuickResult = z.object({
  readable: z.boolean(),
  labelType: LabelType,
  productName: z.string().max(120).nullable(),
});
export type QuickResult = z.infer<typeof QuickResult>;

export const PersonalFlag = z.object({
  severity: Severity,
  kind: z.enum(["allergen", "interaction", "diet", "other"]),
  title: z.string().max(100),
  explanation: z.string().max(400),
  evidence: z.string().min(1).max(300),
  profileMatch: z.string().max(100),
});
export type PersonalFlag = z.infer<typeof PersonalFlag>;

export const LabelWarning = z.object({
  severity: Severity,
  text: z.string().max(300),
  evidence: z.string().min(1).max(300),
});
export type LabelWarning = z.infer<typeof LabelWarning>;

export const Analysis = z.object({
  labelType: LabelType,
  productName: z.string().max(120).nullable(),
  readable: z.boolean(),
  language: z.string().max(20),
  summary: z.string().max(800),
  personalFlags: z.array(PersonalFlag).max(12),
  labelWarnings: z.array(LabelWarning).max(12),
  keyFacts: z.array(z.object({ label: z.string().max(60), value: z.string().max(200) })).max(12),
  safeForYou: z.enum(["yes", "no", "check", "unknown"]),
  confidence: z.enum(["high", "medium", "low"]),
  disclaimer: z.string().max(400).nullable(),
});
export type Analysis = z.infer<typeof Analysis>;

const ProfileItem = z.string().trim().min(1).max(60);

export const Profile = z.object({
  allergies: z.array(ProfileItem).max(20),
  medications: z.array(ProfileItem).max(30),
  diet: z.array(ProfileItem).max(10),
  language: z.string().max(10),
});
export type Profile = z.infer<typeof Profile>;

export const DEFAULT_PROFILE: Profile = { allergies: [], medications: [], diet: [], language: "en" };

// Base64 of a 4 MB body; the route guard enforces the real byte limit.
const ImageBase64 = z.string().min(1).max(5_600_000);
const SampleId = z.enum(["snack", "snack-es", "ibuprofen", "cleaner", "blurry"]);

export const QuickRequest = z.object({ image: ImageBase64, sampleId: SampleId.optional() });
export type QuickRequest = z.infer<typeof QuickRequest>;

export const AnalyzeRequest = z.object({
  image: ImageBase64,
  profile: Profile,
  language: z.string().max(10),
  sampleId: SampleId.optional(),
});
export type AnalyzeRequest = z.infer<typeof AnalyzeRequest>;

export const AskRequest = z.object({
  question: z.string().trim().min(1).max(500),
  analysis: Analysis,
  profile: Profile,
  language: z.string().max(10),
});
export type AskRequest = z.infer<typeof AskRequest>;
