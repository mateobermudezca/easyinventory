# PRODUCT REQUIREMENTS DOCUMENT (PRD)
**Proyecto:** Herramienta Ágil de Inventario Mobiliario Móvil
**Entorno:** Personal / Vibe Coding (Vercel $0 Budget)
**Base de Datos:** Google Sheets

---

## 1. Visión General del Producto
La herramienta es una aplicación web ligera, optimizada para dispositivos móviles, diseñada para realizar levantamientos de inventario físico de mobiliario de oficina en campo de forma rápida e intuitiva. Permite registrar artículos en tiempo real enviando la información directamente a una hoja de cálculo de Google Sheets.

---

## 2. Objetivos Principales
* **Velocidad en campo:** Minimizar el tiempo de escritura manual mediante escaneo visual con la cámara del dispositivo móvil.
* **Cero costo de infraestructura ($0):** Despliegue en Vercel y uso de Google Sheets como base de datos.
* **Flexibilidad sobre la marcha:** Permitir la adición de campos/características personalizadas en tiempo real durante la sesión de inventario.
* **Acceso directo:** Sin procesos de autenticación, logins ni contraseñas. Uso personal directo a través de la URL.

---

## 3. Historias de Usuario

* **Como usuario de inventario:** Quiero ingresar a la aplicación desde mi teléfono y tener acceso directo al formulario sin pantallas de inicio de sesión para comenzar a registrar de inmediato.
* **Como usuario de inventario:** Quiero configurar previamente la lista de personas de la oficina para seleccionarlas desde un menú desplegable en lugar de escribir sus nombres repetidamente.
* **Como usuario de inventario:** Quiero escanear las etiquetas de los muebles con la cámara de mi teléfono para que extraiga el Número de Serie y/o la Referencia y los autocomplete en el formulario.
* **Como usuario de inventario:** Quiero poder editar o completar manualmente los campos si la etiqueta no existe, no es legible o el escáner no detecta un dato.
* **Como usuario de inventario:** Quiero agregar características o columnas adicionales antes o durante la sesión para registrar datos no contemplados inicialmente.
* **Como usuario de inventario:** Quiero recibir una confirmación inmediata al enviar un registro, ver cómo el formulario se limpia automáticamente y tener la opción de deshacer el registro si cometí un error.

---

## 4. Requerimientos Funcionales Detallados

### 4.1. Panel de Configuración Previa
* **Ubicación/Acceso:** Accesible antes de iniciar la sesión de registro o desde la pantalla principal mediante un botón visible.
* **Gestión de Personas:** Permite ingresar, editar o listar los nombres de los miembros del equipo a quienes se les asignará el mobiliario.
* **Gestión de Campos Adicionales (Columnas Dinámicas):**
  * Permite definir nuevos nombres de campos (ejemplo: "Estado del Mueble", "Piso/Ubicación", "Color").
  * Al confirmar la creación de un nuevo campo, la herramienta debe comunicar a Google Sheets la inclusión de esa nueva columna al final de la fila de encabezados.
  * El nuevo campo debe incorporarse inmediatamente al formulario de la sesión actual y mantenerse activo para los siguientes registros.

### 4.2. Formulario de Registro
Campos obligatorios / estándar del formulario:
1. **Artículo:** Campo de texto libre (Ejemplo: Silla ergonómica, Escritorio en L, Archivador).
2. **Número de Serie:** Campo de texto (Autodiligenciable por escáner o editable manualmente).
3. **Referencia:** Campo de texto (Autodiligenciable por escáner o editable manualmente).
4. **Persona Asignada:** Selector de lista desplegable poblado automáticamente con los nombres ingresados en el Panel de Configuración.
5. **Campos Dinámicos:** Campos de texto adicionales creados durante la configuración.

### 4.3. Escáner de Etiquetas con Cámara (IA / OCR / Código de Barras)
* **Activación:** Botón dedicado para encender la cámara del dispositivo móvil.
* **Capacidad de Reconocimiento:**
  * Debe reconocer tanto códigos de barras / QR como texto impreso (números de serie y referencias impresas en etiquetas).
* **Comportamiento post-lectura:**
  * Una vez identificado el texto/código, debe colocar automáticamente los valores extraídos en los campos correspondientes (**Número de Serie** y/o **Referencia**).
  * El usuario debe poder revisar y corregir manualmente los datos en pantalla antes de presionar "Enviar".
* **Modo Alternativo:** Si el artículo no posee etiqueta o el escáner falla, la aplicación debe permitir el ingreso 100% manual sin bloquear el flujo.

### 4.4. Envío, Persistencia y Sincronización
* **Envío en Tiempo Real:** Al presionar "Enviar Registro", los datos se transmiten inmediatamente a la hoja de cálculo de Google.
* **Limpieza de Formulario:** Tras la confirmación del envío, el formulario restablece sus campos a blanco (manteniendo la configuración de campos extra y la persona si así se requiere para agilizar).
* **Función Deshacer (Undo):**
  * Junto a la notificación de éxito, se debe presentar un botón temporal de "Deshacer".
  * Al presionarlo, la herramienta debe eliminar el último registro enviado a la hoja de cálculo de Google.

---

## 5. Integración con Google Sheets
* **Estructura Base Prevista:**
  * La hoja de cálculo contendrá inicialmente las columnas base: `Artículo`, `Número de Serie`, `Referencia`, `Persona Asignada`.
* **Crecimiento Dinámico:**
  * Si el usuario agrega un campo nuevo en la app, la herramienta debe insertar el nombre del nuevo campo como un nuevo encabezado de columna en la primera fila libre disponible de la hoja.