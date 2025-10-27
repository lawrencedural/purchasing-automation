/**
 * Columbia Sportswear Specification Parser
 * Parses specification documents and extracts trim/component data
 */

export class SpecParser {
  constructor(text) {
    this.text = text;
    this.lines = text.split('\n');
    this.trims = [];
    this.colorBOM = [];
    this.measurements = [];
  }

  /**
   * Main parsing function
   */
  parse() {
    const result = {
      trims: [],
      colorBOM: [],
      measurements: []
    };

    // Parse different sections
    result.trims = this.parsePartSpecifications();
    result.colorBOM = this.parseColorBOM();
    result.measurements = this.parseMeasurements();

    return result;
  }

  /**
   * Parse "Part Specifications with Approved Suppliers" section
   */
  parsePartSpecifications() {
    const trims = [];
    let currentTrim = null;
    let inPartSpecs = false;
    let inSection = false;

    console.log('Starting parsePartSpecifications...');
    console.log('Total lines:', this.lines.length);

    // Process all lines
    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i].trim();
      
      // Skip empty lines
      if (!line) continue;

      // Look for section markers
      if (line.toLowerCase().includes('part specifications')) {
        inSection = true;
        console.log('Found Part Specifications section');
        continue;
      }

      // Look for trim number patterns - be more flexible
      const trimMatch = line.match(/^(\d{5,7})\s+(.+)$/);
      if (trimMatch && (inSection || line.match(/\d{5,7}/))) {
        // Save previous trim if exists
        if (currentTrim) {
          trims.push(currentTrim);
        }
        
        // Start new trim
        currentTrim = {
          number: trimMatch[1],
          description: trimMatch[2],
          um: '',
          fiberContent: '',
          fiberContentBack: '',
          materialCoating: '',
          materialFinish: '',
          materialLaminate: '',
          trimSpecific: '',
          suppliers: []
        };
        console.log('Found trim:', currentTrim.number);
        continue;
      }

      // If we're in a trim section, parse details
      if (currentTrim) {
        // Parse trim details
        this.parseTrimDetail(line, currentTrim);
        
        // Parse supplier information
        this.parseSupplierInfo(line, currentTrim);

        // Check for new section (end of trims)
        if (line.toLowerCase().includes('color bom') || 
            line.toLowerCase().includes('measurements') ||
            line.toLowerCase().includes('end')) {
          break;
        }
      }
    }

    // Add last trim
    if (currentTrim) {
      trims.push(currentTrim);
    }

    console.log('Parsed trims:', trims.length);
    return trims;
  }

  /**
   * Parse trim detail lines
   */
  parseTrimDetail(line, trim) {
    // UM (Unit of Measurement)
    const umMatch = line.match(/UM:\s*(\w+)/i);
    if (umMatch) {
      trim.um = umMatch[1].trim();
      return;
    }

    // Fiber Content
    if (line.includes('Fiber Content:')) {
      trim.fiberContent = line.split('Fiber Content:')[1]?.trim() || '';
      return;
    }

    // Fiber Content Back
    if (line.includes('Fiber Content Back:')) {
      trim.fiberContentBack = line.split('Fiber Content Back:')[1]?.trim() || '';
      return;
    }

    // Material Coating
    if (line.includes('Material Coating:')) {
      trim.materialCoating = line.split('Material Coating:')[1]?.trim() || '';
      return;
    }

    // Material Finish
    if (line.includes('Material Finish')) {
      trim.materialFinish = line.split('Material Finish')[1]?.split(':')[1]?.trim() || '';
      return;
    }

    // Material Laminate
    if (line.includes('Material Laminate:')) {
      trim.materialLaminate = line.split('Material Laminate:')[1]?.trim() || '';
      return;
    }

    // Trim Specific (e.g., "Size UM: mm")
    if (line.includes('Size UM:')) {
      trim.trimSpecific = line.split('Size UM:')[1]?.trim() || '';
      return;
    }
  }

  /**
   * Parse supplier information
   */
  parseSupplierInfo(line, trim) {
    if (!trim) return;

    // Check if line starts with "Supplier:" or contains supplier keywords
    if (line.toLowerCase().includes('supplier:') || 
        (line.toLowerCase().includes('supplier') && line.length > 8 && !this.isHeader(line))) {
      
      // Extract supplier name
      let supplierName = line;
      if (line.includes(':')) {
        supplierName = line.split(':')[1]?.trim() || line.trim();
      }
      
      if (supplierName && !this.isHeader(line) && supplierName.length > 2) {
        console.log('Found supplier:', supplierName);
        trim.suppliers.push({
          name: supplierName,
          artNo: '',
          country: '',
          standardCostFOB: '',
          purchaseCostCIF: '',
          leadTimeWithGreige: '',
          leadTimeWithoutGreige: ''
        });
      }
    }

    // Parse detailed supplier info on subsequent lines
    if (trim.suppliers.length > 0) {
      const lastSupplier = trim.suppliers[trim.suppliers.length - 1];
      
      // Check for various formats
      if (line.toLowerCase().includes('art no')) {
        lastSupplier.artNo = this.extractValue(line, 'Art No');
        if (!lastSupplier.artNo) lastSupplier.artNo = this.extractValue(line, 'Art No:');
      }
      if (line.toLowerCase().includes('country')) {
        lastSupplier.country = this.extractValue(line, 'Country');
        if (!lastSupplier.country) lastSupplier.country = this.extractValue(line, 'Country:');
      }
      if (line.toLowerCase().includes('standard cost')) {
        lastSupplier.standardCostFOB = this.extractValue(line, 'Standard Cost');
      }
      if (line.toLowerCase().includes('purchase cost')) {
        lastSupplier.purchaseCostCIF = this.extractValue(line, 'Purchase Cost');
      }
      if (line.toLowerCase().includes('with greige')) {
        lastSupplier.leadTimeWithGreige = this.extractValue(line, 'With Greige');
      }
      if (line.toLowerCase().includes('without greige')) {
        lastSupplier.leadTimeWithoutGreige = this.extractValue(line, 'Without Greige');
      }
    }
  }

  /**
   * Helper to extract value after a label
   */
  extractValue(line, label) {
    const match = line.match(new RegExp(`${label}\\s*:?\\s*([^\\n]+)`, 'i'));
    return match ? match[1].trim() : '';
  }

  /**
   * Find section start
   */
  findSectionStart(sectionName) {
    for (let i = 0; i < this.lines.length; i++) {
      if (this.lines[i].includes(sectionName)) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Check if line is a new major section
   */
  isNewSection(line) {
    const majorSections = [
      'Color BOM',
      'Measurements',
      'Detail Sketches',
      'Technical drawings'
    ];
    
    return majorSections.some(section => line.includes(section));
  }

  /**
   * Check if line is a header
   */
  isHeader(line) {
    const headers = ['Number', 'Description', 'Supplier', 'Art No', 'Country', 'Cost', 'Lead Time'];
    return headers.some(header => line.trim().startsWith(header));
  }

  /**
   * Parse Color BOM section
   */
  parseColorBOM() {
    const colorBOM = [];
    const startIndex = this.findSectionStart('Color BOM');
    
    if (startIndex === -1) return colorBOM;

    let currentColor = null;

    for (let i = startIndex; i < this.lines.length; i++) {
      const line = this.lines[i].trim();
      
      // Check for color header
      if (line.match(/^[A-Z][a-z]+$/)) {
        if (currentColor) {
          colorBOM.push(currentColor);
        }
        currentColor = {
          colorName: line,
          components: []
        };
        continue;
      }

      // Parse component assignments
      if (currentColor && line.includes('-')) {
        const parts = line.split('-');
        if (parts.length >= 2) {
          currentColor.components.push({
            component: parts[0].trim(),
            usage: parts.slice(1).join('-').trim()
          });
        }
      }
    }

    if (currentColor) {
      colorBOM.push(currentColor);
    }

    return colorBOM;
  }

  /**
   * Parse Measurements section
   */
  parseMeasurements() {
    const measurements = [];
    const startIndex = this.findSectionStart('Measurements');
    
    if (startIndex === -1) return measurements;

    for (let i = startIndex; i < this.lines.length; i++) {
      const line = this.lines[i].trim();
      
      // Parse measurement data (example format)
      if (line.includes(':')) {
        const [key, value] = line.split(':').map(s => s.trim());
        if (key && value) {
          measurements.push({ key, value });
        }
      }
    }

    return measurements;
  }
}

/**
 * Parse uploaded text/PDF file
 */
export function parseSpecificationFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        console.log('File loaded, starting parse...');
        console.log('File size:', e.target.result.length, 'characters');
        
        const parser = new SpecParser(e.target.result);
        const result = parser.parse();
        
        console.log('Parse complete!');
        console.log('Result:', result);
        console.log('Trims found:', result.trims?.length || 0);
        console.log('Color BOM found:', result.colorBOM?.length || 0);
        console.log('Measurements found:', result.measurements?.length || 0);
        
        resolve(result);
      } catch (error) {
        console.error('Parse error:', error);
        reject(error);
      }
    };
    
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

/**
 * Parse PDF file (requires PDF.js or similar)
 */
export async function parsePDFFile(file) {
  // This would require PDF.js library
  // For now, we'll handle it as text
  return parseSpecificationFile(file);
}

