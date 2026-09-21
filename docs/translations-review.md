# Translations Review Guide

## Offline Localization with react-i18next
The application now uses `react-i18next` for translation with static font bundles instead of Google Translate.

### Languages Supported
1. English (`en`)
2. Hindi (`hi`)
3. Assamese (`as`)
4. Bengali (`bn`)
5. Meetei Mayek (Manipuri) (`mni`)

## How to Review Translations
1. Open the UI, click the language switcher in the top right.
2. The UI strings will instantly translate.
3. All translations are stored in `frontend/src/locales/en.json` (and `.hi.json`, etc.).
4. The translations for Hindi, Assamese, Bengali, and Manipuri were generated automatically. They need to be reviewed by a human expert.

## Translation Workflow
- Edit the respective JSON files in `frontend/src/locales/` to fix errors.
- New keys added during UI development must be added to all 5 language files.
- Fallback language is English (`en`).
- Fonts are bundled using `@fontsource` packages. The fonts used are:
  - Outfit (English)
  - Noto Sans Devanagari (Hindi)
  - Noto Sans Bengali (Assamese, Bengali)
  - Noto Sans Meetei Mayek (Manipuri)
