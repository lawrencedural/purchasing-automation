/**
 * Data Export Utility
 * Exports parsed data to CSV and Excel formats
 */

import * as XLSX from 'xlsx';

/**
 * Export trims data to Excel
 */
export function exportTrimsToExcel(trims, filename = 'trim_data.xlsx') {
  // Prepare data for export
  const exportData = [];
  
  trims.forEach(trim => {
    if (trim.suppliers && trim.suppliers.length > 0) {
      // If multiple suppliers, create separate rows
      trim.suppliers.forEach(supplier => {
        exportData.push({
          'Number': trim.number,
          'Description': trim.description,
          'UM': trim.um,
          'Fiber Content': trim.fiberContent,
          'Fiber Content Back': trim.fiberContentBack,
          'Material Coating': trim.materialCoating,
          'Material Finish (Face)': trim.materialFinish,
          'Material Laminate': trim.materialLaminate,
          'Trim Specific': trim.trimSpecific,
          'Supplier Name': supplier.name,
          'Art No': supplier.artNo,
          'Country': supplier.country,
          'Standard Cost (FOB)': supplier.standardCostFOB,
          'Purchase Cost (CIF)': supplier.purchaseCostCIF,
          'Lead Time With Greige': supplier.leadTimeWithGreige,
          'Lead Time Without Greige': supplier.leadTimeWithoutGreige
        });
      });
    } else {
      // No suppliers, just add trim data
      exportData.push({
        'Number': trim.number,
        'Description': trim.description,
        'UM': trim.um,
        'Fiber Content': trim.fiberContent,
        'Fiber Content Back': trim.fiberContentBack,
        'Material Coating': trim.materialCoating,
        'Material Finish (Face)': trim.materialFinish,
        'Material Laminate': trim.materialLaminate,
        'Trim Specific': trim.trimSpecific,
        'Supplier Name': '',
        'Art No': '',
        'Country': '',
        'Standard Cost (FOB)': '',
        'Purchase Cost (CIF)': '',
        'Lead Time With Greige': '',
        'Lead Time Without Greige': ''
      });
    }
  });

  // Create workbook
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Trims');

  // Write file
  XLSX.writeFile(workbook, filename);
  
  return exportData.length;
}

/**
 * Export color BOM to Excel
 */
export function exportColorBOMToExcel(colorBOM, filename = 'color_bom.xlsx') {
  if (!colorBOM || colorBOM.length === 0) {
    throw new Error('No color BOM data to export');
  }

  // Prepare data
  const exportData = [];
  
  colorBOM.forEach(color => {
    color.components.forEach(component => {
      exportData.push({
        'Color': color.colorName,
        'Component': component.component,
        'Usage': component.usage
      });
    });
  });

  // Create workbook
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Color BOM');

  // Write file
  XLSX.writeFile(workbook, filename);
  
  return exportData.length;
}

/**
 * Export measurements to Excel
 */
export function exportMeasurementsToExcel(measurements, filename = 'measurements.xlsx') {
  if (!measurements || measurements.length === 0) {
    throw new Error('No measurements data to export');
  }

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(measurements);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Measurements');

  // Write file
  XLSX.writeFile(workbook, filename);
}

/**
 * Export all data to Excel with multiple sheets
 */
export function exportAllDataToExcel(data, filename = 'columbia_specification.xlsx') {
  const { trims, colorBOM, measurements } = data;
  const workbook = XLSX.utils.book_new();

  // Add Trims sheet
  if (trims && trims.length > 0) {
    const exportData = [];
    trims.forEach(trim => {
      if (trim.suppliers && trim.suppliers.length > 0) {
        trim.suppliers.forEach(supplier => {
          exportData.push({
            'Number': trim.number,
            'Description': trim.description,
            'UM': trim.um,
            'Fiber Content': trim.fiberContent,
            'Fiber Content Back': trim.fiberContentBack,
            'Material Coating': trim.materialCoating,
            'Material Finish (Face)': trim.materialFinish,
            'Material Laminate': trim.materialLaminate,
            'Trim Specific': trim.trimSpecific,
            'Supplier Name': supplier.name,
            'Art No': supplier.artNo,
            'Country': supplier.country,
            'Standard Cost (FOB)': supplier.standardCostFOB,
            'Purchase Cost (CIF)': supplier.purchaseCostCIF,
            'Lead Time With Greige': supplier.leadTimeWithGreige,
            'Lead Time Without Greige': supplier.leadTimeWithoutGreige
          });
        });
      }
    });

    if (exportData.length > 0) {
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Trims');
    }
  }

  // Add Color BOM sheet
  if (colorBOM && colorBOM.length > 0) {
    const exportData = [];
    colorBOM.forEach(color => {
      color.components.forEach(component => {
        exportData.push({
          'Color': color.colorName,
          'Component': component.component,
          'Usage': component.usage
        });
      });
    });

    if (exportData.length > 0) {
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Color BOM');
    }
  }

  // Add Measurements sheet
  if (measurements && measurements.length > 0) {
    const worksheet = XLSX.utils.json_to_sheet(measurements);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Measurements');
  }

  // Write file
  XLSX.writeFile(workbook, filename);
  
  return {
    trims: trims?.length || 0,
    colorBOM: colorBOM?.length || 0,
    measurements: measurements?.length || 0
  };
}

/**
 * Export to CSV
 */
export function exportToCSV(data, filename = 'data.csv') {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  // Convert to CSV
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => {
      const value = row[header];
      // Escape commas and quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value || '';
    }).join(','))
  ].join('\n');

  // Download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

/**
 * Create compact trim summary (one row per trim with combined suppliers)
 */
export function createCompactTrimExport(trims) {
  const exportData = trims.map(trim => ({
    'Number': trim.number,
    'Description': trim.description,
    'UM': trim.um,
    'Fiber Content': trim.fiberContent,
    'Fiber Content Back': trim.fiberContentBack,
    'Material Coating': trim.materialCoating,
    'Material Finish (Face)': trim.materialFinish,
    'Material Laminate': trim.materialLaminate,
    'Trim Specific': trim.trimSpecific,
    'Suppliers': trim.suppliers?.map(s => s.name).join('; ') || '',
    'Supplier Count': trim.suppliers?.length || 0
  }));

  return exportData;
}

