# Medallas para Wikipedia

Extensión Chrome (Manifest V3) para Wikipedia en español. Selector de cuatro columnas con doce filas de medallas (36 opciones) y una última fila para insertar la cruz roja `[[Imagen:Injury icon 2.svg|15px]]`. No publica ni guarda ediciones.

## Instalación
1. Descarga el proyecto y descomprime el ZIP.
2. Abre `chrome://extensions` y activa **Modo de desarrollador**.
3. Pulsa **Cargar descomprimida** y selecciona la carpeta `extension`.
4. Fija la extensión a la barra de Chrome.

## Uso
Abre **Editar** o **Editar código** en `https://es.wikipedia.org`, sitúa el cursor y abre la extensión. Pulsa la medalla: se insertará en la selección actual. Una selección de texto será sustituida. Revisa la edición y guárdala desde Wikipedia cuando quieras.

Se integra con VisualEditor, su modo de código y WikiEditor mediante sus APIs. La conversión visual requiere conexión y la API VisualEditor de Wikipedia. Los cambios futuros en los editores pueden requerir ajustes. Prueba primero en tu taller; la integración real con Wikipedia requiere validación manual antes de publicar la extensión en Chrome Web Store.

Los botones muestran el puesto 1, 2 o 3 con su color para identificar cada opción; las imágenes que se insertan son las de las plantillas y archivos originales de Wikipedia.

## Privacidad
Sin analítica ni servidores propios. Solo solicita `activeTab` y `scripting`: actúa al pulsar una medalla en la pestaña activa. En el editor visual envía el código de la medalla a la API de la propia Wikipedia. No solicita credenciales ni guarda contenido.

## Validación
`node --test tests/*.test.cjs`
