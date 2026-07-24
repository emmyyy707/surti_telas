from pathlib import Path

# ======================================
# CONFIGURACIÓN
# ======================================

ROOT = Path(__file__).parent

OUTPUT_FILE = ROOT / "PROYECTO_COMPLETO.md"

IGNORE_DIRS = {
    ".git",
    "node_modules",
    "dist",
    "build",
    ".next",
    ".turbo",
    ".idea",
    ".vscode",
    "__pycache__",
    "coverage",
    "Proyecto_MD"
}

VALID_EXTENSIONS = {
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".json",
    ".md",
    ".yaml",
    ".yml",
    ".sql",
    ".css",
    ".scss",
    ".html",
    ".prisma",
    ".graphql",
    ".txt",
    ".xml",
    ".env"
}

LANGUAGE = {
    ".ts": "typescript",
    ".tsx": "tsx",
    ".js": "javascript",
    ".jsx": "jsx",
    ".json": "json",
    ".md": "markdown",
    ".yaml": "yaml",
    ".yml": "yaml",
    ".sql": "sql",
    ".css": "css",
    ".scss": "scss",
    ".html": "html",
    ".prisma": "prisma",
    ".graphql": "graphql",
    ".xml": "xml",
    ".txt": "text",
    ".env": "bash"
}

# ======================================

total = 0

with open(OUTPUT_FILE, "w", encoding="utf-8") as out:

    out.write("# PROYECTO COMPLETO\n\n")
    out.write("Generado automáticamente.\n\n")
    out.write("---\n\n")

    for file in sorted(ROOT.rglob("*")):

        if not file.is_file():
            continue

        if any(part in IGNORE_DIRS for part in file.parts):
            continue

        if (
            file.suffix.lower() not in VALID_EXTENSIONS
            and file.name not in ("Dockerfile", ".gitignore")
        ):
            continue

        try:
            text = file.read_text(encoding="utf-8")
        except:
            try:
                text = file.read_text(encoding="latin1")
            except:
                print("No se pudo leer:", file)
                continue

        language = LANGUAGE.get(file.suffix.lower(), "text")

        if file.name == "Dockerfile":
            language = "docker"

        if file.name == ".gitignore":
            language = "text"

        relative = file.relative_to(ROOT)

        out.write("#" * 80 + "\n")
        out.write(f"# ARCHIVO: {relative}\n")
        out.write("#" * 80 + "\n\n")

        out.write(f"**Ruta:** `{relative}`\n\n")

        out.write(f"```{language}\n")
        out.write(text)
        out.write("\n```\n\n")

        out.write("\n\n")

        total += 1

print("=" * 60)
print("FINALIZADO")
print("=" * 60)
print("Archivos:", total)
print("Salida:", OUTPUT_FILE)