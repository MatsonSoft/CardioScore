# Cómo contribuir

Gracias por tu interés en mejorar CardioScore.

## Regla de oro: revisión clínica obligatoria

Cualquier cambio que afecte el **modelo de cálculo** (coeficientes en `MODEL`, umbrales de riesgo, metas de LDL, fórmula de TFG) debe ser revisado y aprobado por un miembro del **Postgrado de Cardiología** antes de fusionarse. Esto incluye:

- Modificar `MODEL` o las funciones `calcularRiesgo` / `bandaRiesgo`.
- Cambiar rangos de entrada (`RANGES`).
- Alterar textos de alertas críticas o metas terapéuticas.

Los cambios puramente de interfaz (HTML/CSS, accesibilidad, traducciones, PDF) no requieren revisión clínica, pero sí pasar la validación de la PR.

## Flujo

1. Haga un fork del repositorio.
2. Cree una rama: `git checkout -b mejora/lo-que-haga`.
3. Haga sus cambios en `cardioscore.html`.
4. Verifique que el HTML/JS no tenga errores de sintaxis.
5. Abra un Pull Request describiendo el cambio y, si toca el modelo, nombre al revisor clínico.
6. Espere la aprobación (revisión de código + revisión clínica si aplica).

## Estándares

- Mantenga el archivo como HTML estático autocontenido (Tailwind + Chart.js por CDN).
- No introduzca dependencias nuevas sin consenso.
- Comente los coeficientes con su fuente (guía/estudio).
- No guarde datos del paciente (no hay `localStorage` a propósito).

## Divulgación

Si encuentra un error clínico o de cálculo, abra un Issue marcado `bug-clinico`.
