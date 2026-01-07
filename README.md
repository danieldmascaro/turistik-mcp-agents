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
- `index.ts` es el punto de entrada principal.  
  En este archivo se documentan decisiones de implementación y se levanta el servidor utilizando el SDK de MCP Servers.
- En desarrollo local, el servidor se ejecuta mediante un **transporte STDIO**, lo que facilita el testing sin depender de infraestructura externa.
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
- Conexiones a bases de datos
- Integraciones con APIs externas
- Tests asociados

---

### `agents/` (en desarrollo)

Define la **capa de agentes LLM** y su interacción con el servidor MCP.

- Implementado en **TypeScript**
- Define cómo los agentes:
  - Reciben contexto estructurado
  - Organizan información en distintos niveles
  - Seleccionan el modelo LLM (GPT, Claude, Gemini, Mistral, etc.)
  - Envían un JSON estructurado
  - Reciben un JSON de respuesta con múltiples campos y subcategorías

#### Componentes principales

- `agents/agents.ts`  
  Implementa agentes usando el SDK de agents en TypeScript.  
  Actualmente existe un agente básico que:
  - Responde información de productos
  - Filtra por tipo de conversación

- `agents/prompting/`  
  Contendrá helpers orientados a:
  - Modularizar la creación de prompts
  - Facilitar la experimentación
  - A futuro, integrar interfaces de monitoreo del contexto entregado a los agentes

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

---

## Testing de agentes y exposición del servidor

Para testear el funcionamiento de los agentes:

1. Se levanta el servidor MCP en local mediante HTTP
2. Se expone el servidor utilizando **Ngrok**  
   (esto permite evitar restricciones habituales de red, TLS o políticas de seguridad de algunas APIs de LLM)
3. En el archivo principal de `agents/`, se configura la tool MCP:
   ```ts
   tools: [
     hostedMcpTool({
       serverLabel: 'servidor-guerra-del-pacifico',
       serverUrl: 'LINK_DE_NGROK'
     })
   ]
   ```
4. Ejecutar:
   ```bash
   npm run dev
   ```
5. El sistema:
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

El foco inmediato es **identificar casos de uso concretos y desarrollar agentes que automaticen procesos reales**.

Las APIs de LLM introducen una nueva capa de abstracción: **el lenguaje natural**.  
El desafío es reducir esa abstracción a componentes simples, observables y controlables, que puedan mapearse de forma confiable a acciones del sistema.

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

# P.D:

Asegurar la conexión del servidor MCP con la api para listar excursiones de Woocommerce. Agregar un campo al JSON, que incluya una categoría de excursión pensada exclusivamente para que el agente sea capaz de ofrecer solo los tours pertinentes a la conversación.
En un plazo razonable, se estima que el sistema debería ser capaz de atender en turismo y cerro, derivar conversaciones entre ambos canales, evaluar y registrar internamente
tanto la interacción de los agentes, como la interacción entre usuarios. Lo que podría derivar en un sistema que registre todas las veces que el agente NO FUE CAPAZ de resolver un problema POR SU CULPA, e ignorar las interacciones donde el usuario haya actuado indebidamente. 
A su vez, el sistema debería ser capaz de derivar conversaciones a agentes humanos en caso de ser necesario. 
Para utilizar todas las características nativas de los SDKs, considerar usar Postgres. 
