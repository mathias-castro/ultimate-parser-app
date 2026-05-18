# The Ultimate Parser App

Aplicación educativa para el curso **Compiladores CS3402**. Permite ingresar
una gramática libre de contexto y una cadena, elegir un método de análisis
sintáctico y ver el proceso paso a paso, las tablas, los estados del autómata
y una explicación en lenguaje natural.

## 1. Objetivo

Ayudar a estudiantes a entender y comparar distintos algoritmos de análisis
sintáctico (top-down y bottom-up) mediante visualizaciones y explicaciones
generadas por reglas internas (sin APIs externas).

## 2. Tecnologías

- **Backend:** Python 3.11, FastAPI, Uvicorn, Pydantic, Pytest.
- **Frontend:** React, TypeScript, Vite, CSS propio.
- **Contenedores:** Docker y Docker Compose.

## 3. Arquitectura

```
ultimate-parser-app/
  backend/   FastAPI. Capas: api -> services -> parsers/domain/utils
  frontend/  React + TypeScript (Vite). API en un hook, componentes pequeños.
  docker-compose.yml  Levanta backend y frontend juntos.
```

- El backend separa **rutas** (`api/routes.py`), **servicios**
  (`services/parser_service.py`), **dominio** (`domain/`), **parsers**
  (`parsers/`) y **utilidades** (`utils/`). No hay lógica de parsing en
  `main.py` ni en `routes.py`.
- El frontend mantiene la lógica de red en `hooks/useParser.ts` y
  componentes pequeños y reutilizables.

## 4. Levantar todo con Docker

```bash
docker compose up --build
```

## 5. URLs

- Frontend: [https://ultimate-parser-jr2lxxtsb-mathias-projects-3ddf2545.vercel.app](https://ultimate-parser-jr2lxxtsb-mathias-projects-3ddf2545.vercel.app)
- Backend: [http://localhost:8000](https://ultimate-parser-app.onrender.com)

## 5.1 Funcionalidades didácticas destacadas

- **Animación del análisis:** reproductor paso a paso (play/pausa/anterior/
  siguiente/scrub) que visualiza la pila, los símbolos y la entrada.
- **Árbol sintáctico:** visualización jerárquica del AST generado por el
  parser, con distinción visual entre terminales y no terminales.
- **Diagrama del autómata LR:** grafo SVG interactivo de estados y
  transiciones (con vista alterna de tabla y lista de items).
- **Diagnóstico de la gramática:** detecta recursión por la izquierda,
  prefijos comunes (factorización) y no terminales anulables.
- **Navegación por pestañas** y **explicación pedagógica** generada por
  reglas internas (sin APIs externas).
- **Leyenda de producciones** para interpretar las tablas ACTION/GOTO.

## 6. Backend sin Docker

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## 7. Frontend sin Docker

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0
```

## 8. Correr las pruebas

```bash
cd backend
pytest
```

## 9. Cómo escribir gramáticas

- Una producción (lado izquierdo) por línea.
- `->` separa lado izquierdo y derecho.
- `|` separa alternativas.
- Los símbolos se separan por espacios.
- `epsilon` representa la cadena vacía (ε).
- `$` es el fin de entrada (se agrega solo si no lo escribes).
- El símbolo inicial es el lado izquierdo de la primera producción.
- Los no terminales son los símbolos que aparecen a la izquierda de `->`.
- Los terminales son el resto (excepto `epsilon`).

Ejemplo:

```
E -> T E'
E' -> + T E' | epsilon
T -> F T'
T' -> * F T' | epsilon
F -> ( E ) | id
```

## 10. Algoritmos implementados

| Tipo        | Algoritmo          | Clave (`algorithm`)  |
|-------------|--------------------|----------------------|
| Top-down    | Descenso recursivo | `RECURSIVE_DESCENT`  |
| Top-down    | LL(1) predictivo   | `LL1`                |
| Bottom-up   | LR(0)              | `LR0`                |
| Bottom-up   | SLR(1)             | `SLR1`               |
| Bottom-up   | LR(1) canónico     | `LR1`                |
| Bottom-up   | LALR(1)            | `LALR1`              |

Cada parser muestra el proceso paso a paso, construye las tablas que
correspondan, valida la cadena y reporta conflictos.

## 11. Ejemplos de uso

- **LL(1)** con la gramática de expresiones: `id + id * id` se acepta;
  `id + * id` se rechaza.
- **SLR(1)** con `S -> C C` / `C -> c C | d`: `c d d` se acepta.
- **LR(0)** con la gramática de expresiones con recursión izquierda:
  muestra conflictos (no es LR(0)).

Hay archivos listos en la carpeta `examples/`.

## 12. Limitaciones conocidas

- El **descenso recursivo** es genérico: se genera automáticamente desde
  la tabla LL(1) y funciona con **cualquier gramática LL(1)**. Si la
  gramática tiene recursión por la izquierda o no está factorizada, lo
  explica claramente (es una limitación teórica de la técnica, no de la
  implementación).
- El **tokenizador** reconoce los terminales con *maximal munch*, así que
  la cadena se puede escribir **con o sin espacios** (`id+id*id` o
  `id + id * id`). Si un fragmento no coincide con ningún terminal, el
  error indica la posición exacta.
- No hay recuperación de errores: el análisis se detiene en el primer
  error (se reporta con el paso donde falló).
- Las gramáticas con recursión por la izquierda no son LL(1)/LR(0)
  (comportamiento esperado: se reportan los conflictos).
- LR(1) puede generar muchos estados en gramáticas grandes (sin límite
  de tiempo); LALR(1) los compacta.
- La aplicación es local y educativa: no usa base de datos, login ni
  servicios externos.
