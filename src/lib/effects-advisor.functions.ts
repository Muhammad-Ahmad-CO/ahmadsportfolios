import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  device: z.enum(["phone", "tablet", "laptop", "desktop"]),
  performance: z.enum(["low", "medium", "high"]),
  motion: z.enum(["minimal", "some", "full"]),
  battery: z.boolean(),
  notes: z.string().trim().max(300).optional().default(""),
  detected: z.object({
    cores: z.number().nullable(),
    memory: z.number().nullable(),
    width: z.number(),
    reducedMotion: z.boolean(),
  }),
});

export type EffectsAdvice = {
  floatingStar: boolean;
  summary: string;
  tips: string[];
};

const schema = {
  type: "object",
  additionalProperties: false,
  required: ["floatingStar", "summary", "tips"],
  properties: {
    floatingStar: { type: "boolean", description: "Whether to show the decorative floating 3D star" },
    summary: { type: "string" },
    tips: { type: "array", items: { type: "string" } },
  },
};

export const recommendEffects = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<{ advice?: EffectsAdvice; error?: string }> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) return { error: "The advisor isn't configured right now." };
    const prompt = `Visitor setup: ${JSON.stringify(data)}`;
    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "fetch" },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        stream: true,
        store: false,
        reasoning: { effort: "low", summary: "auto" },
        include: ["reasoning.encrypted_content"],
        text: { format: { type: "json_schema", name: "effects_advice", strict: true, schema } },
        input: [
          {
            role: "system",
            content:
              "You advise visitors of a portfolio website on visual effect settings for a smooth, accessible experience. The site has a decorative WebGL floating 3D star (moderately GPU heavy), particle text, a crowd animation and scroll animations. Decide floatingStar (true only if the device can handle it and the visitor wants motion; always false for minimal motion, reduced-motion or low performance/battery saving). Give a one-sentence friendly summary and 2-4 short practical tips (e.g. OS reduced-motion setting, browser zoom). Plain language, no jargon.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });
    if (!res.ok || !res.body) {
      if (res.status === 429) return { error: "The advisor is busy. Please try again in a minute." };
      if (res.status === 402 || res.status === 403) return { error: "The advisor is unavailable at the moment." };
      return { error: "Couldn't get a recommendation. Please try again later." };
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let text = "";
    let failed = false;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const evt = JSON.parse(payload);
          if (evt.type === "response.output_text.delta") text += evt.delta;
          if (evt.type === "error" || evt.type === "response.failed") failed = true;
        } catch { /* partial */ }
      }
    }
    if (failed || !text) return { error: "Couldn't get a recommendation. Please try again later." };
    try {
      const parsed = JSON.parse(text) as EffectsAdvice;
      return { advice: { floatingStar: !!parsed.floatingStar, summary: String(parsed.summary), tips: (parsed.tips ?? []).slice(0, 4).map(String) } };
    } catch {
      return { error: "Couldn't read the recommendation. Please try again." };
    }
  });
