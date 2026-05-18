# Uso de IA durante el desarrollo

Este documento describe cómo se utilizó la Inteligencia Artificial en la
construcción de **The Ultimate Parser App**, según lo solicitado por el
curso.

## Herramientas de IA usadas

- **ChatGPT / asistente de IA conversacional:** apoyo en el diseño de la
  arquitectura, redacción de algoritmos de análisis sintáctico y
  documentación.
- **IA integrada en el editor (GitHub Copilot / asistente de VSCode / Claude Code):**
  autocompletado y sugerencias mientras se escribía el código.

## En qué partes se usó IA

- **Generación de código:** estructura del proyecto, esqueleto de FastAPI,
  implementación inicial de los parsers (FIRST/FOLLOW, LL(1), LR(0),
  SLR(1), LR(1), LALR(1)) y los componentes de React.
- **Depuración:** revisión de la construcción de la colección canónica
  LR, de los conjuntos FIRST/FOLLOW y de la fusión de estados LALR(1).
- **Diseño de interfaz:** ideas para el layout de dos columnas, los
  estados visuales (verde/rojo/amarillo) y la organización de los
  componentes.
- **Documentación:** redacción del `README.md`, los comentarios
  explicativos y este archivo.
- **Pruebas:** propuesta de los casos de prueba de `pytest`
  (gramática, FIRST/FOLLOW y LL(1)).
- **Funcionalidades avanzadas (innovación):** diseño del reproductor
  animado del análisis, el diagrama SVG del autómata LR y el panel de
  diagnóstico de la gramática (recursión izquierda, factorización,
  anulables).

## Asistente educativo dentro de la aplicación

La aplicación incluye un **asistente educativo basado en reglas internas**
(`backend/app/utils/explanations.py`). **No usa ninguna API externa de IA.**
Genera explicaciones en lenguaje natural a partir de reglas simples:

- Por qué una cadena fue aceptada o rechazada.
- Qué significa un conflicto shift/reduce o reduce/reduce.
- Qué revisar si una gramática no es LL(1) (recursión izquierda,
  factorización izquierda, conflictos FIRST/FOLLOW).
- Qué revisar ante conflictos LR (ambigüedad, precedencia y
  asociatividad de operadores).

Esto mantiene la aplicación totalmente offline, predecible y reproducible
para fines educativos.

## Revisión humana

Todo el código generado con apoyo de IA fue **revisado, probado y ajustado
manualmente**. Las pruebas automáticas (`pytest`) y verificaciones manuales
de los seis algoritmos confirman el comportamiento esperado.
