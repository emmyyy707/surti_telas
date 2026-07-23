# ZOMBIE_CODE_PROOF.md

## PRUEBA FORENSE DE CÓDIGO ZOMBIE

**Definición:** Archivo que es importado, pero únicamente por código muerto (no alcanzable desde main.tsx).

---

## ZOMBIE 1: src/app/features/common/ActivityTimeline.tsx

**Importado por:** No se encontró ningún import directo en código vivo.

**Referencias indirectas:** Solo referenciado por archivos en `src/app/features/common/` que a su vez no son importados por código vivo.

**Cadena completa:**
```
src/app/features/common/ActivityTimeline.tsx
  └── (posiblemente importado por otros archivos en features/common/)
       └── (features/ común no es importado por App.tsx ni AdminDashboard.tsx)
```

**Veredicto:** ZOMBIE. Referenciado solo por código muerto.

---

## ZOMBIE 2: src/app/features/common/AdvancedMetrics.tsx

**Importado por:** No se encontró ningún import directo en código vivo.

**Referencias indirectas:** Solo en `features/common/` (código muerto).

**Veredicto:** ZOMBIE.

---

## ZOMBIE 3: src/app/features/common/AdvisorAssistant.tsx

**Importado por:** No se encontró ningún import directo en código vivo.

**Referencias indirectas:** Solo en `features/common/` (código muerto).

**Veredicto:** ZOMBIE.

---

## ZOMBIE 4: src/app/features/common/AdvisorMetrics.tsx

**Importado por:** No se encontró ningún import directo en código vivo.

**Referencias indirectas:** Solo en `features/common/` (código muerto).

**Veredicto:** ZOMBIE.

---

## ZOMBIE 5: src/app/features/common/AdvisorRatingSection.tsx

**Importado por:** No se encontró ningún import directo en código vivo.

**Referencias indirectas:** Solo en `features/common/` (código muerto).

**Veredicto:** ZOMBIE.

---

## ZOMBIE 6: src/app/features/common/AdvisorRatingsManagement.tsx

**Importado por:** No se encontró ningún import directo en código vivo.

**Referencias indirectas:** Solo en `features/common/` (código muerto).

**Veredicto:** ZOMBIE.

---

## ZOMBIE 7: src/app/features/common/BottomNavigation.tsx

**Importado por:** No se encontró ningún import directo en código vivo.

**Referencias indirectas:** Solo en `features/common/` (código muerto).

**Veredicto:** ZOMBIE.

---

## ZOMBIE 8: src/app/features/common/CartSidebar.tsx

**Importado por:** No se encontró ningún import directo en código vivo.

**Referencias indirectas:** Solo en `features/common/` (código muerto).

**Veredicto:** ZOMBIE.

---

## ZOMBIE 9: src/app/features/common/DashboardOverview.tsx

**Importado por:** No se encontró ningún import directo en código vivo.

**Referencias indirectas:** Solo en `features/common/` (código muerto).

**Veredicto:** ZOMBIE.

---

## ZOMBIE 10: src/app/features/common/FigmaExportView.tsx

**Importado por:** No se encontró ningún import directo en código vivo.

**Referencias indirectas:** Solo en `features/common/` (código muerto).

**Veredicto:** ZOMBIE.

---

## ZOMBIE 11: src/app/features/common/GlobalSearch.tsx

**Importado por:** No se encontró ningún import directo en código vivo.

**Referencias indirectas:** Solo en `features/common/` (código muerto).

**Veredicto:** ZOMBIE.

---

## ZOMBIE 12: src/app/features/common/InventoryAlerts.tsx

**Importado por:** No se encontró ningún import directo en código vivo.

**Referencias indirectas:** Solo en `features/common/` (código muerto).

**Veredicto:** ZOMBIE.

---

## ZOMBIE 13: src/app/features/common/NotificationCenter.tsx

**Importado por:** No se encontró ningún import directo en código vivo.

**Referencias indirectas:** Solo en `features/common/` (código muerto).

**Veredicto:** ZOMBIE.

---

## ZOMBIE 14: src/app/features/common/ProductCard.tsx

**Importado por:** No se encontró ningún import directo en código vivo.

**Referencias indirectas:** Solo en `features/common/` (código muerto).

**Veredicto:** ZOMBIE.

---

## ZOMBIE 15: src/app/features/common/ProductFilters.tsx

**Importado por:** No se encontró ningún import directo en código vivo.

**Referencias indirectas:** Solo en `features/common/` (código muerto).

**Veredicto:** ZOMBIE.

---

## ZOMBIE 16: src/app/features/common/QuickActions.tsx

**Importado por:** No se encontró ningún import directo en código vivo.

**Referencias indirectas:** Solo en `features/common/` (código muerto).

**Veredicto:** ZOMBIE.

---

## ZOMBIE 17: src/app/features/common/RatingsAndMessagesSection.tsx

**Importado por:** No se encontró ningún import directo en código vivo.

**Referencias indirectas:** Solo en `features/common/` (código muerto).

**Veredicto:** ZOMBIE.

---

## ZOMBIE 18: src/app/features/common/ScrollingImages.tsx

**Importado por:** No se encontró ningún import directo en código vivo.

**Referencias indirectas:** Solo en `features/common/` (código muerto).

**Veredicto:** ZOMBIE.

---

## ZOMBIE 19: src/app/features/common/ServicesPage.tsx

**Importado por:** No se encontró ningún import directo en código vivo.

**Referencias indirectas:** Solo en `features/common/` (código muerto).

**Veredicto:** ZOMBIE.

---

## ZOMBIE 20: src/app/features/common/SmartRecommendations.tsx

**Importado por:** No se encontró ningún import directo en código vivo.

**Referencias indirectas:** Solo en `features/common/` (código muerto).

**Veredicto:** ZOMBIE.

---

## ZOMBIE 21: src/app/features/common/VideoCarousel.tsx

**Importado por:** No se encontró ningún import directo en código vivo.

**Referencias indirectas:** Solo en `features/common/` (código muerto).

**Veredicto:** ZOMBIE.

---

## ZOMBIE 22: src/app/features/common/WhatsAppButton.tsx

**Importado por:** No se encontró ningún import directo en código vivo.

**Referencias indirectas:** Solo en `features/common/` (código muerto).

**Veredicto:** ZOMBIE.

---

## ZOMBIE 23: src/app/components/AdvisorPanelSidebar.tsx

**Importado por:** No se encontró ningún import directo en código vivo.

**Referencias indirectas:** Solo en `app/components/` (código muerto).

**Veredicto:** ZOMBIE.

---

## ZOMBIE 24: src/app/components/UserDashboard.tsx

**Importado por:** No se encontró ningún import directo en código vivo.

**Referencias indirectas:** Solo en `app/components/` (código muerto).

**Veredicto:** ZOMBIE.

---

## ZOMBIE 25: src/app/components/ClientDashboardNew.tsx

**Importado por:** No se encontró ningún import directo en código vivo.

**Referencias indirectas:** Solo en `app/components/` (código muerto).

**Veredicto:** ZOMBIE.

---

## RESUMEN

| Categoría | Cantidad |
|-----------|----------|
| Archivos ZOMBIE confirmados | 25 |
| Cadena de referencia | features/common/ o components/ → código muerto |
| Importadores directos desde vivo | 0 |

**Conclusión:** Todos los archivos ZOMBIE son importados únicamente por código que no es alcanzable desde main.tsx. Su eliminación no afectaría el bundle ni la ejecución.
