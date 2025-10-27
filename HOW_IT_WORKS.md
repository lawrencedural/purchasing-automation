# How the Trim Ordering Automation System Works - Step-by-Step Guide

## 📋 Overview

The system is a **web-based application** that automates your trim ordering workflow through 7 sequential steps. It runs in your browser (React frontend) and communicates with a Python backend API when needed.

---

## 🔄 Complete Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                          │
│  (Browser running http://localhost:3000)                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Step by Step
                              │ User Actions
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: Initial Checks                                         │
│   • User checks fees/cuts approval checkbox                     │
│   • Selects buy-file option from dropdown                       │
│   • Data saved in browser memory                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Next Step
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: Upload PO Schedule                                     │
│   • User drags & drops Excel/CSV file                          │
│   • Frontend parses file locally (NO backend call)               │
│   • File data stored in workflowData.poSchedule                 │
│   • Also copied to workflowData.ngData                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Next Step
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: NG Data Processing                                     │
│   • Display uploaded data in table                              │
│   • User types in search box                                   │
│   • JavaScript filters data in real-time (frontend only)         │
│   • User clicks "Use Filtered Data"                            │
│   • Results stored in workflowData.filteredData                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Next Step
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: Trim Summary                                           │
│   • User types buyer style number                              │
│   • Clicks "+ Add" or presses Enter                             │
│   • Number added to array: workflowData.trimSummary              │
│   • Can add multiple style numbers                             │
│   • Can delete with X button                                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Next Step
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 5: Tech Pack Entry                                        │
│   • User fills form fields:                                    │
│     - Component material                                       │
│     - Logo and logo color                                      │
│     - Main label and color                                     │
│     - Care label code & supplier                               │
│     - Hangtag code & supplier                                  │
│   • Clicks "Add Tech Pack Entry"                               │
│   • Entry added to workflowData.techPackData array              │
│   • Can add multiple entries                                   │
│   • Can delete entries from table                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Next Step
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 6: Generate Pivot                                         │
│   • User clicks "Generate Pivot Data"                          │
│   • JavaScript combines:                                        │
│     - Every buyer style number × Every tech pack entry          │
│   • Result: workflowData.pivotData (array of objects)          │
│   • Displays in scrollable table                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Next Step
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 7: Review & Export                                        │
│   • Display pivot data table                                   │
│   • User clicks "Export to Excel"                               │
│   • XLSX library creates Excel file in browser                  │
│   • File downloads automatically                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔍 Detailed Step-by-Step Process

### **STEP 1: Initial Checks**

**What Happens:**
1. Page loads with Step 1 shown
2. User sees a checkbox: "Fees or cuts have been checked and approved"
3. User sees a dropdown: "Buy-File Option Evaluation"
4. User checks checkbox (sets `feesApproved: true`)
5. User selects from dropdown (sets `buyFileOption: "proceed"`)
6. When both are filled, green success message appears

**Data Flow:**
```javascript
// User clicks checkbox
feesApproved: false → true

// User selects from dropdown
buyFileOption: "" → "proceed"

// State update triggers re-render
workflowData = {
  feesApproved: true,
  buyFileOption: "proceed",
  // ... other data
}
```

**User Action:** Click "Next Step" button

---

### **STEP 2: Upload PO Schedule**

**What Happens:**
1. Page shows drag-and-drop upload area
2. User drags Excel file or clicks "Browse Files"
3. **File selected event fires**
4. Browser reads file using FileReader API
5. File content is read as binary string
6. **XLSX library parses the Excel file** (in browser, no API call)
7. Converts to JavaScript objects/arrays
8. Each row becomes an object with column headers as keys
9. Data stored in `workflowData.poSchedule` and `workflowData.ngData`

**Example Data Structure:**
```javascript
poSchedule: [
  {
    "PO Number": "PO-2024-001",
    "Style Number": "ST-2024-ABC",
    "Quantity": "1000",
    "Delivery Date": "2024-02-01"
  },
  // ... more rows
]
```

**Technical Details:**
- If CSV file → Uses PapaParse library
- If Excel file → Uses XLSX library
- Both parse **client-side** (no backend needed)

**User Action:** Click "Next Step"

---

### **STEP 3: NG Data Processing**

**What Happens:**
1. Page displays uploaded data in a table
2. **Search input field** appears at top
3. User types search term (e.g., "ST-2024")
4. **Real-time filtering** occurs:
   - JavaScript runs every keystroke
   - Searches through ALL values in ALL columns
   - Converts to lowercase for comparison
   - Shows only matching rows
5. Filtered results shown in table (max 10 rows)
6. User clicks "Use Filtered Data" button
7. Filtered data copied to `workflowData.filteredData`

**Search Implementation:**
```javascript
// User types in search box
const searchTerm = "ST-2024"

// Filter runs
const filtered = workflowData.ngData.filter(row => {
  // Join all values into one string
  const values = Object.values(row).join(' ').toLowerCase()
  // Check if search term is in string
  return values.includes(searchTerm.toLowerCase())
})

// Only matching rows displayed
setFiltered(filtered)
```

**User Action:** Click "Next Step"

---

### **STEP 4: Create Trim Summary**

**What Happens:**
1. Page shows input field for buyer style numbers
2. User types a style number (e.g., "ST-2024-ABC")
3. User clicks "+ Add" or presses Enter key
4. Style number added to array: `workflowData.trimSummary.buyerStyleNumbers`
5. Number appears as a chip/badge with X button
6. User can add more numbers
7. User can delete numbers by clicking X

**Data Structure:**
```javascript
trimSummary: {
  buyerStyleNumbers: [
    "ST-2024-ABC",
    "ST-2024-DEF",
    "ST-2024-GHI"
  ],
  components: []
}
```

**User Action:** Click "Next Step"

---

### **STEP 5: Tech Pack Data Entry**

**What Happens:**
1. Page shows a form with 10 input fields:
   - Component Material
   - Logo
   - Logo Color
   - Main Label
   - Main Label Color
   - Care Label Code
   - Care Label Supplier
   - Hangtag Code
   - Hangtag Supplier
2. User fills in the fields
3. User clicks "Add Tech Pack Entry"
4. Form data added to array: `workflowData.techPackData`
5. Form fields cleared
6. Entry appears in table below
7. User can add more entries
8. User can delete entries

**Data Structure:**
```javascript
techPackData: [
  {
    componentMaterial: "Cotton",
    logo: "Brand Logo",
    logoColor: "Black",
    mainLabel: "Main Label",
    mainLabelColor: "White",
    careLabelCode: "CARE-001",
    careLabelSupplier: "Supplier Co.",
    hangtagCode: "HT-001",
    hangtagSupplier: "Tag Supplier Co."
  },
  // ... more entries
]
```

**User Action:** Click "Next Step"

---

### **STEP 6: Generate Pivot**

**What Happens:**
1. Page shows summary: X style numbers × Y tech pack entries
2. User clicks "Generate Pivot Data" button
3. **JavaScript loops through combinations:**
   ```javascript
   for each tech pack entry:
     for each buyer style number:
       create pivot row
   ```
4. Each combination creates one pivot row
5. Pivot data stored in `workflowData.pivotData` array
6. Results displayed in scrollable table

**Example Generation:**
```javascript
// Input:
buyerStyleNumbers: ["ST-001", "ST-002"]
techPackData: [
  { material: "Cotton", supplier: "Company A" },
  { material: "Polyester", supplier: "Company B" }
]

// Output (2 × 2 = 4 pivot rows):
pivotData: [
  { styleNumber: "ST-001", material: "Cotton", supplier: "Company A" },
  { styleNumber: "ST-001", material: "Polyester", supplier: "Company B" },
  { styleNumber: "ST-002", material: "Cotton", supplier: "Company A" },
  { styleNumber: "ST-002", material: "Polyester", supplier: "Company B" }
]
```

**User Action:** Click "Next Step"

---

### **STEP 7: Review & Export**

**What Happens:**
1. Page shows summary statistics (boxes with numbers)
2. User reviews final pivot data table
3. User clicks "Export to Excel" button
4. **XLSX library creates Excel file:**
   - Converts JavaScript array to Excel format
   - Creates worksheet named "Pivot Data"
   - Formats as table
5. Browser triggers download
6. File saves as `trim_order_pivot.xlsx`
7. User can open in Excel

**Export Process:**
```javascript
// JavaScript creates Excel file in browser
const worksheet = XLSX.utils.json_to_sheet(pivotData)
const workbook = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(workbook, worksheet, 'Pivot Data')
XLSX.writeFile(workbook, 'trim_order_pivot.xlsx')
```

**Result:** Excel file downloaded to user's Downloads folder

---

## 💾 Data Storage & Persistence

### **Where Data is Stored**

1. **Browser Memory (State)**
   - Data stays in React state while app is running
   - Lost when page is closed

2. **LocalStorage (Permanent)**
   - Click "Save Progress" button → Saves to browser storage
   - Automatically loads when page refreshes
   - Persists across browser sessions
   - Cleared only when user clears browser data

### **Save/Load Process**

```javascript
// Save button clicked
localStorage.setItem('trimOrderingWorkflow', JSON.stringify(workflowData))
// Data saved to browser storage

// Page loads
const saved = localStorage.getItem('trimOrderingWorkflow')
if (saved) {
  setWorkflowData(JSON.parse(saved))
}
// Data loaded from browser storage
```

---

## 🔄 Backend vs Frontend Processing

### **Frontend-Only Processing** (No API Calls)
These happen entirely in the browser:
- ✅ File parsing (Excel/CSV)
- ✅ Data filtering/search
- ✅ Form input handling
- ✅ Pivot generation
- ✅ Excel export
- ✅ LocalStorage operations

### **Backend API** (Not Currently Used in Main Flow)
The backend API exists for future use:
- File upload processing (optional)
- Advanced data processing
- Database storage (optional)
- Multi-user support

**Current Implementation:** Most processing is done **client-side** for speed and simplicity.

---

## 🎨 UI/UX Flow

### **Progress Tracker**
Shows all 7 steps at top of page:
- ✅ Green checkmark = Step completed
- 🔵 Blue highlight = Current step
- ⚪ Gray = Future step

### **Navigation**
- "Previous Step" button: Goes back (disabled on step 1)
- "Next Step" button: Advances (disabled on step 7)
- Progress bar: Shows percentage complete

### **Feedback**
- Toast notifications for all actions
- Success messages (green)
- Error messages (red)
- Loading states

---

## 🔧 Technical Architecture

```
User's Browser
├── React Application (localhost:3000)
│   ├── App.jsx (Main component with all steps)
│   ├── State Management (useState hooks)
│   ├── File Processing (XLSX, PapaParse)
│   ├── Data Filtering (JavaScript)
│   ├── Pivot Generation (JavaScript)
│   ├── Excel Export (XLSX library)
│   └── LocalStorage (browser persistence)
│
└── Backend API (localhost:8000) - Optional
    ├── FastAPI (Python)
    ├── File Upload Endpoints
    ├── Data Processing
    └── Database Storage
```

---

## 📊 Data Flow Summary

```
Step 1: User input → State: feesApproved, buyFileOption
Step 2: File upload → Parse → State: poSchedule, ngData
Step 3: Search → Filter → State: filteredData
Step 4: Add numbers → State: trimSummary.buyerStyleNumbers
Step 5: Form entry → State: techPackData (array)
Step 6: Generate → Combine → State: pivotData
Step 7: Review → Export → Download Excel file
```

---

## 🎯 Key Features Explained

### **Why Client-Side Processing?**
- ✅ **Fast**: No network delay
- ✅ **Responsive**: Immediate feedback
- ✅ **Secure**: Data never leaves browser (until export)
- ✅ **Simple**: No backend required for core features

### **Why LocalStorage?**
- ✅ **Persistence**: Work survives page refresh
- ✅ **Quick**: Instant save/load
- ✅ **Free**: No database needed
- ✅ **Private**: Data stays on user's machine

### **Why Step-by-Step Workflow?**
- ✅ **Guided**: User knows what to do next
- ✅ **Reduces errors**: Can't skip validation
- ✅ **Progress tracking**: Visual progress bar
- ✅ **Easy to understand**: Clear progression

---

## 🚀 Getting Started

1. **Start Backend** (if using API features)
   ```bash
   cd backend
   python main.py
   ```

2. **Start Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open Browser**
   ```
   http://localhost:3000
   ```

4. **Begin Workflow**
   - Click checkboxes and dropdowns
   - Upload files
   - Fill in forms
   - Export results

---

## 📝 Summary

The system is a **client-side React application** that:
- Processes files in the browser
- Stores data in browser memory and localStorage
- Generates pivot data by combining inputs
- Exports results to Excel
- Provides a guided 7-step workflow
- Requires no database or backend for core features

**Everything happens in the browser** for speed, security, and simplicity!

---

**The system is ready to use now. Just start the servers and open in your browser!**

