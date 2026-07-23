# Dependency Rules — Fase 2.0

## Reglas de Dependencia Permitidas

| Desde | Hacia | Permitido |
|-------|-------|-----------|
| app/ | shared/ | ✅ |
| app/ | features/ | ✅ |
| app/ | infrastructure/ | ✅ |
| features/ | shared/ | ✅ |
| features/ | domain/ | ✅ |
| infrastructure/ | domain/ | ✅ |
| infrastructure/ | shared/ | ✅ |
| domain/ | shared/ | ✅ |

## Reglas de Dependencia Prohibidas

| Desde | Hacia | Prohibido |
|-------|-------|-----------|
| shared/ | features/ | ❌ |
| shared/ | app/ | ❌ |
| shared/ | domain/ | ❌ |
| shared/ | infrastructure/ | ❌ |
| domain/ | app/ | ❌ |
| domain/ | features/ | ❌ |
| domain/ | infrastructure/ | ❌ |
| features/ | features/ | ❌ |
| infrastructure/ | app/ | ❌ |

## Reglas Específicas del Proyecto

1. **UI Components**: Solo pueden vivir en `src/shared/ui/` o `src/features/*/components/ui/`
2. **Contexts**: Solo en `src/app/providers/`
3. **Hooks**: En `src/shared/hooks/` o `src/features/*/hooks/`
4. **Services**: En `src/features/*/services/` o `src/infrastructure/`
5. **Utils**: En `src/shared/utils/`
6. **Types**: En `src/shared/types/`
7. **Config**: En `src/infrastructure/config/`
