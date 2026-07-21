# CardioScore

Calculadora web **gratuita** de riesgo cardiovascular para cardiólogos de Venezuela, creada por
[MatsonSoft](https://matsonsoft.com) en colaboración con el **Postgrado de Cardiología**
(Hospital Ruiz y Páez, Ciudad Bolívar).

**Producción:** [cardioscore.matsonsoft.com](https://cardioscore.matsonsoft.com)

## Usar

Abra `cardioscore.html` en cualquier navegador (doble clic, sin instalación ni build). Solo necesita internet para los CDN de Tailwind, Chart.js y la fuente Inter.

## Características

- **Riesgo CV a 10 años** (PREVENT: ECV total + hospitalización por IC), banda de riesgo con gauge visual y umbrales ESC (5/10/20%).
- **TFG por CKD-EPI 2021**, metas de LDL según criterio clínico y % de reducción necesario.
- **Modulación por Lp(a)** del riesgo de infarto, con gráfico comparativo.
- **Informe PDF de 1 página (carta)**, diseñado para impresión en **blanco y negro**: gauge B/N, alertas críticas, condiciones, firma y sello.
- **Copiar resumen** al portapapeles (para pegar en HIS/EMR), con fallback para `file://`.
- **Responsive**: layout de 2 columnas en desktop, formulario optimizado en móvil (anti-zoom iOS, targets táctiles 44px, acordeón exclusivo).
- **Accesibilidad**: ARIA en gauge/errores/modal, navegación por teclado, tooltips de ayuda junto a cada campo, `prefers-reduced-motion`.
- **Privacidad**: sin `localStorage`, sin backend; nada se guarda. Los campos *Nombre del Paciente* y *Médico Tratante* son **opcionales**, solo se usan para imprimir el PDF y se borran con **Limpiar**.

## Datos de entrada

- **Obligatorios (11):** edad, sexo, tabaquismo, PAS, peso, estatura, colesterol total, HDL, LDL, Lp(a), creatinina.
- **Opcionales (4):** triglicéridos, ACR, glicemia, HbA1c (si se llenan, se validan en rango; TG/ACR son de visualización y glicemia/HbA1c solo alimentan alertas críticas).
- **Comorbilidades:** 7 selects opcionales (SCA, EVA, DM, ERC, HF, afectación subclínica, fragilidad) que definen el criterio de meta LDL.

El formulario trae **valores de ejemplo** (`value="..."`) para que el cálculo corra al cargar. Para partir en blanco, bórralos en el HTML.

## Metodología

> ⚠ **Advertencia de credibilidad:** El modelo es una **base lineal calibrada** inspirada en los factores del PCE 2013 y de SCORE2 (guías ESC 2021), adaptada a población local. **NO es la ecuación oficial SCORE2.** La TFG usa la ecuación **CKD-EPI 2021**. Cualquier uso clínico debe validarse localmente.

Los coeficientes están documentados en la constante `MODEL` dentro del archivo HTML. Los umbrales de riesgo y metas de LDL siguen las guías ESC 2021.

## Estructura del código

Todo está en `cardioscore.html` (un solo archivo, HTML + CSS + JS). El JS se divide en funciones pequeñas y documentadas:

- **Entrada y control**
  - `updateDerivedMetrics()` — calcula No-HDL e IMC en vivo.
  - `RANGES` / `OPTIONAL` — rangos válidos y campos no obligatorios.
  - `validar()` / `validarCampo()` — validación cruzada del formulario.
  - `bandaRiesgo()` — clasifica el riesgo en bandas (ESC 2021).
- **Modelo (sin DOM, lo más importante para contribuir)**
  - `MODEL` — **constante con todos los coeficientes**. Para ajustar el modelo, edita aquí y documenta la fuente (guía/estudio).
  - `leerEntradas()` — reúne los inputs en un objeto.
  - `calcularRiesgo(i)` — cálculo puro; devuelve todos los resultados.
- **Salida y orquestación**
  - `renderResultados(r)` — escribe resultados en la interfaz (web + PDF).
  - `ejecutarCalculos()` — orquesta: valida → lee → calcula → renderiza → grafica.
- **UX**
  - `limpiar()`, `copiarResumen()`, `exportarPDF()`, `recalcLive()` (solo recalcula si ya hay resultados visibles), tooltips inline con `cerrarBurbujas()`.

> Cambiar cualquier coeficiente de `MODEL` o umbral de riesgo requiere revisión clínica del Postgrado de Cardiología (ver CONTRIBUTING.md).

## Licencia

[CC BY-NC-SA 4.0](LICENSE): modifique libremente, **no use con fines comerciales**, comparta bajo la misma licencia y mantenga la atribución.

## Contribuir

Lea [CONTRIBUTING.md](CONTRIBUTING.md). Todo cambio al modelo requiere revisión clínica del Postgrado de Cardiología.
