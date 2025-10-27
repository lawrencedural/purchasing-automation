# Testing Guide - Columbia Specification Parser

## 🚀 Complete Test Workflow

Follow these steps to test the Columbia spec parsing functionality.

---

## Step 1: Set Up Database

### Create Database

```bash
# Open PostgreSQL command line
psql -U postgres

# Create database
CREATE DATABASE trim_ordering_automation;

# Exit
\q
```

### Run Schema

```bash
# From project root
psql -U postgres -d trim_ordering_automation -f database/columbia_spec_schema.sql
```

### Verify Tables

```bash
psql -U postgres -d trim_ordering_automation

# Check tables
\dt columbia_*

# You should see:
# columbia_specifications
# columbia_spec_trims
# columbia_spec_suppliers
# columbia_spec_color_bom
# columbia_spec_measurements
# columbia_spec_files
# columbia_spec_exports
# columbia_spec_parsing_logs
```

---

## Step 2: Install Frontend Dependencies

```bash
cd frontend
npm install
```

This installs:
- React dependencies
- PDF parsing libraries
- File handling utilities

---

## Step 3: Set Up Backend

### Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

Ensure these are installed:
- `fastapi`
- `uvicorn`
- `sqlalchemy`
- `psycopg2-binary`
- `pandas`
- `openpyxl`

### Create Database Connection

Create `backend/config/database.py`:

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:your_password@localhost:5432/trim_ordering_automation"
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### Update Backend main.py

Ensure your `backend/main.py` includes Columbia spec endpoints:

```python
from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from config.database import get_db
from services.columbia_spec_service import ColumbiaSpecService

app = FastAPI()

@app.get("/api/columbia/health")
async def health():
    return {"status": "ok"}

@app.post("/api/columbia/upload")
async def upload_specification(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload and parse Columbia specification"""
    try:
        service = ColumbiaSpecService(db)
        
        # Read file
        contents = await file.read()
        
        # Create specification record
        spec = service.create_specification(
            filename=f"spec_{file.filename}",
            original_filename=file.filename,
            file_type=file.content_type or "text/plain",
            file_size=len(contents)
        )
        
        # Parse file (you'll need to implement this based on your parser)
        # parsed_data = await parse_specification_file(contents)
        
        # Save parsed data
        # service.save_parsed_data(spec.id, parsed_data)
        
        return {
            "message": "File uploaded successfully",
            "spec_id": spec.id,
            "filename": file.filename
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/columbia/specifications")
async def list_specifications(db: Session = Depends(get_db)):
    """List all specifications"""
    service = ColumbiaSpecService(db)
    specs = service.list_specifications()
    return specs

@app.get("/api/columbia/specifications/{spec_id}")
async def get_specification(spec_id: int, db: Session = Depends(get_db)):
    """Get specification by ID"""
    service = ColumbiaSpecService(db)
    spec = service.get_specification(spec_id)
    if not spec:
        raise HTTPException(status_code=404, detail="Not found")
    return spec
```

---

## Step 4: Create Test Data

Create a test specification file: `test_data/columbia_spec_sample.txt`

```
Part Specifications with Approved Suppliers

111730  43mm x 20.0mm Mountain Over Columbia Woven Label with light starch
UM: ea
Fiber Content: unassigned
Trim Specific: Size UM: mm

Supplier: Nexgen Packaging Global
Art No: 111730
Country: unassigned
Standard Cost (FOB): 0.046
Purchase Cost (CIF): 0.0
Lead Time With Greige: 21
Lead Time Without Greige: 28

112296  Different Component for Testing
UM: ea
Fiber Content: 100% Polyester

Supplier: FGV - Madison 88 (MSO)
Art No: 112296-1
Country: USA

Supplier: FGV - MSO - PT Kewalram
Art No: 112296-2
Country: Malaysia

Color BOM

Columbia Blue
- Main Label: Center back
- Care Label: Sewn in side seam

Black
- Main Label: Center back
- Care Label: Sewn in side seam

Measurements

Chest Width: 52cm
Sleeve Length: 65cm
```

---

## Step 5: Start Backend Server

```bash
cd backend
python main.py
```

Or use the provided script:

```bash
start_backend.bat
```

Backend should start at: `http://localhost:8000`

### Test Backend Endpoint

```bash
# Test health endpoint
curl http://localhost:8000/api/columbia/health

# Expected response:
# {"status":"ok"}
```

---

## Step 6: Start Frontend

```bash
cd frontend
npm run dev
```

Frontend should start at: `http://localhost:3000`

---

## Step 7: Test Columbia Spec Parser in UI

### Option A: Add Columbia Spec Step to Existing App

Update `frontend/src/App.jsx`:

```javascript
import { ColumbiaSpecStep } from './components/ColumbiaSpecStep';

// In your steps array, add:
{ id: 8, title: 'Columbia Spec Parser', icon: FileText }

// In render section:
{currentStep === 8 && <ColumbiaSpecStep />}
```

### Option B: Create Standalone Test Page

Create `frontend/src/test-columbia.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Columbia Spec Parser Test</title>
    <script type="module" src="/src/components/ColumbiaSpecStep.jsx"></script>
</head>
<body>
    <div id="root"></div>
</body>
</html>
```

---

## Step 8: Test File Upload

### Upload Test File

1. Open browser: `http://localhost:3000`
2. Navigate to Columbia Spec Parser step
3. Upload `test_data/columbia_spec_sample.txt`
4. Wait for parsing to complete
5. Verify data displays correctly

### Expected Results

You should see:
- ✅ **Statistics**: Trims count, Suppliers count, Colors count
- ✅ **Trims Table**: With number, description, UM, suppliers
- ✅ **Color BOM Tab**: Color assignments
- ✅ **Measurements Tab**: Measurement data
- ✅ **Export Buttons**: Available

---

## Step 9: Test Export Functionality

1. Click "Export All Data" button
2. Check Downloads folder for Excel file
3. Open file and verify:
   - Multiple sheets (Trims, Color BOM, Measurements)
   - Data is correctly formatted
   - All suppliers are included

### Expected Excel File Structure

```
📁 columbia_specification.xlsx
├── 📄 Trims (Sheet 1)
│   Columns: Number, Description, UM, Supplier Name, Art No, Country, etc.
├── 📄 Color BOM (Sheet 2)
│   Columns: Color, Component, Usage
└── 📄 Measurements (Sheet 3)
    Columns: Key, Value, Unit
```

---

## Step 10: Test Database Integration

### Check Database

```bash
psql -U postgres -d trim_ordering_automation

# Check specifications
SELECT id, filename, status, total_trims, total_suppliers FROM columbia_specifications;

# Check trims
SELECT id, spec_id, number, description FROM columbia_spec_trims;

# Check suppliers
SELECT id, trim_id, name, art_no, country FROM columbia_spec_suppliers;

# Check color BOM
SELECT id, spec_id, color_name, component_name FROM columbia_spec_color_bom;
```

### Expected Database State

```sql
-- After upload, you should see:
columbia_specifications: 1 record
columbia_spec_trims: 2 records (111730, 112296)
columbia_spec_suppliers: 3 records (1 for 111730, 2 for 112296)
columbia_spec_color_bom: 4 records (2 colors × 2 components)
columbia_spec_measurements: 2 records
```

---

## Step 11: Test API Endpoints

### List Specifications

```bash
curl http://localhost:8000/api/columbia/specifications
```

### Get Specific Specification

```bash
curl http://localhost:8000/api/columbia/specifications/1
```

### Get Trims with Suppliers

```bash
curl http://localhost:8000/api/columbia/specifications/1/trims
```

---

## 🧪 Test Checklist

### Frontend Tests

- [ ] File upload works (drag & drop)
- [ ] File upload works (click to browse)
- [ ] Parsing completes successfully
- [ ] Statistics display correctly
- [ ] Trims tab shows data
- [ ] Color BOM tab shows data
- [ ] Measurements tab shows data
- [ ] Export to Excel works
- [ ] Export creates valid Excel file
- [ ] Excel file has correct structure

### Backend Tests

- [ ] Backend starts without errors
- [ ] Database connection works
- [ ] API endpoints respond
- [ ] File upload endpoint works
- [ ] Data saves to database
- [ ] Data retrieves from database

### Database Tests

- [ ] Tables created successfully
- [ ] Data inserts correctly
- [ ] Foreign keys work
- [ ] Indexes exist
- [ ] Triggers fire
- [ ] Views return data

---

## 🐛 Troubleshooting

### Error: "Cannot find module"

```bash
# Reinstall dependencies
cd frontend
rm -rf node_modules
npm install
```

### Error: "Database connection failed"

```bash
# Check PostgreSQL is running
pg_isready

# Check connection string
echo $DATABASE_URL
```

### Error: "Parser not found"

- Ensure `specParser.js` is in `frontend/src/parsers/`
- Check import paths are correct

### Error: "Component not found"

- Ensure `ColumbiaSpecStep.jsx` is in `frontend/src/components/`
- Check import in App.jsx

---

## 📊 Expected Console Output

### Backend Console

```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     127.0.0.1:xxxxx - "POST /api/columbia/upload HTTP/1.1" 200
```

### Frontend Console

```
✓ Parsed 2 trims
✓ Found 3 suppliers
✓ Generated Excel file
✓ Download successful
```

---

## 🎯 Success Criteria

Your implementation is working if:

✅ Upload file → Parser runs → Data displayed in tables  
✅ Database has records → Data persists  
✅ Export creates Excel → File opens correctly  
✅ All tabs show data → Trims, BOM, Measurements  
✅ No console errors → Clean execution  

---

## 🚀 Next Steps After Testing

1. Add error handling for malformed files
2. Add progress indicator for large files
3. Add file validation
4. Add search/filter functionality
5. Add pagination for large datasets
6. Add data validation rules

---

## 📝 Test Report Template

Create `test-results.md`:

```markdown
# Columbia Spec Parser Test Results

Date: [Today's Date]

## Test Environment
- Frontend: Running on http://localhost:3000
- Backend: Running on http://localhost:8000
- Database: PostgreSQL (trim_ordering_automation)

## Test Results

### File Upload
- [ ] Pass/Fail
- Notes: 

### Parsing
- [ ] Pass/Fail
- Notes:

### Data Display
- [ ] Pass/Fail
- Notes:

### Export
- [ ] Pass/Fail
- Notes:

### Database Integration
- [ ] Pass/Fail
- Notes:

## Issues Found
1. 
2. 
3. 

## Overall Result: ✅ PASS / ❌ FAIL
```

---

**Now you're ready to test the Columbia spec parser! Follow the steps above and verify everything works.**

