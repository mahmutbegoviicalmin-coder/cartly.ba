/**
 * Read a photographed Skytec "SPECIFIKACIJA OTKUPNINA" sheet with Claude
 * (vision + structured output). Server only; needs ANTHROPIC_API_KEY.
 */
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";

/** Private Supabase Storage bucket with the photographed sheets. */
export const SHEET_BUCKET = "cod-sheets";

const SheetSchema = z.object({
  pages: z.array(z.object({
    datum: z.string().describe("Datum on the sheet, YYYY-MM-DD, or empty"),
    broj_otkupnina: z.number().nullable().describe("BROJ otkupnina printed at the bottom, null if not on this page"),
    iznos_otkupnina: z.number().nullable().describe("IZNOS otkupnina printed at the bottom in KM, null if not on this page"),
    rows: z.array(z.object({
      rb: z.number().nullable(),
      otkupnina: z.string().describe("Broj otkupnine, e.g. O11335224 or OA004672195"),
      posiljka: z.string().describe("Broj izvorne pošiljke, e.g. 11335224 or A004672195"),
      eksterni: z.string().describe("Eksterni broj (order number like BRS-20261119-2635), empty if blank"),
      posiljalac: z.string().describe("Pošiljalac name as printed"),
      iznos: z.number().describe("IZNOS in KM"),
    })),
  })),
});
export type CodSheet = z.infer<typeof SheetSchema>;

const PROMPT = `These are photos of Skytec "SPECIFIKACIJA OTKUPNINA" sheets (cash-on-delivery money handed over at the depot). A specification can span several photos (Strana 1, Strana 2).
For every photo, transcribe every table row exactly: RB, Broj otkupnine (printed under the barcode), Broj izvorne pošiljke, Eksterni broj, Pošiljalac and IZNOS. Amounts use a decimal comma (84,90 = 84.9). Also copy BROJ otkupnina and IZNOS otkupnina from the bottom of the page when present.
Copy characters exactly as printed; do not guess digits that are not legible - leave the field empty instead. Do not add rows that are not on the sheet.`;

export async function readCodSheet(images: { data: string; mediaType: "image/jpeg" | "image/png" | "image/webp" }[]): Promise<CodSheet> {
  const client = new Anthropic();
  const response = await client.beta.messages.parse({
    model: "claude-opus-5-5",
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "medium", format: betaZodOutputFormat(SheetSchema) },
    messages: [{
      role: "user",
      content: [
        ...images.map((img) => ({ type: "image" as const, source: { type: "base64" as const, media_type: img.mediaType, data: img.data } })),
        { type: "text" as const, text: PROMPT },
      ],
    }],
  });
  if (response.stop_reason === "refusal") throw new Error("Slika nije mogla biti pročitana (odbijeno).");
  if (response.stop_reason === "max_tokens") throw new Error("Previše redova na slikama odjednom - pošalji manje slika.");
  if (!response.parsed_output) throw new Error("Nisam uspio pročitati specifikaciju sa slike.");
  return response.parsed_output;
}
