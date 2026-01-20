# Servidor Turistik MCP

## Descripción general

Este proyecto implementa un **servidor MCP (Model Context Protocol)** cuyo objetivo es **modularizar y estandarizar la integración entre agentes basados en LLMs y sistemas externos**.

En términos simples, el servidor MCP actúa como un **protocolo de comunicación** entre:
- APIs de modelos de lenguaje (OpenAI, Claude, Gemini, Mistral, entre otros)
- Agentes LLM
- Servicios externos (bases de datos, APIs internas, sistemas legacy, frontends)

El enfoque del proyecto es **trabajar a nivel framework**, abstraer la complejidad de integración y permitir que el **lenguaje natural funcione como una capa de orquestación de alto nivel**.

---

## Estructura del proyecto

El repositorio se organiza en tres carpetas principales:

### `server/`

Contiene la implementación del **servidor MCP**.

- Entorno **Node.js + TypeScript**, con compilación a JavaScript para desarrollo y despliegue en producción.
- `src/index.ts` es el punto de entrada principal.  
  En este archivo se registran tools, recursos UI y endpoints HTTP/SSE.
- En desarrollo local, el servidor corre por **STDIO** y también levanta HTTP con **SSE**.
- El servidor inyecta el widget de tours desde `front/teleferico_tours/dist` como recurso `ui://widget/carrusel_tours.html`.
- En `package.json` se encuentran los scripts para:
  - Compilación a JavaScript
  - Ejecución en desarrollo
  - Otros comandos auxiliares

#### Testing del servidor

Para testear el servidor MCP se utiliza **MCP Inspector**:

1. Ubicarse en el directorio `server/`
2. Ejecutar:
   ```bash
   npx @modelcontextprotocol/inspector
   ```
3. El servidor abrirá un puerto STDIO y el Inspector renderizará automáticamente la interfaz de administración en el navegador.

#### `server/services/`

Incluye:
- Helpers
- Funciones reutilizables
- Conexiones a bases de datos (SQL)
- Integraciones con APIs externas (WooCommerce, OzyPark)
- Tests asociados

---

### `agents/` (en desarrollo)

Define la **capa de agentes LLM** y su interacción con el servidor MCP.

- Implementado en **TypeScript**
- Define cómo los agentes:
  - Reciben contexto estructurado
  - Organizan información en distintos niveles
  - Seleccionan el modelo LLM (GPT-4o-mini, GPT-5-mini)
  - Envían un JSON estructurado
  - Reciben un JSON de respuesta con múltiples campos y subcategorías

#### Componentes principales

- `agents/src/main.ts`  
  Punto de entrada de ejecuci?n local.  
  Lee el prompt desde consola, arma contexto con historial SQL y ejecuta el agente correspondiente.

- `agents/src/tour_agents/` y `agents/src/parquemet_agents/`  
  Implementan los agentes de Turismo y ParqueMet.  
  Usan `hostedMcpTool` para consultar tools del servidor MCP (Woo, Telef?rico, Cupos).

- `agents/prompting/`  
  Contiene helpers orientados a:
  - Modularizar la creaci?n de prompts
  - Facilitar la experimentaci?n
  - Reutilizar piezas comunes (fecha, saludos, logs)

---

### `front/` (en desarrollo)

Contiene **templates de frontend** para el servidor MCP.

- Cada carpeta representa un proyecto React independiente.
- Para crear un nuevo template:
  1. Crear un proyecto React
  2. Adaptarlo a la estructura requerida por el cliente de ChatIA elegido
  3. Ejecutar:
     ```bash
     npm run build
     ```
  4. Tomar el archivo JavaScript compilado
  5. Ubicarlo en el directorio configurado dentro del servidor MCP

- Actualmente se usa `front/teleferico_tours` (Vite + React) y se sirve como widget desde el servidor.

---

## Testing de agentes y exposición del servidor

Para testear el funcionamiento de los agentes:

1. Se levanta el servidor MCP en local con:
   ```bash
   npm run dev
   ```
2. Se expone el servidor utilizando **Ngrok**  
   (esto permite evitar restricciones habituales de red, TLS o políticas de seguridad de algunas APIs de LLM)
3. Se utiliza el endpoint SSE del servidor: `https://<ngrok>/mcp`
4. En `agents/src/tour_agents/tour_agents.ts` y `agents/src/parquemet_agents/parquemet_agents.ts` se configura `link_ngrok`:
   ```ts
   const link_ngrok = "https://<ngrok>/mcp";
   ```
5. Ejecutar:
   ```bash
   npm run dev
   ```
6. El sistema:
   - Inicializa el agente
   - Lee las tools expuestas por el servidor MCP
   - Opera a un nivel funcional básico

---

## Consideraciones importantes

- Muchos SDKs relacionados con MCP y agentes LLM **aún no se encuentran en versiones estables**.
- Es frecuente encontrar:
  - Cambios de nombre en funciones
  - Deprecaciones
  - Breaking changes entre versiones

En la mayoría de los casos observados hasta ahora, las actualizaciones implican **adaptar llamadas a funciones actualizadas**, sin modificar la lógica de negocio.  
Sin embargo, algunos cambios pueden impactar en:
- Tipos
- Ciclo de vida del servidor o del agente
- Transporte o serialización

La intención del enfoque MCP es que, a medida que el ecosistema madure, estos cambios queden encapsulados en capas profundas y **no afecten la arquitectura general del sistema**.

---

## Visión del proyecto

El servidor MCP propone un **modelo de comunicación estandarizado** entre aplicaciones y APIs de modelos de lenguaje.

Opera como framework en **lenguajes de alto nivel con fuerte ecosistema de SDKs**, principalmente:
- **Python**
- **Java**
- **Ecosistema Microsoft (.NET / C#)**

El foco del proyecto no está en un lenguaje específico, sino en **las abstracciones** que permiten que agentes, contexto y sistemas externos interactúen de forma consistente, independientemente de la tecnología subyacente.

---

## Próximos pasos

Completar prompts y tools de ParqueMet (funicular, parque aventura, buses) y mejorar filtros de WooCommerce para tours.

---

## Onboarding y continuidad del proyecto  
*(por si me voy a la guerra del pacífico, me da un infarto o este proyecto cambia de manos)*


### Conocimientos técnicos recomendados

- **Node.js (básico–intermedio)**
- **TypeScript**
- **Bases de datos (SQL y nociones de NoSQL)**
- **Consumo de APIs y JSON estructurado**

### Habilidades clave

- **Pensamiento modular**
- **Capacidad de abstracción**
- **Adaptabilidad a cambios de SDKs y APIs**
- **Capacidad de moverse entre lenguajes**

---

## Notas finales

Este proyecto debe entenderse como un protocolo de comunicación, en donde la estructura y el orden
son claves para el correcto funcionamiento del servidor MCP.


El valor principal no está en una implementación específica ni en un SDK puntual, sino en **la arquitectura, las abstracciones y el criterio aplicado al diseño de agentes y contextos**.
