-- Columbia Sportswear Specification Database Schema
-- PostgreSQL schema for storing parsed specification data

-- ============================================
-- 1. SPECIFICATIONS TABLE (Parent)
-- ============================================
-- Meta table for uploaded specification documents
CREATE TABLE IF NOT EXISTS columbia_specifications (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),  -- "txt", "pdf", etc.
    file_size INTEGER,  -- Size in bytes
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    parsed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'parsed',  -- 'parsed', 'error', 'processing'
    error_message TEXT,
    total_trims INTEGER DEFAULT 0,
    total_suppliers INTEGER DEFAULT 0,
    total_colors INTEGER DEFAULT 0,
    total_measurements INTEGER DEFAULT 0,
    created_by INTEGER,  -- User ID who uploaded
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_spec_upload_date ON columbia_specifications(upload_date);
CREATE INDEX idx_spec_status ON columbia_specifications(status);
CREATE INDEX idx_spec_filename ON columbia_specifications(filename);

-- ============================================
-- 2. TRIMS/COMPONENTS TABLE
-- ============================================
-- Main table for all trim components
CREATE TABLE IF NOT EXISTS columbia_spec_trims (
    id SERIAL PRIMARY KEY,
    spec_id INTEGER NOT NULL,
    number VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    um VARCHAR(20),
    fiber_content VARCHAR(255),
    fiber_content_back VARCHAR(255),
    material_coating VARCHAR(255),
    material_finish VARCHAR(255),
    material_laminate VARCHAR(255),
    trim_specific TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_spec FOREIGN KEY (spec_id) REFERENCES columbia_specifications(id) ON DELETE CASCADE
);

CREATE INDEX idx_trim_number ON columbia_spec_trims(number);
CREATE INDEX idx_trim_spec ON columbia_spec_trims(spec_id);
CREATE INDEX idx_trim_created ON columbia_spec_trims(created_at);

-- ============================================
-- 3. SUPPLIERS TABLE
-- ============================================
-- Stores all supplier information for each trim
CREATE TABLE IF NOT EXISTS columbia_spec_suppliers (
    id SERIAL PRIMARY KEY,
    trim_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    art_no VARCHAR(100),
    country VARCHAR(100),
    standard_cost_fob DECIMAL(10, 6),
    purchase_cost_cif DECIMAL(10, 6),
    lead_time_with_greige INTEGER,
    lead_time_without_greige INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_trim FOREIGN KEY (trim_id) REFERENCES columbia_spec_trims(id) ON DELETE CASCADE
);

CREATE INDEX idx_supplier_trim ON columbia_spec_suppliers(trim_id);
CREATE INDEX idx_supplier_name ON columbia_spec_suppliers(name);
CREATE INDEX idx_supplier_country ON columbia_spec_suppliers(country);

-- ============================================
-- 4. COLOR BOM TABLE
-- ============================================
-- Color Bill of Materials - component assignments per color
CREATE TABLE IF NOT EXISTS columbia_spec_color_bom (
    id SERIAL PRIMARY KEY,
    spec_id INTEGER NOT NULL,
    color_name VARCHAR(255) NOT NULL,  -- e.g., "Columbia Blue", "Black"
    component_name VARCHAR(255) NOT NULL,  -- Component reference
    usage_details TEXT,  -- Placement and usage information
    sap_material_code VARCHAR(100),  -- SAP Material Code
    quantity INTEGER,  -- Usage quantity if specified
    placement VARCHAR(255),  -- Placement information
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_spec_bom FOREIGN KEY (spec_id) REFERENCES columbia_specifications(id) ON DELETE CASCADE
);

CREATE INDEX idx_bom_spec ON columbia_spec_color_bom(spec_id);
CREATE INDEX idx_bom_color ON columbia_spec_color_bom(color_name);

-- ============================================
-- 5. MEASUREMENTS TABLE
-- ============================================
-- Stores measurement data from specification
CREATE TABLE IF NOT EXISTS columbia_spec_measurements (
    id SERIAL PRIMARY KEY,
    spec_id INTEGER NOT NULL,
    measurement_key VARCHAR(255) NOT NULL,  -- e.g., "Chest Width", "Sleeve Length"
    measurement_value VARCHAR(255),  -- e.g., "52cm", "65cm"
    unit VARCHAR(50),  -- e.g., "cm", "mm"
    size_variant VARCHAR(50),  -- e.g., "S", "M", "L", "XL"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_spec_measurements FOREIGN KEY (spec_id) REFERENCES columbia_specifications(id) ON DELETE CASCADE
);

CREATE INDEX idx_measurements_spec ON columbia_spec_measurements(spec_id);
CREATE INDEX idx_measurements_key ON columbia_spec_measurements(measurement_key);

-- ============================================
-- 6. SPECIFICATION FILES TABLE
-- ============================================
-- Stores the actual file content or file path
CREATE TABLE IF NOT EXISTS columbia_spec_files (
    id SERIAL PRIMARY KEY,
    spec_id INTEGER NOT NULL,
    file_path TEXT,  -- Path to stored file (or S3 URL)
    file_content BYTEA,  -- Binary file content (optional if storing in DB)
    storage_type VARCHAR(50) DEFAULT 'filesystem',  -- 'filesystem', 's3', 'database'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_spec_file FOREIGN KEY (spec_id) REFERENCES columbia_specifications(id) ON DELETE CASCADE,
    UNIQUE(spec_id)  -- One file per specification
);

CREATE INDEX idx_spec_file_spec ON columbia_spec_files(spec_id);

-- ============================================
-- 7. EXPORT HISTORY TABLE
-- ============================================
-- Track export operations
CREATE TABLE IF NOT EXISTS columbia_spec_exports (
    id SERIAL PRIMARY KEY,
    spec_id INTEGER,
    export_type VARCHAR(50),  -- 'all', 'trims', 'colorBOM', 'measurements'
    export_format VARCHAR(50),  -- 'xlsx', 'csv'
    filename VARCHAR(255),
    file_path TEXT,
    exported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    exported_by INTEGER,  -- User ID
    record_count INTEGER,  -- Number of records exported
    
    CONSTRAINT fk_spec_export FOREIGN KEY (spec_id) REFERENCES columbia_specifications(id) ON DELETE SET NULL
);

CREATE INDEX idx_export_spec ON columbia_spec_exports(spec_id);
CREATE INDEX idx_export_date ON columbia_spec_exports(exported_at);

-- ============================================
-- 8. PARSING ERRORS/LOG TABLE (Optional)
-- ============================================
-- Log parsing errors for debugging
CREATE TABLE IF NOT EXISTS columbia_spec_parsing_logs (
    id SERIAL PRIMARY KEY,
    spec_id INTEGER,
    log_level VARCHAR(20),  -- 'info', 'warning', 'error'
    message TEXT,
    line_number INTEGER,  -- Line number in file
    context TEXT,  -- Additional context
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_spec_log FOREIGN KEY (spec_id) REFERENCES columbia_specifications(id) ON DELETE CASCADE
);

CREATE INDEX idx_log_spec ON columbia_spec_parsing_logs(spec_id);
CREATE INDEX idx_log_level ON columbia_spec_parsing_logs(log_level);

-- ============================================
-- 9. VIEWS FOR EASY QUERIES
-- ============================================

-- View: Complete trim information with suppliers count
CREATE OR REPLACE VIEW v_trims_with_suppliers AS
SELECT 
    t.id,
    t.spec_id,
    t.number,
    t.description,
    t.um,
    t.fiber_content,
    t.trim_specific,
    COUNT(s.id) as supplier_count,
    s.name as suppliers,
    t.created_at
FROM columbia_spec_trims t
LEFT JOIN columbia_spec_suppliers s ON t.id = s.trim_id
GROUP BY t.id, s.name;

-- View: Specification summary
CREATE OR REPLACE VIEW v_spec_summary AS
SELECT 
    s.id,
    s.filename,
    s.upload_date,
    s.status,
    s.total_trims,
    s.total_suppliers,
    s.total_colors,
    s.total_measurements,
    COUNT(DISTINCT t.id) as actual_trim_count,
    COUNT(DISTINCT sup.id) as actual_supplier_count,
    COUNT(DISTINCT bom.id) as actual_color_count,
    COUNT(DISTINCT m.id) as actual_measurement_count
FROM columbia_specifications s
LEFT JOIN columbia_spec_trims t ON s.id = t.spec_id
LEFT JOIN columbia_spec_suppliers sup ON t.id = sup.trim_id
LEFT JOIN columbia_spec_color_bom bom ON s.id = bom.spec_id
LEFT JOIN columbia_spec_measurements m ON s.id = m.spec_id
GROUP BY s.id;

-- View: Supplier summary across all specifications
CREATE OR REPLACE VIEW v_supplier_summary AS
SELECT 
    sup.name,
    COUNT(DISTINCT sup.trim_id) as trim_count,
    COUNT(DISTINCT t.spec_id) as spec_count,
    sup.country,
    AVG(sup.standard_cost_fob) as avg_fob_cost,
    AVG(sup.purchase_cost_cif) as avg_cif_cost
FROM columbia_spec_suppliers sup
JOIN columbia_spec_trims t ON sup.trim_id = t.id
GROUP BY sup.name, sup.country;

-- ============================================
-- 10. FUNCTIONS AND TRIGGERS
-- ============================================

-- Function: Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger: Auto-update timestamps
CREATE TRIGGER update_columbia_spec_trims_updated_at 
    BEFORE UPDATE ON columbia_spec_trims 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_columbia_spec_suppliers_updated_at 
    BEFORE UPDATE ON columbia_spec_suppliers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_columbia_specifications_updated_at 
    BEFORE UPDATE ON columbia_specifications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: Count statistics after insert
CREATE OR REPLACE FUNCTION update_spec_statistics()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE columbia_specifications 
    SET 
        total_trims = (SELECT COUNT(*) FROM columbia_spec_trims WHERE spec_id = NEW.spec_id),
        total_suppliers = (SELECT COUNT(*) FROM columbia_spec_suppliers WHERE trim_id IN 
                          (SELECT id FROM columbia_spec_trims WHERE spec_id = NEW.spec_id)),
        total_colors = (SELECT COUNT(DISTINCT color_name) FROM columbia_spec_color_bom WHERE spec_id = NEW.spec_id),
        total_measurements = (SELECT COUNT(*) FROM columbia_spec_measurements WHERE spec_id = NEW.spec_id)
    WHERE id = NEW.spec_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- 11. SAMPLE QUERIES
-- ============================================

-- Get all trims with their suppliers
-- SELECT 
--     t.number,
--     t.description,
--     sup.name as supplier,
--     sup.art_no,
--     sup.country,
--     sup.standard_cost_fob,
--     sup.lead_time_with_greige
-- FROM columbia_spec_trims t
-- JOIN columbia_spec_suppliers sup ON t.id = sup.trim_id
-- WHERE t.spec_id = 1
-- ORDER BY t.number, sup.name;

-- Get all specifications with summary
-- SELECT * FROM v_spec_summary;

-- Search for specific trim number across all specs
-- SELECT 
--     t.number,
--     t.description,
--     s.filename,
--     sup.name as supplier
-- FROM columbia_spec_trims t
-- JOIN columbia_specifications s ON t.spec_id = s.id
-- JOIN columbia_spec_suppliers sup ON t.id = sup.trim_id
-- WHERE t.number LIKE '%112296%';

-- Get all colors and their components
-- SELECT 
--     bom.color_name,
--     bom.component_name,
--     bom.usage_details,
--     t.description
-- FROM columbia_spec_color_bom bom
-- LEFT JOIN columbia_spec_trims t ON bom.component_name = t.number
-- WHERE bom.spec_id = 1;

-- ============================================
-- 12. INITIAL DATA (Optional)
-- ============================================

-- Insert a sample specification record
-- INSERT INTO columbia_specifications (filename, original_filename, file_type, status)
-- VALUES ('sample_spec.txt', 'Sample Specification Document.txt', 'txt', 'parsed');