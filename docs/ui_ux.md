# UI / UX SPECIFICATION DOCUMENT
**Proyecto:** Herramienta Ágil de Inventario Mobiliario Móvil
**Enfoque:** Mobile-First, Máxima Velocidad, Ergonomía de Trabajo en Campo

---

## 1. Filosofía de Diseño
* **Diseño Utilitario y Limpio:** Sin distracciones visuales ni elementos decorativos innecesarios.
* **Uso con una sola mano (Thumb-Friendly):** Botones de acción principales (Escanear, Enviar) con tamaño adecuado para pulsarse fácilmente con el pulgar.
* **Alto Contraste:** Lectura clara bajo condiciones de luz variable en entornos de oficina.

---

## 2. Estructura de Pantallas y Flujos

### Pantalla A: Panel de Configuración Inicial
1. **Encabezado:** Título claro "Configuración de Inventario".
2. **Sección "Integrantes del Equipo":**
   * Campo de texto simple + botón "Agregar Persona".
   * Lista visual (chips/etiquetas) con las personas agregadas y opción de eliminar individualmente.
3. **Sección "Campos Adicionales para la Hoja":**
   * Campo de texto para ingresar el nombre de la nueva característica + botón "Agregar Campo a la Hoja".
   * Lista visual de campos adicionales activos para la sesión.
4. **Botón Principal de Acción:** "Ir a Registrar Inventario" (Destacado, fija la pantalla al formulario).

---

### Pantalla B: Formulario Principal de Inventario
1. **Barra Superior:**
   * Título "Registro de Artículo".
   * Indicador visual de estado de conexión (Verde = Conectado / Listo).
   * Botón discreto de "Ajustes / Configuración" para volver a la Pantalla A.
2. **Zona de Escáner:**
   * Botón ancho y destacado "Escanear Etiqueta con Cámara" con icono de cámara.
   * Al pulsar, despliega el visor de cámara en pantalla completa o flotante.
3. **Cuerpo del Formulario:**
   * **Campo Artículo:** Input de texto largo o sugerencias rápidas.
   * **Campo Número de Serie:** Input de texto + icono indicador si fue llenado por escáner.
   * **Campo Referencia:** Input de texto.
   * **Campo Persona Asignada:** Menú desplegable con los nombres previamente configurados.
   * **Campos Personalizados:** Aparecen en la parte inferior del formulario como inputs de texto convencionales.
4. **Acción Principal:**
   * Botón grande y fijo "Guardar y Enviar Registro".

---

### Componentes Flotantes y Feedback Visual

1. **Visor de Cámara / Escáner:**
   * Recuadro de guía en el centro de la pantalla para enfocar la etiqueta.
   * Botón para cerrar/cancelar el escáner si se desea ingresar manualmente.

2. **Notificación Flotante (Toast Notification):**
   * Aparece en la parte inferior de la pantalla inmediatamente tras presionar "Enviar".
   * Mensaje: "¡Artículo registrado con éxito en Google Sheets!".
   * Botón de acción rápido integrado dentro de la notificación: **"Deshacer"**.
   * La notificación desaparece automáticamente tras 4 a 5 segundos.

3. **Estado de Carga (Loading State):**
   * Mientras se procesa la solicitud con Google Sheets, el botón "Enviar" entra en estado deshabilitado con un spinner o texto de "Guardando...".

---

## 3. Manejo de Casos de Borde e Incidencias en UX

* **Si la cámara no detecta texto o código:** La interfaz muestra un aviso breve "No se detectó código/texto. Puedes ingresarlo manualmente" sin bloquear ni reiniciar el formulario.
* **Si falla la conexión a internet:** El botón de envío muestra un aviso de error visual con opción de reintentar el envío.