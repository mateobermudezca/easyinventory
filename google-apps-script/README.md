# Guía Rápida: Conexión con Google Sheets ($0 Costo)

Esta aplicación utiliza **Google Apps Script** para comunicarse con Google Sheets sin requerir cuentas de servicio complejas, sin credenciales de pago y sin límites restrictivos.

---

### Paso 1: Crear la Hoja de Cálculo
1. Entra a [Google Sheets](https://sheets.new) y crea una nueva hoja.
2. Nómbrala como quieras (ejemplo: `Inventario Mobiliario 2026`).

---

### Paso 2: Pegar el Script Backend
1. En la barra superior de Google Sheets, ve a: **Extensiones** ➔ **Apps Script**.
2. Borra cualquier código que aparezca en el editor y pega todo el contenido del archivo [`Code.gs`](file:///C:/Users/user/Documents/PROYECTOS/EASY%20INVENTORY/easyinventory/google-apps-script/Code.gs).
3. Haz clic en el icono de **Guardar** (disquete).

---

### Paso 3: Implementar como Aplicación Web
1. En la esquina superior derecha, haz clic en **Implementar** (Deploy) ➔ **Nueva implementación** (New deployment).
2. Haz clic en el engranaje ⚙️ (Seleccionar tipo) y elige **Aplicación web** (Web app).
3. Configura exactamente estos campos:
   - **Descripción:** `Easy Inventory API`
   - **Ejecutar como:** `Yo (tu_correo@gmail.com)`
   - **Quién tiene acceso:** `Cualquier usuario` (Anyone)  *(⚠️ IMPORTANTE: Esto permite que tu app móvil envíe datos sin obligar a iniciar sesión)*
4. Haz clic en **Implementar**.
5. Google te pedirá autorizar permisos. Selecciona tu cuenta, pulsa en *Configuración avanzada* y luego en *Ir a (nombre del proyecto) (no seguro)* ➔ *Permitir*.
6. Copia la **URL de la aplicación web** generada (termina en `/exec`).

---

### Paso 4: Conectar la App
Tienes 2 opciones sencillas:
1. **Directamente en la App Web:** Abre Easy Inventory, haz clic en el icono de Ajustes ⚙️ en la esquina superior derecha y pega la URL. Se guardará automáticamente en tu dispositivo.
2. **O en el archivo `.env.local`:** Crea un archivo `.env.local` con:
   ```env
   VITE_GOOGLE_SCRIPT_URL="https://script.google.com/macros/s/TU_ID_DE_SCRIPT/exec"
   ```
