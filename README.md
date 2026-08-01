# Lorentasker

Tu panel personal de productividad para organizar el trabajo diario como developer

## Qué incluye

- Resumen diario con tareas, progreso, foco y actividad.
- Planificación semanal y calendario de dos semanas.
- Tareas con proyecto, prioridad, fecha, hora y estado.
- Notas rápidas, proyectos y estadísticas.
- Cuatro temas de color y densidad de interfaz configurable.
- Registro e inicio de sesión completamente locales.
- Datos y preferencias aislados para cada usuario del equipo.
- Perfil editable con fotografía local optimizada.
- Centro de notificaciones y avisos nativos de escritorio.
- Temporizador de concentración con sesiones configurables.
- Proyectos personalizables que se pueden crear, abrir y eliminar.
- Edición completa de tareas y estimaciones de tiempo.
- Copias de seguridad JSON mediante importación y exportación.
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

La plantilla `docs/release-workflow.yml` permite automatizar este proceso. Para activarla, mueve el archivo a `.github/workflows/release.yml` usando una sesión de GitHub con scope `workflow`.

## Privacidad

Las cuentas, tareas y notas se guardan localmente. Las contraseñas se derivan mediante PBKDF2 con SHA-256, 210.000 iteraciones y una salt aleatoria por usuario; nunca se guardan en texto plano. Cada usuario tiene su propio espacio aislado. Lorentasker no incluye analítica ni envía contenido a servidores externos.

Las cuentas no se sincronizan entre dispositivos y desaparecerán si se eliminan los datos locales de la aplicación. Esta autenticación protege la separación cotidiana entre usuarios del mismo equipo, pero no sustituye al cifrado completo del disco frente a alguien con acceso administrativo al sistema.
