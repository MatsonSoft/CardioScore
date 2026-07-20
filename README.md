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

Todo está en `calculadora_riesgo_modificada.html` (un solo archivo, HTML + CSS + JS).
El JS se divide en funciones pequeñas y documentadas:

- **Entrada y control**
  - `updateDerivedMetrics()` — calcula No-HDL e IMC en vivo.
  - `RANGES` — rangos `[min, max]` válidos de cada input (usados en validación).
  - `validar()` / `validarCampo()` — validación cruzada del formulario.
  - `bandaRiesgo()` — clasifica el riesgo en bandas (ESC 2021).
- **Modelo (sin DOM, lo más importante para contribuir)**
  - `MODEL` — **constante con todos los coeficientes**. Para ajustar el modelo,
    edita aquí y documenta la fuente (guía/estudio).
  - `leerEntradas()` — reúne los inputs en un objeto.
  - `calcularRiesgo(i)` — cálculo puro; devuelve todos los resultados.
- **Salida y orquestación**
  - `renderResultados(r)` — escribe resultados en la interfaz (web + impresión).
  - `ejecutarCalculos()` — orquesta: valida → lee → calcula → renderiza → grafica.
- **UX**
  - `limpiar()`, `showTip()`, `copiarResumen()`, `exportarPDF()`, `recalcLive()`.

El formulario trae **valores de ejemplo** (`value="..."`) para que el cálculo corra al
cargar la página. Para partir de un formulario en blanco, bórralos en el HTML.

> Cambiar cualquier coeficiente de `MODEL` o umbral de riesgo requiere revisión
> clínica del Postgrado de Cardiología (ver CONTRIBUTING.md).

## Licencia

[CC BY-NC-SA 4.0](LICENSE): modifique libremente, **no use con fines comerciales**,
comparta bajo la misma licencia, y mantenga la atribución a la alianza.

## Contribuir

Lea [CONTRIBUTING.md](CONTRIBUTING.md). Todo cambio al modelo requiere revisión
clínica del Postgrado de Cardiología.
