# Servidor Turistik MCP

## Propósito
Pretende modularizar la creación de sistemas que integren agentes de LLM.  
En palabras simples, es un protocolo de comunicación entre APIs basadas en LLMs, con sistemas externos.

## Estructura del proyecto
El proyecto se divide en tres carpetas principales:

### `server/`
- Levanta una instancia de servidor. Entorno nodejs, se compila a js para testeos en desarrollo y para despliegue a productivo.  
- `index.ts` es su archivo principal. En este archivo encontrará anotaciones sobre detalles del código. Levanta el servidor con el sdk de mcp servers a través de un puerto STDIO para testeos en local.  
- En `package.json` encontrará los comandos para ejecutar la compilación a JS, entre otros.  
- Para testear el servidor, utilizamos el sdk MCP Inspector. Para ello, asegúrese de estar en el directorio `server/`, y ejecute el comando `npx @modelcontextprotocol/inspector`. El servidor abrirá un puerto STDIO y automáticamente el sdk renderizará la interfaz de administración en la pestaña de su navegador.  
- En `server/services`, encontrará archivos con helpers, funciones, conexiones a bases de datos, APIs y tests.

### `agents/` (en desarrollo)
- Escrito en typescript, esquematiza la forma en la que agentes las APIs de los modelos LLM reciben la información. Ordenan el contexto en diferentes niveles, permiten definir el modelo LLM a utilizar (gpt, claude, gemini, mistral, y otros modelos consolidados) envía el json estructurado y recibe otro json (con muchísimos campos y subcategorías) con la respuesta.  
- `agents/agents.ts` trabaja sobre el framework sdk agents de typescript. Por el momento, simplemente hay un agente que responde productos y filtra por tipo de conversación.
- `agents/prompting` contendrá helpers que pretenden modularizar el trabajo de creación de prompts y a futuro conectar interfaces de monitoreo de la información que se entrega al agente.

### `front/` (en desarrollo)
- Contiene los templates del servidor MCP. Cada carpeta es un proyecto React.  
- Para crear un template utilizando React, simplemente debe crear un proyecto React y adaptarlo a la estructura sugerida por el cliente de ChatIA de su preferencia, ejecutar en la terminal el comando `npm run build`, sacar el archivo js compilado y situarlo en el directorio configurado en la función dentro del mismo servidor MCP.


## Consideraciones importantes
Muchos SDK aún no llegan a la versión estable, por lo que las funciones están constantemente cambiando, lo cual en la gran mayoría de los casos implica simplemente llamar a la nueva función con el nuevo nombre el lugar de la anterior. Conviene estar constantemente revisando el código por ahora, y procurar utilizar las funciones actualizadas para mayor seguridad y estabilidad.


## Notas

El servidor MCP en términos simples, propone un protocolo de comunicación entre distintos tipos de aplicaciones y las APIs de distintos modelos de lenguaje (LLM). 
Opera a nivel framework, en casi todos los lenguajes de alto nivel (Py, C, Java). Sin embargo, fue pensado para reforzarse en capas de abstracción más profundas. 
Hago énfasis en lo último, ya que los SDKs necesarios para levantar un servicio de estas características están en constante cambio. 