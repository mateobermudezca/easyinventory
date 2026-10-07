# 🚀 GUÍA DE DESPLIEGUE EN VERCEL ($0 PRESUPUESTO)

Easy Inventory está diseñado para desplegarse con **cero costo de infraestructura** en el plan gratuito (Hobby Tier) de Vercel y conectarse con Google Sheets en tiempo real.

---

## 📋 Requisitos Previos (100% Gratuitos)
1. Una cuenta gratuita en [Vercel](https://vercel.com).
2. Una cuenta en [GitHub](https://github.com) (o GitLab / Bitbucket).
3. Tu hoja de cálculo de Google Sheets con el script de [`google-apps-script/Code.gs`](file:///C:/Users/user/Documents/PROYECTOS/EASY%20INVENTORY/easyinventory/google-apps-script/Code.gs) implementado.

---

## 🛠️ Método 1: Despliegue con GitHub y Vercel (Recomendado)

### 1. Subir tu proyecto a GitHub
Desde la terminal en `C:\Users\user\Documents\PROYECTOS\EASY INVENTORY\easyinventory`:
```bash
git add .
git commit -m "feat: complete mobile inventory tool with scanner and undo"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/easyinventory.git
git push -u origin main
```

### 2. Importar el Proyecto en Vercel
1. Ingresa a tu panel en [vercel.com](https://vercel.com).
2. Haz clic en **"Add New..."** ➔ **"Project"**.
3. Selecciona tu repositorio `easyinventory` y haz clic en **Import**.
4. Vercel detectará automáticamente:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### 3. Configurar Variables de Entorno (Opcional)
En la sección **Environment Variables**, puedes agregar:
- **Key:** `VITE_GOOGLE_SCRIPT_URL`
- **Value:** `https://script.google.com/macros/s/TU_ID_DE_SCRIPT/exec`

*(Nota: Si no la agregas aquí, ¡no te preocupes! Puedes pegarla directamente desde tu teléfono en el menú de Ajustes ⚙️ de la app y se guardará automáticamente en tu dispositivo).*

### 4. Desplegar
1. Haz clic en el botón azul **"Deploy"**.
2. En menos de 1 minuto, Vercel generará una URL pública segura (ej: `https://easyinventory-tu_usuario.vercel.app`).

---

## 📱 Cómo Usar en tu Teléfono como App Nativa (PWA)

Una vez abierta la URL de Vercel en tu teléfono:

### En iPhone (Safari):
1. Toca el botón **Compartir** (icono de cuadrado con flecha hacia arriba en la parte inferior).
2. Desliza hacia abajo y selecciona **"Agregar a pantalla de inicio"** (Add to Home Screen).
3. ¡Listo! Se abrirá como una aplicación nativa a pantalla completa sin barras de navegador.

### En Android (Chrome):
1. Toca el menú de los 3 puntos (arriba a la derecha).
2. Selecciona **"Instalar aplicación"** o **"Agregar a la pantalla principal"**.
3. ¡Listo! Se agregará el icono en tu pantalla de aplicaciones.

---

## 🔄 Solución de Problemas Frecuentes
- **Error "Cámara no accesible":** Safari y Chrome exigen HTTPS para activar la cámara. La URL de Vercel incluye HTTPS de forma predeterminada y gratuita. Asegúrate de conceder permiso al navegador cuando te pregunte.
- **Error al enviar datos a Google Sheets:** Verifica que en Apps Script hayas seleccionado **Quién tiene acceso: "Cualquier usuario" (Anyone)**. Si seleccionaste "Solo yo", el navegador rechazará la llamada por falta de autenticación.
