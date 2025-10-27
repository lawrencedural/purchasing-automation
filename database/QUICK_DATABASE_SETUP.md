# Quick Database Setup Guide

## 🚀 Setup Steps

### 1. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE trim_ordering_automation;

# Exit
\q
```

### 2. Run Schema

```bash
# Run the schema file
psql -U postgres -d trim_ordering_automation -f database/columbia_spec_schema.sql
```

**OR using Docker:**

```bash
# Add to docker-compose.yml volumes:
volumes:
  - ./database/columbia_spec_schema.sql:/docker-entrypoint-initdb.d/columbia_spec.sql
```

### 3. Verify Tables Created

```sql
\c trim_ordering_automation

-- List tables
\dt columbia_*

-- Check structure
\d columbia_specifications
\d columbia_spec_trims
\d columbia_spec_suppliers
```

## 📊 Table Hierarchy

```
columbia_specifications (Parent)
├── columbia_spec_trims
│   └── columbia_spec_suppliers (multiple per trim)
├── columbia_spec_color_bom
├── columbia_spec_measurements
├── columbia_spec_files
├── columbia_spec_exports
└── columbia_spec_parsing_logs
```

## ✅ Quick Tests

### Test Insert

```sql
-- Insert test specification
INSERT INTO columbia_specifications 
(filename, original_filename, file_type, status) 
VALUES ('test.txt', 'Test File.txt', 'txt', 'uploaded');

-- Get the ID (will be 1 for first record)
SELECT id FROM columbia_specifications WHERE filename = 'test.txt';

-- Insert test trim
INSERT INTO columbia_spec_trims 
(spec_id, number, description, um) 
VALUES (1, '111730', 'Test Label', 'ea');

-- Insert test supplier
INSERT INTO columbia_spec_suppliers 
(trim_id, name, art_no, country) 
VALUES (1, 'Test Supplier', '12345', 'USA');
```

### Test Query

```sql
-- Get all data
SELECT 
    s.filename,
    t.number,
    t.description,
    sup.name as supplier
FROM columbia_specifications s
JOIN columbia_spec_trims t ON s.id = t.spec_id
JOIN columbia_spec_suppliers sup ON t.id = sup.trim_id;
```

### Test Views

```sql
-- Use summary view
SELECT * FROM v_spec_summary;

-- Use trims with suppliers view
SELECT * FROM v_trims_with_suppliers;
```

## 🔧 Common Operations

### Get All Trims with Suppliers

```sql
SELECT 
    t.number,
    t.description,
    sup.name,
    sup.art_no
FROM columbia_spec_trims t
LEFT JOIN columbia_spec_suppliers sup ON t.id = sup.trim_id
WHERE t.spec_id = 1;
```

### Count Suppliers Per Trim

```sql
SELECT 
    t.number,
    t.description,
    COUNT(s.id) as supplier_count
FROM columbia_spec_trims t
LEFT JOIN columbia_spec_suppliers s ON t.id = s.trim_id
GROUP BY t.id;
```

### Find All Specifications

```sql
SELECT 
    id,
    filename,
    status,
    total_trims,
    total_suppliers,
    upload_date
FROM columbia_specifications
ORDER BY upload_date DESC;
```

## 🎯 Next Steps

1. ✅ Database created
2. ✅ Schema loaded
3. ✅ Tables verified
4. ⏭️ Connect backend (use models in `backend/models/columbia_spec.py`)
5. ⏭️ Test with sample data
6. ⏭️ Integrate with API

## 💡 Tips

- Use `ON DELETE CASCADE` to auto-delete related records
- All indexes are already created for performance
- Triggers auto-update timestamps
- Views provide easy access to combined data

