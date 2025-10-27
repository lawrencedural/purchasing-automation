# Columbia Sportswear Specification Integration

## Overview

This document explains how to integrate Columbia Sportswear specification parsing into your trim ordering automation system.

## New Features Added

### 1. Specification Parser (`frontend/src/parsers/specParser.js`)
- Parses Part Specifications with Approved Suppliers
- Extracts trim/component data with all columns
- Handles multiple suppliers per component
- Parses Color BOM section
- Parses Measurements section

### 2. Data Exporter (`frontend/src/utils/dataExporter.js`)
- Export trims with suppliers to Excel
- Export color BOM to Excel
- Export all data with multiple sheets
- Export to CSV format

## How to Use

### Option 1: Add as New Workflow Step

You can add Columbia spec parsing as an additional step in your existing workflow:

```javascript
// Add to your steps array in App.jsx
const steps = [
  { id: 1, title: 'Initial Checks', icon: CheckCircle2 },
  { id: 2, title: 'Upload PO Schedule', icon: Upload },
  { id: 3, title: 'NG Data Processing', icon: FileText },
  { id: 4, title: 'Trim Summary', icon: Download },
  { id: 5, title: 'Tech Pack Entry', icon: FileText },
  { id: 6, title: 'Generate Pivot', icon: Download },
  { id: 7, title: 'Review & Export', icon: Eye },
  { id: 8, title: 'Columbia Spec Parse', icon: FileText, mode: 'columbia' } // NEW
]
```

### Option 2: Create Separate Mode

Add a mode selector at the top of your app:

```javascript
function App() {
  const [mode, setMode] = useState('workflow'); // 'workflow' or 'columbia'
  
  return (
    <div>
      {/* Mode Selector */}
      <div className="mode-selector">
        <button onClick={() => setMode('workflow')}>Standard Workflow</button>
        <button onClick={() => setMode('columbia')}>Columbia Spec Parser</button>
      </div>
      
      {mode === 'workflow' && <WorkflowApp />}
      {mode === 'columbia' && <ColumbiaSpecApp />}
    </div>
  );
}
```

## Implementation Steps

### 1. Install New Dependencies

```bash
cd frontend
npm install pdf-parse pdf.js-dist
```

### 2. Add Columbia Spec Component

Create a new component in `src/components/ColumbiaSpecParser.jsx`:

```javascript
import React, { useState } from 'react';
import { parseSpecificationFile } from '../parsers/specParser';
import { exportAllDataToExcel } from '../utils/dataExporter';
import toast from 'react-hot-toast';

function ColumbiaSpecParser() {
  const [parsedData, setParsedData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (file) => {
    setIsLoading(true);
    try {
      const data = await parseSpecificationFile(file);
      setParsedData(data);
      toast.success('Specification parsed successfully!');
    } catch (error) {
      toast.error('Failed to parse specification: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    try {
      exportAllDataToExcel(parsedData, 'columbia_specification.xlsx');
      toast.success('Data exported successfully!');
    } catch (error) {
      toast.error('Export failed: ' + error.message);
    }
  };

  return (
    <div className="columbia-spec-parser">
      {/* File upload UI */}
      {/* Data display tables */}
      {/* Export button */}
    </div>
  );
}
```

### 3. Update State Management

Add Columbia spec data to your workflow state:

```javascript
const [workflowData, setWorkflowData] = useState({
  // ... existing state
  columbiaSpecs: {
    trims: [],
    colorBOM: [],
    measurements: []
  }
});
```

## Data Structure

### Parsed Trim Data
```javascript
{
  number: "111730",
  description: "43mm x 20.0mm Mountain Over Columbia Woven Label",
  um: "ea",
  fiberContent: "unassigned",
  suppliers: [
    {
      name: "Nexgen Packaging Global",
      artNo: "111730",
      country: "unassigned",
      standardCostFOB: "0.046",
      purchaseCostCIF: "0.0",
      leadTimeWithGreige: "21",
      leadTimeWithoutGreige: "28"
    }
  ]
}
```

### Export Format

The exporter creates an Excel file with:
- **Sheet 1: Trims** - All trim data with suppliers (one row per supplier)
- **Sheet 2: Color BOM** - Component assignments by color
- **Sheet 3: Measurements** - Measurement data

## Usage Example

```javascript
// Import the parser
import { parseSpecificationFile } from './parsers/specParser';
import { exportAllDataToExcel } from './utils/dataExporter';

// Parse a file
const file = // file from input
const data = await parseSpecificationFile(file);
// Returns: { trims: [...], colorBOM: [...], measurements: [...] }

// Export to Excel
exportAllDataToExcel(data, 'columbia_spec.xlsx');
```

## Features

### ✅ Multi-Supplier Support
Handles components with multiple approved suppliers:
- Component 112296 → 3 suppliers
- Component 077027 → 2 suppliers

### ✅ Complete Data Extraction
Extracts all required columns:
- Number, Description, UM
- Fiber Content (Front & Back)
- Material Coating, Finish, Laminate
- Trim Specific details
- Supplier information (name, art no, country, costs, lead times)

### ✅ Color BOM Parsing
Extracts:
- Color assignments
- Component usage
- Color-specific details

### ✅ Flexible Export
- Export individual sections
- Export all data with multiple sheets
- CSV format support

## Customization

### Modify Parser Logic

Edit `frontend/src/parsers/specParser.js` to adjust parsing logic for different document formats.

### Change Export Format

Edit `frontend/src/utils/dataExporter.js` to customize export columns or format.

### Add New Sections

To parse additional sections:

```javascript
parseCustomSection() {
  const customData = [];
  const startIndex = this.findSectionStart('Your Section Name');
  // ... parsing logic
  return customData;
}
```

## Testing

### Test with Sample Data

Create a test file with the expected format:

```
Part Specifications with Approved Suppliers

111730  43mm x 20.0mm Mountain Over Columbia Woven Label
UM: ea
Fiber Content: unassigned
Trim Specific: Size UM: mm

Suppliers:
Nexgen Packaging Global
Art No: 111730
Country: unassigned
Standard Cost (FOB): 0.046
Purchase Cost (CIF): 0.0
Lead Time With Greige: 21
Lead Time Without Greige: 28
```

### Expected Output

```json
{
  "trims": [
    {
      "number": "111730",
      "description": "43mm x 20.0mm Mountain Over Columbia Woven Label",
      "um": "ea",
      "fiberContent": "unassigned",
      "trimSpecific": "Size UM: mm",
      "suppliers": [
        {
          "name": "Nexgen Packaging Global",
          "artNo": "111730",
          "country": "unassigned",
          "standardCostFOB": "0.046",
          "purchaseCostCIF": "0.0",
          "leadTimeWithGreige": "21",
          "leadTimeWithoutGreige": "28"
        }
      ]
    }
  ]
}
```

## Next Steps

1. **Test the parser** with your Columbia spec documents
2. **Adjust parsing logic** if needed for your specific format
3. **Integrate into workflow** or use as standalone tool
4. **Customize export format** as needed
5. **Add validation** for parsed data

## Files Created

- ✅ `frontend/src/parsers/specParser.js` - Main parser logic
- ✅ `frontend/src/utils/dataExporter.js` - Export utilities
- ✅ Updated `frontend/package.json` - Added PDF parsing dependencies

## Integration Options

### Option A: Replace PO Upload Step
Replace Step 2 with Columbia spec parsing

### Option B: Add as Step 8
Add Columbia spec parsing as an additional step

### Option C: Separate Mode
Create a separate mode/tab for Columbia specs

Choose the option that best fits your workflow needs!

