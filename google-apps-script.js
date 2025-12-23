/**
 * ============================================
 * GOOGLE APPS SCRIPT PARA EXAMEN FINAL
 * Diseño Web II
 * ============================================
 * 
 * Este script maneja:
 * 1. Guardar resultados del examen en Google Sheets
 * 2. Subir archivos de proyectos a Google Drive
 * 
 * INSTRUCCIONES DE CONFIGURACIÓN:
 * 
 * 1. Abre tu Google Sheets "examenFinalWebDesing2"
 * 
 * 2. Ve a "Extensiones" > "Apps Script"
 * 
 * 3. Copia y pega TODO este código en el editor
 * 
 * 4. IMPORTANTE: Cambia el FOLDER_ID debajo por el ID de tu carpeta de Drive
 *    (El ID está en la URL de Drive: drive.google.com/drive/folders/[ESTE_ES_EL_ID])
 * 
 * 5. Guarda el proyecto (Ctrl+S)
 * 
 * 6. Haz clic en "Implementar" > "Nueva implementación"
 * 
 * 7. En "Tipo", selecciona "Aplicación web"
 * 
 * 8. Configura:
 *    - Descripción: "API Examen Final"
 *    - Ejecutar como: "Yo" (tu cuenta)
 *    - Quién tiene acceso: "Cualquier persona"
 * 
 * 9. Haz clic en "Implementar"
 * 
 * 10. Autoriza la aplicación cuando se te pida
 *     (Puede que necesites hacer clic en "Mostrar configuración avanzada" 
 *      y luego "Ir a [nombre del proyecto] (no seguro)")
 * 
 * 11. Copia la URL de la web app (será algo como:
 *     https://script.google.com/macros/s/xxxxx/exec)
 * 
 * 12. Pega esa URL en el archivo app.js del examen:
 *     - En GOOGLE_SHEETS_URL para resultados
 *     - En GOOGLE_DRIVE_UPLOAD_URL para archivos
 * 
 * ============================================
 */

// ⚠️ CONFIGURACIÓN IMPORTANTE - CAMBIAR ESTOS VALORES
const FOLDER_ID = '1UCQGKCRsLSXjKhHzgxgJEDYRjVgfp2k7'; // ID de la carpeta de Drive para entregas
const SHEET_NAME = 'Resultados'; // Nombre de la hoja para resultados

/**
 * ============================================
 * FUNCIONES PRINCIPALES
 * ============================================
 */

/**
 * Función que se ejecuta cuando alguien envía datos (POST)
 * Maneja tanto resultados del examen como subida de archivos
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Determinar si es una subida de archivo o resultados del examen
    if (data.fileData) {
      // Es una subida de archivo
      return handleFileUpload(data);
    } else {
      // Es un envío de resultados
      return handleExamResults(data);
    }
    
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.message
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Función que se ejecuta cuando alguien accede via GET
 * Útil para verificar que el script funciona
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'OK',
      message: 'API del Examen Final de Diseño Web II',
      version: '2.0',
      features: ['exam_results', 'file_upload'],
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * ============================================
 * MANEJO DE RESULTADOS DEL EXAMEN
 * ============================================
 */

function handleExamResults(data) {
  const sheet = getOrCreateSheet();
  
  // Agregar los datos
  sheet.appendRow([
    new Date(),                    // Fecha y hora
    data.studentName || '',        // Nombre del estudiante
    data.studentId || '',          // Matrícula
    data.studentEmail || '',       // Email
    data.totalPoints || 0,         // Puntuación total
    data.correctCount || 0,        // Respuestas correctas
    data.incorrectCount || 0,      // Respuestas incorrectas
    data.timeSpent || '',          // Tiempo empleado
    data.answers || ''             // Respuestas detalladas (JSON)
  ]);
  
  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      message: 'Resultados guardados correctamente',
      type: 'exam_results'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Obtiene la hoja de resultados o la crea si no existe
 */
function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    
    const headers = [
      'Fecha/Hora',
      'Nombre',
      'Matrícula',
      'Email',
      'Puntuación',
      'Correctas',
      'Incorrectas',
      'Tiempo',
      'Respuestas (JSON)'
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground('#4a86e8')
      .setFontColor('#ffffff')
      .setFontWeight('bold');
    
    sheet.setFrozenRows(1);
    
    sheet.setColumnWidth(1, 150);
    sheet.setColumnWidth(2, 200);
    sheet.setColumnWidth(3, 120);
    sheet.setColumnWidth(4, 250);
    sheet.setColumnWidth(5, 100);
    sheet.setColumnWidth(6, 100);
    sheet.setColumnWidth(7, 100);
    sheet.setColumnWidth(8, 100);
    sheet.setColumnWidth(9, 400);
  }
  
  return sheet;
}

/**
 * ============================================
 * MANEJO DE SUBIDA DE ARCHIVOS
 * ============================================
 */

function handleFileUpload(data) {
  try {
    // Obtener la carpeta principal
    const mainFolder = DriveApp.getFolderById(FOLDER_ID);
    
    // Crear o obtener carpeta del estudiante
    const studentFolderName = `${data.studentId}_${data.studentName}`;
    let studentFolder;
    
    const folders = mainFolder.getFoldersByName(studentFolderName);
    if (folders.hasNext()) {
      studentFolder = folders.next();
    } else {
      studentFolder = mainFolder.createFolder(studentFolderName);
    }
    
    // Decodificar el archivo de base64
    const decoded = Utilities.base64Decode(data.fileData);
    const blob = Utilities.newBlob(decoded, data.mimeType, data.fileName);
    
    // Crear el archivo en Drive
    const file = studentFolder.createFile(blob);
    
    // Registrar la subida en una hoja de "Entregas"
    logFileUpload(data.studentId, data.studentName, data.fileName, file.getUrl());
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Archivo subido correctamente',
        type: 'file_upload',
        fileUrl: file.getUrl(),
        fileName: data.fileName
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: 'Error al subir archivo: ' + error.message,
        type: 'file_upload'
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Registra la subida de archivos en una hoja separada
 */
function logFileUpload(studentId, studentName, fileName, fileUrl) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Entregas');
  
  if (!sheet) {
    sheet = ss.insertSheet('Entregas');
    
    const headers = ['Fecha/Hora', 'Matrícula', 'Nombre', 'Archivo', 'URL'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground('#34a853')
      .setFontColor('#ffffff')
      .setFontWeight('bold');
    
    sheet.setFrozenRows(1);
  }
  
  sheet.appendRow([
    new Date(),
    studentId,
    studentName,
    fileName,
    fileUrl
  ]);
}

/**
 * ============================================
 * FUNCIONES DE PRUEBA Y UTILIDADES
 * ============================================
 */

/**
 * Función para probar que el script funciona
 * Ejecuta esto manualmente para verificar
 */
function testScript() {
  // Probar guardado de resultados
  const testData = {
    studentName: 'Estudiante de Prueba',
    studentId: '1234567890',
    studentEmail: 'test@example.com',
    totalPoints: 85,
    correctCount: 17,
    incorrectCount: 3,
    timeSpent: '45m 30s',
    answers: '{"test": "data"}'
  };
  
  const sheet = getOrCreateSheet();
  sheet.appendRow([
    new Date(),
    testData.studentName,
    testData.studentId,
    testData.studentEmail,
    testData.totalPoints,
    testData.correctCount,
    testData.incorrectCount,
    testData.timeSpent,
    testData.answers
  ]);
  
  Logger.log('Prueba completada! Revisa la hoja "Resultados"');
}

/**
 * Función para probar la subida de archivos
 */
function testFileUpload() {
  try {
    const mainFolder = DriveApp.getFolderById(FOLDER_ID);
    Logger.log('Carpeta encontrada: ' + mainFolder.getName());
    
    // Crear carpeta de prueba
    const testFolder = mainFolder.createFolder('test_delete_after_test');
    Logger.log('Carpeta de prueba creada: ' + testFolder.getUrl());
    
    // Eliminar carpeta de prueba
    testFolder.setTrashed(true);
    Logger.log('Prueba exitosa - Tienes permisos para crear carpetas y archivos');
    
  } catch (error) {
    Logger.log('Error: ' + error.message);
    Logger.log('Verifica que el FOLDER_ID es correcto y que tienes permisos de edición');
  }
}

/**
 * Función para limpiar los datos de prueba
 */
function clearTestData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  
  if (sheet) {
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.deleteRows(2, lastRow - 1);
    }
  }
  
  Logger.log('Datos limpiados (se mantienen los encabezados)');
}

/**
 * Genera un reporte resumen de los resultados
 */
function generateSummaryReport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet || sheet.getLastRow() <= 1) {
    Logger.log('No hay datos para generar el reporte');
    return;
  }
  
  const data = sheet.getDataRange().getValues();
  const results = data.slice(1);
  
  const scores = results.map(row => row[4]);
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);
  
  const passed = scores.filter(s => s >= 60).length;
  const failed = scores.filter(s => s < 60).length;
  
  let summarySheet = ss.getSheetByName('Resumen');
  if (!summarySheet) {
    summarySheet = ss.insertSheet('Resumen');
  } else {
    summarySheet.clear();
  }
  
  const summaryData = [
    ['RESUMEN DEL EXAMEN FINAL', ''],
    ['Fecha del Reporte', new Date()],
    ['', ''],
    ['Total de Estudiantes', results.length],
    ['Aprobados (≥60)', passed],
    ['Reprobados (<60)', failed],
    ['', ''],
    ['Promedio General', avgScore.toFixed(2)],
    ['Puntuación Máxima', maxScore],
    ['Puntuación Mínima', minScore],
    ['', ''],
    ['Tasa de Aprobación', ((passed / results.length) * 100).toFixed(2) + '%']
  ];
  
  summarySheet.getRange(1, 1, summaryData.length, 2).setValues(summaryData);
  
  summarySheet.getRange(1, 1).setFontSize(16).setFontWeight('bold');
  summarySheet.setColumnWidth(1, 200);
  summarySheet.setColumnWidth(2, 150);
  
  Logger.log('Reporte generado! Revisa la hoja "Resumen"');
}

/**
 * Obtener estadísticas de archivos entregados
 */
function getDeliveryStats() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Entregas');
  
  if (!sheet || sheet.getLastRow() <= 1) {
    Logger.log('No hay entregas registradas');
    return;
  }
  
  const data = sheet.getDataRange().getValues();
  const deliveries = data.slice(1);
  
  // Contar entregas por estudiante
  const studentDeliveries = {};
  deliveries.forEach(row => {
    const studentId = row[1];
    studentDeliveries[studentId] = (studentDeliveries[studentId] || 0) + 1;
  });
  
  Logger.log('Total de archivos entregados: ' + deliveries.length);
  Logger.log('Estudiantes que entregaron: ' + Object.keys(studentDeliveries).length);
  Logger.log('Detalle por estudiante: ' + JSON.stringify(studentDeliveries, null, 2));
}
