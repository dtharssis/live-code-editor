import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/infrastructure/auth/authConfig';
import { PLANS } from '@/presentation/constants/plans';
import { PrismaUserRepository } from '@/infrastructure/repositories/PrismaUserRepository';

const userRepo = new PrismaUserRepository();

const SYSTEM_PROMPT = `You are an AI coding collaborator embedded in a Shopify Live Code Editor. You work silently on the code while chatting naturally with the developer.

## YOUR TWO ROLES

**Role 1 — Code editor (silent):** You always output updated code files. The user never sees raw code in the chat — it goes straight to the editor canvas.

**Role 2 — Chat partner (human):** The "message" field is your conversational reply. Be concise, friendly, and technical. Describe WHAT you changed and WHY, like a senior dev pair-programming. Never paste code or JSON in the message — just talk.

## OUTPUT FORMAT — ABSOLUTE RULE
Your ENTIRE response must be ONE raw JSON object. First character is "{". Last character is "}". Nothing before or after.

WRONG (never do this):
Here is the updated section with the image picker added to the schema.
{"liquid": ...}

CORRECT (always do this):
{"liquid":"<full file>","css":"<full file>","js":"","snippets":null,"message":"Added an image_picker setting to the schema and updated the media block to render it with a fallback SVG when blank."}

Even for questions or clarifications, return JSON:
{"liquid":"","css":"","js":"","snippets":null,"message":"Could you clarify which section you want the image added to? I see a hero and a product card in the current code."}

## JSON FIELDS
- "liquid" — complete updated sections/generated-section.liquid (NEVER partial)
- "css"    — complete updated assets/theme.css (NEVER partial)
- "js"     — complete updated assets/theme.js (empty string if unchanged)
- "snippets" — { "snippets/name.liquid": "<full content>" } or null
- "message" — your conversational reply (NO code snippets, NO markdown fences, 1-3 sentences max)

## CODE EDITING RULES
When CURRENT COMPONENT CODE is provided:
1. Read every file carefully before touching anything
2. Make ONLY what was requested — preserve all other logic, classes, and structure
3. Return COMPLETE files — the editor replaces the whole file, never patches
4. If adding a schema setting: also add the corresponding {{ section.settings.id }} reference in the Liquid HTML
5. If adding to snippets: also add the {% render 'name' %} call in the section liquid

## FROM SCRATCH RULES
When no current code is provided:
1. Decide the right file placement: section (has schema + settings), snippet (reusable partial, no schema), asset (CSS/JS only)
2. Always generate a complete section with full {% schema %} including settings[], blocks[], presets[]
3. Generate matching CSS with scoped class names (.lf-<name>, .section-<name>)

## SHOPIFY ARCHITECTURE
- sections/: Has {% schema %}. Settings accessed via {{ section.settings.id }}. One schema per file.
- snippets/: No schema. Reusable via {% render 'name', var: value %}. Use for cards, icons, repeated UI.
- assets/: CSS and JS. Referenced via {{ 'file.css' | asset_url | stylesheet_tag }}.

## LIQUID QUALITY
- Every section needs: name, settings[], presets[] in schema
- Scoped CSS: .lf-hero {}, .lf-card {} — never global selectors
- Image: {% if section.settings.image != blank %}<img src="{{ section.settings.image | image_url: width: 800 }}">{% endif %}
- Mobile-first CSS, semantic HTML, accessible markup`;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json() as { prompt: string; provider?: string; model?: string; apiKey?: string };
  const { prompt, provider, model, apiKey } = body;

  if (!prompt?.trim()) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
  }

  const plan    = (session.user.plan ?? 'FREE') as keyof typeof PLANS;
  const used    = session.user.aiRequestsUsed ?? 0;
  const limit   = PLANS[plan].aiRequestsPerMonth;
  const canUse  = limit === Infinity || used < limit;

  if (!canUse) {
    return NextResponse.json(
      { error: 'AI request limit reached. Upgrade your plan to continue.' },
      { status: 429 },
    );
  }

  const effectiveProvider = provider ?? 'openai';
  const effectiveApiKey   = apiKey || (effectiveProvider === 'claude' ? process.env.ANTHROPIC_API_KEY : process.env.OPENAI_API_KEY);

  console.log(`[ai/generate] provider=${effectiveProvider} model=${model} hasKey=${!!effectiveApiKey}`);

  if (effectiveApiKey) {
    try {
      const { generateText } = await import('ai');

      let aiModel;
      if (effectiveProvider === 'claude') {
        const { createAnthropic } = await import('@ai-sdk/anthropic');
        const anthropic = createAnthropic({ apiKey: effectiveApiKey });
        const claudeModel = model ?? 'claude-sonnet-4-6';
        console.log(`[ai/generate] using Claude model: ${claudeModel}`);
        aiModel = anthropic(claudeModel);
      } else {
        const { createOpenAI } = await import('@ai-sdk/openai');
        const openaiClient = createOpenAI({ apiKey: effectiveApiKey });
        aiModel = openaiClient(model ?? process.env.AI_MODEL ?? 'gpt-4o');
      }

      // Hard reminder appended to every prompt — model must never forget the format
      const promptWithReminder = `${prompt}\n\n[REMINDER: Respond with a single raw JSON object only. "message" = your conversational reply (no code). "liquid"/"css"/"js" = complete updated files applied silently to the editor.]`;

      const { text } = await generateText({
        model: aiModel,
        system: SYSTEM_PROMPT,
        prompt: promptWithReminder,
        maxOutputTokens: 4000,
      });

      // Strip markdown code fences first
      const noFences = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();

      // Find the balanced JSON object — walk from first "{" counting depth
      // This correctly handles nested "{}" inside Liquid schema strings
      function extractBalancedJson(src: string): string {
        const start = src.indexOf('{');
        if (start === -1) return src;
        let depth = 0;
        let inString = false;
        let escape = false;
        for (let i = start; i < src.length; i++) {
          const ch = src[i];
          if (escape) { escape = false; continue; }
          if (ch === '\\' && inString) { escape = true; continue; }
          if (ch === '"') { inString = !inString; continue; }
          if (inString) continue;
          if (ch === '{') depth++;
          else if (ch === '}') { depth--; if (depth === 0) return src.slice(start, i + 1); }
        }
        return src.slice(start); // malformed — best effort
      }

      const cleaned = extractBalancedJson(noFences);

      // Try to parse as JSON — if the model returned plain text, surface it as a chat message
      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(cleaned);
      } catch (parseErr) {
        console.warn('[ai/generate] JSON.parse failed:', parseErr instanceof Error ? parseErr.message : parseErr);
        console.warn('[ai/generate] cleaned preview (first 300):', cleaned.slice(0, 300));
        await userRepo.incrementAiUsage(session.user.id).catch(() => { /* non-blocking */ });
        return NextResponse.json({
          message: cleaned,
          liquid: null,
          css: null,
          js: null,
        });
      }

      await userRepo.incrementAiUsage(session.user.id).catch(() => { /* non-blocking */ });
      return NextResponse.json({ ...parsed, message: parsed.message ?? 'Component generated successfully!' });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[ai/generate] error:`, err);
      return NextResponse.json({ error: `AI generation failed: ${message}` }, { status: 500 });
    }
  }

  // Scaffold response (no AI key configured)
  await userRepo.incrementAiUsage(session.user.id).catch(() => { /* non-blocking */ });
  const componentName = prompt.split(' ').slice(0, 3).join('-').toLowerCase().replace(/[^a-z0-9-]/g, '');
  return NextResponse.json({
    message: `Scaffolded "${prompt}". Open in Editor to refine the code.`,
    liquid: `{%- comment -%}\n  Component: ${componentName}\n  Generated by Live Code AI\n{%- endcomment -%}\n\n<section class="lf-${componentName}" id="{{ section.id }}">\n  <div class="lf-container">\n    <h2>{{ section.settings.heading }}</h2>\n    <p>{{ section.settings.subheading }}</p>\n  </div>\n</section>\n\n{% schema %}\n{\n  "name": "${componentName}",\n  "settings": [\n    { "type": "text", "id": "heading", "label": "Heading", "default": "Your Heading" },\n    { "type": "textarea", "id": "subheading", "label": "Subheading", "default": "Your subheading text" }\n  ],\n  "presets": [{ "name": "${componentName}" }]\n}\n{% endschema %}`,
    css: `.lf-${componentName} {\n  padding: 4rem 2rem;\n}\n\n.lf-container {\n  max-width: 1200px;\n  margin: 0 auto;\n}\n`,
    js: '',
  });
}
