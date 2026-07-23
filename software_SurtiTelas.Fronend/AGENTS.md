# SurtiTelas - UTF-8 Encoding Fixed

## Encoding Configuration

This project has been configured with UTF-8 encoding enforcement.

### Files Created/Modified:
- `.editorconfig` - UTF-8 encoding without BOM
- `.vscode/settings.json` - VS Code UTF-8 settings
- `.prettierrc` - Prettier UTF-8 compatible config

### Scripts
- `npm run lint` - Run ESLint
- `npm run build` - Build with TypeScript and Vite

## UTF-8 Fix Summary

215+ files were fixed with the following changes:
- Converted all files to UTF-8 without BOM
- Fixed mojibake characters (ÃƒÂ¡ â†’ á, ÃƒÂ© â†’ é, etc.)
- Fixed replacement character ï¿½ in Spanish text
- Corrected names: Bogotá, Pérez, González, Martínez, López, etc.
- Fixed accented characters: ñ, á, é, í, ó, ú

