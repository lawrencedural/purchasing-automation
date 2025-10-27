# Database Implementation Guide - Columbia Specifications

## 📊 Overview

This guide explains how to implement the database schema for storing Columbia Sportswear specification data.

## 📁 Files Created

1. ✅ `database/columbia_spec_schema.sql` - Complete PostgreSQL schema
2. ✅ `backend/models/columbia_spec.py` - SQLAlchemy ORM models
3. ✅ `backend/services/columbia_spec_service.py` - Service layer for data operations

## 🏗️ Database Schema Structure

### Core Tables

```
columbia_specifications (Parent)
├── columbia_spec_trims
│   └── columbia_spec_suppliers (N:M relationship)
├── columbia_spec_color_bom
├── columbia_spec_measurements
├── columbia_spec_files
├── columbia_spec_exports
└── columbia_spec_parsing_logs
```

## 🚀 Implementation Steps

### Step 1: Set Up Database

#### Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE trim_ordering_automation;

# Connect to database
\c trim_ordering_automation

# Run schema
\i database/columbia_spec_schema.sql
```

#### Or Using Docker

```bash
# Add to your docker-compose.yml
services:
  postgres:
    # ... existing config ...
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/columbia_spec_schema.sql:/docker-entrypoint-initdb.d/columbia_spec.sql
```

### Step 2: Configure Backend

#### Update Backend Requirements

Add to `backend/requirements.txt`:
```python
sqlalchemy==2.0.23
alembic==1.12.1
psycopg2-binary==2.9.9
```

#### Create Database Configuration

Create `backend/config/database.py`:

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://user:password@localhost:5432/trim_ordering_automation"
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """Dependency for getting database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### Step 3: Create Migration

```bash
cd backend

# Initialize Alembic (if not done)
alembic init migrations

# Create migration
alembic revision --autogenerate -m "Add Columbia spec tables"

# Apply migration
alembic upgrade head
```

### Step 4: Integrate with API

Update `backend/main.py`:

```python
from fastapi import FastAPI, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from models.columbia_spec import Base
from services.columbia_spec_service import ColumbiaSpecService
from parsers.specParser import parseSpecificationFile  # Your parser
import config.database as db

# Create tables
Base.metadata.create_all(bind=db.engine)

app = FastAPI()

@app.post("/api/columbia/upload")
async def upload_specification(
    file: UploadFile = File(...),
    db: Session = Depends(db.get_db)
):
    """Upload and parse Columbia specification"""
    try:
        # Save file temporarily
        contents = await file.read()
        
        # Create specification record
        service = ColumbiaSpecService(db)
        spec = service.create_specification(
            filename=file.filename,
            original_filename=file.filename,
            file_type=file.content_type,
            file_size=len(contents)
        )
        
        # Parse file
        parsed_data = parseSpecificationFile(contents)
        
        # Save parsed data
        service.save_parsed_data(spec.id, parsed_data)
        
        return {
            "message": "Specification uploaded and parsed successfully",
            "spec_id": spec.id,
            "filename": file.filename
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/columbia/specifications")
async def list_specifications(
    db: Session = Depends(db.get_db),
    limit: int = 100,
    offset: int = 0
):
    """List all specifications"""
    service = ColumbiaSpecService(db)
    specs = service.list_specifications(limit, offset)
    return specs

@app.get("/api/columbia/specifications/{spec_id}")
async def get_specification(
    spec_id: int,
    db: Session = Depends(db.get_db)
):
    """Get specification by ID"""
    service = ColumbiaSpecService(db)
    spec = service.get_specification(spec_id)
    if not spec:
        raise HTTPException(status_code=404, detail="Specification not found")
    return spec

@app.get("/api/columbia/specifications/{spec_id}/trims")
async def get_specification_trims(
    spec_id: int,
    db: Session = Depends(db.get_db)
):
    """Get trims with suppliers for a specification"""
    service = ColumbiaSpecService(db)
    trims = service.get_trims_with_suppliers(spec_id)
    return trims

@app.delete("/api/columbia/specifications/{spec_id}")
async def delete_specification(
    spec_id: int,
    db: Session = Depends(db.get_db)
):
    """Delete a specification"""
    service = ColumbiaSpecService(db)
    success = service.delete_specification(spec_id)
    if not success:
        raise HTTPException(status_code=404, detail="Specification not found")
    return {"message": "Specification deleted successfully"}
```

## 📊 Database Relationships

### One-to-Many

```
columbia_specifications (1) ──→ (many) columbia_spec_trims
columbia_specifications (1) ──→ (many) columbia_spec_color_bom
columbia_specifications (1) ──→ (many) columbia_spec_measurements
columbia_spec_trims (1) ──→ (many) columbia_spec_suppliers
```

### One-to-One

```
columbia_specifications (1) ──→ (1) columbia_spec_files
```

## 🔍 Sample Queries

### Get All Trims with Suppliers

```python
from sqlalchemy.orm import Session
from models.columbia_spec import ColumbiaTrim, ColumbiaSupplier

def get_trims_with_suppliers(db: Session, spec_id: int):
    trims = db.query(ColumbiaTrim).filter(
        ColumbiaTrim.spec_id == spec_id
    ).all()
    
    for trim in trims:
        trim.suppliers = db.query(ColumbiaSupplier).filter(
            ColumbiaSupplier.trim_id == trim.id
        ).all()
    
    return trims
```

### Search for Specific Trim Number

```python
def search_trim(db: Session, trim_number: str):
    return db.query(ColumbiaTrim).filter(
        ColumbiaTrim.number == trim_number
    ).first()
```

### Get Color BOM for Specific Color

```python
from models.columbia_spec import ColumbiaColorBOM

def get_color_bom(db: Session, spec_id: int, color_name: str):
    return db.query(ColumbiaColorBOM).filter(
        ColumbiaColorBOM.spec_id == spec_id,
        ColumbiaColorBOM.color_name == color_name
    ).all()
```

### Get Statistics

```python
from models.columbia_spec import ColumbiaSpecification

def get_statistics(db: Session, spec_id: int):
    spec = db.query(ColumbiaSpecification).filter(
        ColumbiaSpecification.id == spec_id
    ).first()
    
    return {
        "total_trims": spec.total_trims,
        "total_suppliers": spec.total_suppliers,
        "total_colors": spec.total_colors,
        "total_measurements": spec.total_measurements
    }
```

## 🔄 Data Flow

### Upload and Parse Flow

```
1. User uploads file
   ↓
2. Create specification record
   ↓
3. Parse file (frontend or backend)
   ↓
4. Save parsed data to database
   ↓
5. Update statistics
   ↓
6. Return success response
```

### Export Flow

```
1. User requests export
   ↓
2. Query database for data
   ↓
3. Generate Excel file
   ↓
4. Record export in database
   ↓
5. Return file
```

## 🎯 Key Features

### ✅ Multi-Supplier Support

Each trim can have multiple suppliers stored in separate rows:

```sql
-- Trim
id: 1, number: "111730", description: "Label A"

-- Suppliers
id: 1, trim_id: 1, name: "Supplier A"
id: 2, trim_id: 1, name: "Supplier B"
id: 3, trim_id: 1, name: "Supplier C"
```

### ✅ Statistics Tracking

Automatic statistics are maintained:
- Total trims
- Total suppliers
- Total colors
- Total measurements

### ✅ Export History

All exports are tracked:
```python
{
    "export_type": "all",
    "format": "xlsx",
    "record_count": 150,
    "exported_at": "2024-01-15"
}
```

### ✅ Error Logging

Parsing errors are logged for debugging:
```python
{
    "log_level": "error",
    "message": "Failed to parse trim",
    "line_number": 42
}
```

## 🧪 Testing

### Test Data Insertion

```python
# Create test specification
service = ColumbiaSpecService(db)
spec = service.create_specification(
    filename="test.txt",
    original_filename="Test Specification.txt",
    file_type="text/plain",
    file_size=1024
)

# Test parsed data
parsed_data = {
    "trims": [
        {
            "number": "111730",
            "description": "Test Label",
            "um": "ea",
            "suppliers": [
                {
                    "name": "Test Supplier",
                    "artNo": "123",
                    "country": "USA"
                }
            ]
        }
    ]
}

# Save
service.save_parsed_data(spec.id, parsed_data)

# Query
trims = service.get_trims_with_suppliers(spec.id)
assert len(trims) == 1
assert len(trims[0]['suppliers']) == 1
```

## 📈 Performance Considerations

### Indexes

All foreign keys and frequently queried fields are indexed:
- `idx_trim_number` on `number` (search by trim number)
- `idx_spec_status` on `status` (filter by status)
- `idx_supplier_name` on `name` (search suppliers)

### Query Optimization

Use eager loading to avoid N+1 queries:

```python
from sqlalchemy.orm import joinedload

trims = db.query(ColumbiaTrim).options(
    joinedload(ColumbiaTrim.suppliers)
).filter(
    ColumbiaTrim.spec_id == spec_id
).all()
```

## 🔐 Security

### Input Validation

```python
def validate_trim_data(data: dict) -> bool:
    required_fields = ['number', 'description']
    return all(field in data for field in required_fields)
```

### SQL Injection Prevention

SQLAlchemy ORM automatically prevents SQL injection:
```python
# ✅ Safe
db.query(ColumbiaTrim).filter(ColumbiaTrim.number == user_input)

# ❌ Never do this
db.execute(f"SELECT * FROM trims WHERE number = '{user_input}'")
```

## 📝 Next Steps

1. ✅ Run database schema setup
2. ✅ Install backend dependencies
3. ✅ Create database connection
4. ✅ Integrate with API
5. ✅ Test with sample data
6. ✅ Deploy to production

## 💡 Tips

- Use database transactions for batch operations
- Implement pagination for large result sets
- Add caching for frequently accessed data
- Monitor database performance
- Set up regular backups

---

**Your database is ready to store Columbia specification data!**

