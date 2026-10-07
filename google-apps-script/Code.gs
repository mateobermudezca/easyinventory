/**
 * EASY INVENTORY - Google Apps Script Backend ($0 Cost)
 * 
 * Este script actúa como API REST para recibir y registrar los datos de inventario
 * directamente en tu hoja de cálculo de Google Sheets.
 * 
 * INSTRUCCIONES DE DESPLIEGUE:
 * 1. En tu Google Sheet, ve a: Extensiones -> Apps Script.
 * 2. Borra el código existente y pega todo este contenido.
 * 3. Haz clic en "Implementar" (Deploy) -> "Nueva implementación" (New deployment).
 * 4. Selecciona tipo: "Aplicación web" (Web app).
 * 5. Configura:
 *    - Ejecutar como: "Yo" (Me)
 *    - Quién tiene acceso: "Cualquier usuario" (Anyone) -> CRÍTICO para permitir envíos sin login.
 * 6. Haz clic en "Implementar", autoriza los permisos requeridos y copia la URL de la aplicación web.
 * 7. Pega esa URL en Easy Inventory (en Ajustes o en tu archivo .env.local).
 */

const BASE_HEADERS = [
  "Artículo",
  "Número de Serie",
  "Referencia",
  "Persona Asignada",
  "Fecha y Hora"
];

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: "Easy Inventory API activa y lista",
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    let contents = {};
    if (e && e.postData && e.postData.contents) {
      contents = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      contents = e.parameter;
    }

    const action = contents.action || "addRow";
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Asegurar que existan los encabezados base
    initHeaders(sheet);

    if (action === "ping") {
      return jsonResponse({
        success: true,
        message: "Conexión exitosa con Google Sheets",
        sheetName: sheet.getName(),
        totalRows: Math.max(0, sheet.getLastRow() - 1),
        headers: getCurrentHeaders(sheet)
      });
    }

    if (action === "addRow") {
      const data = contents.data || {};
      const currentHeaders = getCurrentHeaders(sheet);

      // Si vienen campos dinámicos que no están en la cabecera, agregarlos
      const dynamicFields = data.dynamicFields || {};
      Object.keys(dynamicFields).forEach(fieldKey => {
        if (!currentHeaders.includes(fieldKey)) {
          sheet.getRange(1, sheet.getLastColumn() + 1).setValue(fieldKey);
          currentHeaders.push(fieldKey);
        }
      });

      // Mapear los valores a la posición de cada columna
      const rowData = currentHeaders.map(header => {
        switch (header) {
          case "Artículo":
            return data.articulo || "";
          case "Número de Serie":
            return data.numeroSerie || "";
          case "Referencia":
            return data.referencia || "";
          case "Persona Asignada":
            return data.personaAsignada || "";
          case "Fecha y Hora":
            return Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "GMT-5", "yyyy-MM-dd HH:mm:ss");
          default:
            return (dynamicFields && dynamicFields[header]) ? dynamicFields[header] : "";
        }
      });

      sheet.appendRow(rowData);
      const insertedRow = sheet.getLastRow();

      return jsonResponse({
        success: true,
        message: "¡Artículo registrado con éxito en Google Sheets!",
        insertedRow: insertedRow,
        record: data
      });
    }

    if (action === "deleteLastRow") {
      const lastRow = sheet.getLastRow();
      if (lastRow <= 1) {
        return jsonResponse({
          success: false,
          message: "No hay registros para eliminar (solo existe la fila de encabezados)."
        });
      }

      sheet.deleteRow(lastRow);
      return jsonResponse({
        success: true,
        message: "Último registro eliminado con éxito (Deshacer completado).",
        deletedRow: lastRow
      });
    }

    if (action === "addColumn") {
      const columnName = contents.columnName;
      if (!columnName || typeof columnName !== "string" || !columnName.trim()) {
        return jsonResponse({ success: false, message: "Nombre de columna inválido." });
      }

      const cleanName = columnName.trim();
      const currentHeaders = getCurrentHeaders(sheet);
      if (currentHeaders.includes(cleanName)) {
        return jsonResponse({
          success: true,
          message: "La columna ya existía en la hoja.",
          headers: currentHeaders
        });
      }

      const nextCol = sheet.getLastColumn() + 1;
      sheet.getRange(1, nextCol).setValue(cleanName);
      currentHeaders.push(cleanName);

      return jsonResponse({
        success: true,
        message: `Columna "${cleanName}" agregada con éxito.`,
        headers: currentHeaders
      });
    }

    if (action === "getHeaders") {
      return jsonResponse({
        success: true,
        headers: getCurrentHeaders(sheet)
      });
    }

    return jsonResponse({
      success: false,
      message: `Acción desconocida: ${action}`
    });

  } catch (error) {
    return jsonResponse({
      success: false,
      message: "Error en el servidor de Apps Script: " + error.toString()
    });
  }
}

function initHeaders(sheet) {
  if (sheet.getLastRow() === 0 || sheet.getLastColumn() === 0) {
    sheet.appendRow(BASE_HEADERS);
    // Formato estético para cabeceras
    const headerRange = sheet.getRange(1, 1, 1, BASE_HEADERS.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#2563EB");
    headerRange.setFontColor("#FFFFFF");
  }
}

function getCurrentHeaders(sheet) {
  if (sheet.getLastColumn() === 0) return [];
  const range = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  const values = range.getValues()[0];
  return values.filter(h => h && h.toString().trim() !== "");
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
