const flags: Record<string, boolean> = {
  finanzas: true,
  reportes_unificados: true,
  domiciliarios_validacion_extendida: false,
};

export function useFeatureFlag(key: string): boolean {
  return flags[key] ?? false;
}

export function setFeatureFlag(key: string, value: boolean): void {
  flags[key] = value;
}
