# TECH STACK & ARCHITECTURE GUIDE
**Proyecto:** Herramienta Ágil de Inventario Mobiliario Móvil
**Presupuesto Target:** $0 USD
**Plataforma de Despliegue:** Vercel (Tier Gratuito)
**Base de Datos / Persistencia:** Google Sheets API

---

## 1. Visión General de la Arquitectura

La arquitectura está concebida como una aplicación web ligera (Single Page Application o PWA minimalista) orientada a consumo móvil. El diseño prioriza la ejecución de procesos en el cliente (navegador del teléfono) para reducir la sobrecarga de servidor y mantener un costo nulo de operación.

### Flujo de Datos del Sistema

1. **Captura Visual:** El navegador utiliza la cámara integrada del dispositivo móvil para analizar etiquetas físicas (códigos de barras, códigos QR o texto impreso) y extraer las cadenas de caracteres mediante procesamiento client-side.
2. **Procesamiento de Formulario:** La interfaz pre-llena los campos del formulario, permitiendo edición directa en pantalla antes de confirmar.
3. **Persistencia Directa:** Al presionar "Enviar", la aplicación realiza una llamada a la API de integración hacia Google Sheets para insertar la fila en tiempo real.
4. **Gestión Dinámica de Columnas:** Si se define una nueva característica en el panel de configuración, el sistema evalúa la primera fila de la hoja de cálculo, agrega la cabecera correspondiente al final de la fila y ajusta los envíos posteriores para incluir este nuevo dato.

---

## 2. Definición del Stack Tecnológico ($0 USD)

* **Despliegue y Hosting:** Vercel (Hobby Tier / Gratuito). Soporta integración directa desde repositorio de código y entrega continua sin costo.
* **Persistencia y Base de Datos:** Google Sheets mediante Google Sheets API v4 o servicios middleware serverless tipo Google Apps Script / AppScript Webhooks / HTTP Endpoints públicos.
* **Escaneo de Código de Barras / QR:** Bibliotecas client-side de procesamiento de imágenes vía JavaScript/Web APIs estándar (ej. API de detección de forma de navegador o bibliotecas ligeras sin costo).
* **Lectura de Texto Impreso (OCR / IA):** Motor de reconocimiento óptico de caracteres ejecutable directamente en el navegador sin consumo de servicios de pago en la nube.
* **Interfaz de Usuario (UI):** Framework o sistema de estilos utilitario súper liviano enfocado en rendimiento móvil, sin carga pesada de dependencias.

---

## 3. Especificaciones Técnicas de Integración con Google Sheets

### 3.1. Estructura de la Hoja de Cálculo Base

La hoja de cálculo creada previamente debe contar con la siguiente fila inicial de encabezados:

* **Columna A:** `Artículo`
* **Columna B:** `Número de Serie`
* **Columna C:** `Referencia`
* **Columna D:** `Persona Asignada`
* **Columnas E en adelante:** Reservadas para campos dinámicos o adicionales creados durante la sesión de inventario.

### 3.2. Mecanismo de Columnas Dinámicas

1. Al agregar un campo adicional desde la pantalla de configuración (ej. *"Estado del mueble"*), la aplicación consulta la primera fila de la hoja de cálculo para verificar si la cabecera ya existe.
2. Si el título no está presente en la Fila 1, la aplicación escribe el nombre de la cabecera en la primera celda vacía hacia la derecha.
3. La aplicación mapea este nuevo campo al formulario para que cada nuevo envío agregue el valor en la posición de columna correcta.

### 3.3. Lógica de Eliminación / Función "Deshacer" (Undo)

* La función de deshacer debe estar disponible por un intervalo de tiempo breve (4 a 5 segundos) en el aviso flotante posterior al envío.
* Al activarse, la herramienta emite una instrucción para identificar y eliminar la última fila registrada en la hoja de cálculo de Google.
* Si el intervalo caduca o se realiza un nuevo registro, el botón "Deshacer" se deshabilita para evitar borrados accidentales de registros previos.

---

## 4. Requerimientos de Rendimiento y Compatibilidad Móvil

* **Compatibilidad:** Debe funcionar de manera fluida en navegadores móviles modernos (iOS Safari y Android Chrome).
* **Permisos:** Solicitud explícita de permiso de uso de cámara en la primera interacción de escaneo.
* **Uso de Memoria:** La ejecución del escáner y OCR en el navegador no debe ralentizar el dispositivo ni consumir la batería de forma desmedida durante la jornada de trabajo.
* **Gestión de Errores de Red:** En caso de fallos momentáneos de conectividad al enviar datos a Google Sheets, la app debe notificar al usuario y ofrecer una opción de reintento manual sin perder la información digitada en el formulario.

---

## 5. Directrices de Desarrollo para Antigravity

El modelo o agente encargado de la construcción (Antigravity) tiene total flexibilidad para seleccionar:

1. El framework o biblioteca de desarrollo frontend que considere más eficiente y rápido.
2. Las bibliotecas específicas de lectura visual (código de barras, QR y OCR) que garanticen mejor tasa de acierto y $0 costo.
3. La estrategia exacta de conexión a la API de Google Sheets (conectores directos, OAuth, Service Accounts o Webhooks).

**Restricciones obligatorias:**
* No incorporar cobros por consumo de APIs ni servicios externos pagados.
* No requerir inicio de sesión ni capas de autenticación complejas para el usuario final.
* Mantener la aplicación en una sola plataforma de despliegue accesible vía URL directa.