# SurtiTelas

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top level `files` to include the TypeScript files you want to lint:

```js
export default tseslint.config({
  // ...
  files: ['**/*.{ts,tsx}'],
  // ...
})
```

- Replace `tseslint.configs.recommended` with `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // ... existing config
  plugins: {
    // ... existing plugins
    react,
  },
  rules: {
    // ... existing rules
    ...react.configs.recommended.rules,
  },
})
```# software_SurtiTelas-


