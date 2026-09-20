# Translations Review

**Part L: Multilingual Support — First-Draft Translation Notes**

> This document tracks all locale keys, their English source strings, and first-draft translations for human review.  
> All translations are machine-assisted first drafts and **must** be reviewed by a fluent native speaker before production use.

---

## Coverage

| Language | Code | Script | Status |
|---|---|---|---|
| English | `en` | Latin | ✅ Source of truth |
| Hindi | `hi` | Devanagari | ⚠️ Machine-assisted — needs review |
| Assamese | `as` | Bengali (Assamese variant) | ⚠️ Machine-assisted — needs review |
| Meitei (Manipuri) | `mni` | Bengali (Meitei Mayek not yet encoded in web fonts, Bengali used as fallback) | ⚠️ Machine-assisted — needs review |

---

## Key Design Decisions

1. **Logic values not translated**: `risk_level` values (`Low`, `Moderate`, `High`) passed to the backend are never translated. Only display labels (e.g., `t('low', 'Low')`) are used for user-facing text.
2. **Inline fallbacks**: Every `t(key, defaultValue)` call includes an English fallback so the UI never shows a raw key even if the locale file is incomplete.
3. **Language persisted**: Selected language is stored in `localStorage` under the key `app_language` and applied before first render.
4. **Font switching**: Body fonts switch automatically via Tailwind classes on `document.body`:
   - `hi` → Noto Sans Devanagari
   - `as` → Noto Sans Bengali  
   - `mni` → Noto Sans Bengali (Meetei Mayek fallback pending web font support)

---

## Risk/Disclaimer Wording

> The following strings are clinically sensitive and must be reviewed by a medical professional in addition to a language reviewer:

| Key | English Source |
|---|---|
| `consent_not_diag_body2` | A high risk result indicates clinical evaluation is recommended, not that you definitely have OA. |
| `capture_review_note` | Symmetry and angles are measured from a single-side 2D view and are indicative only. This is a screening aid, not a diagnosis. |
| `consent_voluntary_body` | You may stop the screening at any time without penalty. |

---

## Strings Requiring Native Speaker Review

### Hindi (`hi`)

| Key | English | Hindi (Draft) | Review Notes |
|---|---|---|---|
| `consent_not_diag_body2` | ...clinical evaluation is recommended... | ...नैदानिक मूल्यांकन की सिफारिश की जाती है... | Clinical terminology — verify with medical Hindi speaker |
| `consent_privacy_title` | 3. Data Privacy (HIPAA Ready) | 3. डेटा गोपनीयता (HIPAA तैयार) | HIPAA is US regulation — confirm appropriate for Indian context |
| `capture_instruction_idle` | Ask patient to walk. Tap to begin countdown. | रोगी को चलने के लिए कहें। काउंटडाउन शुरू करने के लिए टैप करें। | Verify "काउंटडाउन" is appropriate vs. a native term |

### Assamese (`as`)

| Key | English | Assamese (Draft) | Review Notes |
|---|---|---|---|
| All keys | — | — | Full review required by Assamese-fluent healthcare professional |
| `informed_consent` | Informed Consent | অৱহিত সন্মতি | Verify preferred legal term in Assamese |
| `consent_voluntary_title` | 4. Voluntary | ৪. ঐচ্ছিক | Confirm "ঐচ্ছিক" is understood in rural Assam context |

### Meitei / Manipuri (`mni`)

| Key | English | Meitei (Draft) | Review Notes |
|---|---|---|---|
| All keys | — | — | Full review required — current translations are transliterations into Bengali script pending Meetei Mayek font availability |
| Script | Bengali script used as fallback | Meetei Mayek preferred | Upgrade to Meetei Mayek script when `Noto Sans Meetei Mayek` is confirmed loaded |

---

## Missing / Deferred Keys

- Audio guide functionality (`audio_guide` button) is UI-only and does not yet trigger TTS. Implement TTS in a future phase.
- Questionnaire answer options (e.g., pain scale labels, Yes/No for functional items) are translated via inline `t()` calls in their respective component files.

---

## How to Add a New Language

1. Create `frontend/src/locales/<lang-code>.json` with all keys from `en.json`.
2. Add the import and resource to `frontend/src/i18n.ts`.
3. Add the language option to the switcher in `HealthWorkerLayout.tsx` / `Login.tsx`.
4. Add a Tailwind font class for the new script in `App.tsx`'s `updateBodyFont()` function.
5. Bundle any required web font in `public/fonts/` and declare it in `index.css`.
