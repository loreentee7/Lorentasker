# Lorentasker

Tu panel personal de productividad para organizar el trabajo diario como developer en SZENDEX.

## Qué incluye

- Resumen diario con tareas, progreso, foco y actividad.
- Planificación semanal y calendario de dos semanas.
- Tareas con proyecto, prioridad, fecha, hora y estado.
- Notas rápidas, proyectos y estadísticas.
- Cuatro temas de color y densidad de interfaz configurable.
- Persistencia privada en el equipo mediante almacenamiento local.
- Aplicación Electron instalable en Windows.
- Botón **Buscar actualizaciones** conectado a GitHub Releases.

## Desarrollo

```bash
npm install
npm run dev
```

## Crear el instalador de Windows

```bash
npm run dist:win
```

El resultado se genera en `release/Lorentasker-Setup-<versión>.exe`.

## Actualizaciones

`electron-updater` consulta las releases del repositorio `loreentee7/Lorentasker`. Cada release debe incluir el instalador, su `.blockmap` y `latest.yml`, que `electron-builder` genera automáticamente.

Para repositorios privados, inicia la app con `GH_TOKEN` o `GITHUB_TOKEN` disponible en el entorno. El token nunca debe guardarse en el repositorio. Para una app personal instalada, se puede obtener desde una sesión de GitHub CLI o usar un token de solo lectura.

## Publicar una versión

1. Incrementa `version` en `package.json`.
2. Crea el instalador en Windows o con un runner Windows de GitHub Actions.
3. Publica los artefactos como una release con tag `v<versión>`.
4. Lorentasker detectará, descargará e instalará la nueva versión desde **Ajustes → Buscar actualizaciones**.

## Privacidad

Las tareas y notas se guardan localmente. Lorentasker no incluye analítica ni envía contenido a servidores externos.
