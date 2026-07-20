# Calculadora de Riesgo Cardiovascular

Calculadora web **gratuita** para cardiólogos, en alianza entre
[MatsonSoft](https://matsonsoft.com) y el **Postgrado de Cardiología**
(Hospital Ruiz y Páez, Venezuela).

## Usar

Abra `calculadora_riesgo_modificada.html` en cualquier navegador. No requiere
instalación ni conexión a un servidor propio (solo los CDN de Tailwind y Chart.js).
No se guardan datos del paciente.

## Metodología

> ⚠ **Advertencia de credibilidad:** El modelo es una **base lineal calibrada**
> inspirada en los factores del PCE 2013 y de SCORE2 (guías ESC 2021), adaptada a
> población local. **NO es la ecuación oficial SCORE2.** La TFG usa la ecuación
> **CKD-EPI 2021**. Cualquier uso clínico debe validarse localmente.

Los coeficientes están documentados en la constante `MODEL` dentro del archivo
HTML. Los umbrales de riesgo y metas de LDL siguen las guías ESC 2021 / SCORE2.

## Estructura del código

- `leerEntradas()` — lee el formulario.
- `calcularRiesgo(i)` — cálculo puro (sin DOM), devuelve todos los resultados.
- `renderResultados(r)` — escribe resultados en la interfaz.
- `ejecutarCalculos()` — orquesta validación → cálculo → render.

## Licencia

[CC BY-NC-SA 4.0](LICENSE): modifique libremente, **no use con fines comerciales**,
comparta bajo la misma licencia, y mantenga la atribución a la alianza.

## Contribuir

Lea [CONTRIBUTING.md](CONTRIBUTING.md). Todo cambio al modelo requiere revisión
clínica del Postgrado de Cardiología.
