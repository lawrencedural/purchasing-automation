# Quick Start - Test Columbia Spec Parser

## ⚡ Fastest Way to Test

### Option 1: Automated (Windows)

```bash
# Run the test script
test_columbia_spec.bat
```

This will:
- ✅ Check PostgreSQL
- ✅ Create database
- ✅ Load schema
- ✅ Start backend
- ✅ Start frontend

### Option 2: Manual Steps

#### 1. Set Up Database (One-Time)

```bash
# Create database
psql -U postgres -c "CREATE DATABASE trim_ordering_automation;"

# Run schema
psql -U postgres -d trim_ordering_automation -f database/columbia_spec_schema.sql
```

#### 2. Start Backend

```bash
cd backend
python main.py
```

Wait for: `INFO: Uvicorn running on http://0.0.0.0:8000`

#### 3. Start Frontend

Open new terminal:
```bash
cd frontend
npm run dev
```

Wait for: `ready in X ms` and URL `http://localhost:3000`

---

## 🧪 Test Now

### 1. Open Browser

Go to: `http://localhost:3000`

### 2. Upload Test File

Use: `test_data/sample_columbia_spec.txt`

**File contains:**
- ✅ 4 trim components
- ✅ 6 suppliers (multiple per trim)
- ✅ 3 color variants
- ✅ 8 measurements

### 3. Check Results

You should see:
- ✅ Statistics: 4 trims, 6 suppliers, 3 colors, 8 measurements
- ✅ Trims table with all components
- ✅ Suppliers listed under each trim
- ✅ Export button works

### 4. Export and Verify

1. Click "Export All Data"
2. Open downloaded Excel file
3. Check sheets:
   - Sheet 1: Trims (with suppliers)
   - Sheet 2: Color BOM
   - Sheet 3: Measurements

---

## 🔍 Quick Verification

### Check Database

```bash
psql -U postgres -d trim_ordering_automation

# Count records
SELECT 
    (SELECT COUNT(*) FROM columbia_specifications) as specs,
    (SELECT COUNT(*) FROM columbia_spec_trims) as trims,
    (SELECT COUNT(*) FROM columbia_spec_suppliers) as suppliers,
    (SELECT COUNT(*) FROM columbia_spec_color_bom) as colors,
    (SELECT COUNT(*) FROM columbia_spec_measurements) as measurements;
```

**Expected:**
```
specs: 1
trims: 4
suppliers: 6
colors: 6
measurements: 8
```

### Check Backend

```bash
curl http://localhost:8000/api/columbia/health
# Should return: {"status":"ok"}

curl http://localhost:8000/api/columbia/specifications
# Should return: Array of specifications
```

---

## 🎯 What Should Work

### ✅ Frontend

- File upload (drag & drop or browse)
- Data parsing and display
- Tab switching (Trims, Color BOM, Measurements)
- Export to Excel

### ✅ Backend

- Accept file upload
- Parse specification file
- Save to database
- Return data via API

### ✅ Database

- Store specifications
- Store trims with all fields
- Store suppliers (multiple per trim)
- Store color BOM
- Store measurements

---

## 🐛 If Something Doesn't Work

### Database Issues

```bash
# Check PostgreSQL is running
pg_isready

# Check database exists
psql -U postgres -l | grep trim_ordering

# Recreate database
dropdb -U postgres trim_ordering_automation
createdb -U postgres trim_ordering_automation
psql -U postgres -d trim_ordering_automation -f database/columbia_spec_schema.sql
```

### Frontend Issues

```bash
cd frontend
npm install  # Reinstall dependencies
npm run dev  # Restart
```

### Backend Issues

```bash
cd backend
pip install -r requirements.txt  # Reinstall dependencies
python main.py  # Restart
```

---

## 📊 Expected File Structure

```
test_data/
└── sample_columbia_spec.txt

database/
└── columbia_spec_schema.sql

frontend/
├── src/
│   ├── components/
│   │   └── ColumbiaSpecStep.jsx
│   ├── parsers/
│   │   └── specParser.js
│   └── utils/
│       └── dataExporter.js

backend/
├── models/
│   └── columbia_spec.py
└── services/
    └── columbia_spec_service.py
```

---

## ✅ Success Checklist

- [ ] Database created and schema loaded
- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] Test file uploaded successfully
- [ ] Data parsed and displayed
- [ ] Export creates Excel file
- [ ] Excel file opens correctly
- [ ] Database has correct records

---

## 🎉 You're Ready!

If everything above works, your Columbia spec parser is **fully functional**!

**Next:** Customize the parser for your specific specification format.

