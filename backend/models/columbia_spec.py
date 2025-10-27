"""
Database models for Columbia Sportswear specification data
SQLAlchemy ORM models
"""

from sqlalchemy import Column, Integer, String, Text, Numeric, DateTime, ForeignKey, Boolean, Index
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime

Base = declarative_base()


class ColumbiaSpecification(Base):
    """
    Main specification document metadata
    """
    __tablename__ = 'columbia_specifications'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_type = Column(String(50))
    file_size = Column(Integer)
    upload_date = Column(DateTime, default=datetime.utcnow)
    parsed_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String(50), default='parsed')
    error_message = Column(Text)
    total_trims = Column(Integer, default=0)
    total_suppliers = Column(Integer, default=0)
    total_colors = Column(Integer, default=0)
    total_measurements = Column(Integer, default=0)
    created_by = Column(Integer)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    trims = relationship('ColumbiaTrim', back_populates='specification', cascade='all, delete-orphan')
    color_bom = relationship('ColumbiaColorBOM', back_populates='specification', cascade='all, delete-orphan')
    measurements = relationship('ColumbiaMeasurement', back_populates='specification', cascade='all, delete-orphan')
    file_storage = relationship('ColumbiaSpecFile', back_populates='specification', uselist=False, cascade='all, delete-orphan')
    exports = relationship('ColumbiaExport', back_populates='specification', cascade='all, delete-orphan')
    logs = relationship('ColumbiaParsingLog', back_populates='specification', cascade='all, delete-orphan')
    
    __table_args__ = (
        Index('idx_spec_upload_date', 'upload_date'),
        Index('idx_spec_status', 'status'),
        Index('idx_spec_filename', 'filename'),
    )
    
    def __repr__(self):
        return f"<ColumbiaSpecification(id={self.id}, filename='{self.filename}')>"


class ColumbiaTrim(Base):
    """
    Trim components from specification
    """
    __tablename__ = 'columbia_spec_trims'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    spec_id = Column(Integer, ForeignKey('columbia_specifications.id', ondelete='CASCADE'), nullable=False)
    number = Column(String(50), nullable=False)
    description = Column(Text, nullable=False)
    um = Column(String(20))  # Unit of Measurement
    fiber_content = Column(String(255))
    fiber_content_back = Column(String(255))
    material_coating = Column(String(255))
    material_finish = Column(String(255))  # Material Finish (Face)
    material_laminate = Column(String(255))
    trim_specific = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    specification = relationship('ColumbiaSpecification', back_populates='trims')
    suppliers = relationship('ColumbiaSupplier', back_populates='trim', cascade='all, delete-orphan')
    
    __table_args__ = (
        Index('idx_trim_number', 'number'),
        Index('idx_trim_spec', 'spec_id'),
        Index('idx_trim_created', 'created_at'),
    )
    
    def __repr__(self):
        return f"<ColumbiaTrim(id={self.id}, number='{self.number}')>"


class ColumbiaSupplier(Base):
    """
    Suppliers for each trim component
    """
    __tablename__ = 'columbia_spec_suppliers'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    trim_id = Column(Integer, ForeignKey('columbia_spec_trims.id', ondelete='CASCADE'), nullable=False)
    name = Column(String(255), nullable=False)
    art_no = Column(String(100))  # Supplier Art Number
    country = Column(String(100))  # Country of Origin
    standard_cost_fob = Column(Numeric(10, 6))  # Standard Cost (FOB)
    purchase_cost_cif = Column(Numeric(10, 6))  # Purchase Cost (CIF)
    lead_time_with_greige = Column(Integer)
    lead_time_without_greige = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    trim = relationship('ColumbiaTrim', back_populates='suppliers')
    
    __table_args__ = (
        Index('idx_supplier_trim', 'trim_id'),
        Index('idx_supplier_name', 'name'),
        Index('idx_supplier_country', 'country'),
    )
    
    def __repr__(self):
        return f"<ColumbiaSupplier(id={self.id}, name='{self.name}', trim_id={self.trim_id})>"


class ColumbiaColorBOM(Base):
    """
    Color Bill of Materials - component assignments per color
    """
    __tablename__ = 'columbia_spec_color_bom'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    spec_id = Column(Integer, ForeignKey('columbia_specifications.id', ondelete='CASCADE'), nullable=False)
    color_name = Column(String(255), nullable=False)
    component_name = Column(String(255), nullable=False)
    usage_details = Column(Text)
    sap_material_code = Column(String(100))
    quantity = Column(Integer)
    placement = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    specification = relationship('ColumbiaSpecification', back_populates='color_bom')
    
    __table_args__ = (
        Index('idx_bom_spec', 'spec_id'),
        Index('idx_bom_color', 'color_name'),
    )
    
    def __repr__(self):
        return f"<ColumbiaColorBOM(id={self.id}, color='{self.color_name}', component='{self.component_name}')>"


class ColumbiaMeasurement(Base):
    """
    Measurement data from specification
    """
    __tablename__ = 'columbia_spec_measurements'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    spec_id = Column(Integer, ForeignKey('columbia_specifications.id', ondelete='CASCADE'), nullable=False)
    measurement_key = Column(String(255), nullable=False)
    measurement_value = Column(String(255))
    unit = Column(String(50))
    size_variant = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    specification = relationship('ColumbiaSpecification', back_populates='measurements')
    
    __table_args__ = (
        Index('idx_measurements_spec', 'spec_id'),
        Index('idx_measurements_key', 'measurement_key'),
    )
    
    def __repr__(self):
        return f"<ColumbiaMeasurement(id={self.id}, key='{self.measurement_key}')>"


class ColumbiaSpecFile(Base):
    """
    File storage for specifications
    """
    __tablename__ = 'columbia_spec_files'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    spec_id = Column(Integer, ForeignKey('columbia_specifications.id', ondelete='CASCADE'), nullable=False, unique=True)
    file_path = Column(Text)  # Path to stored file
    file_content = Column(Text)  # Base64 encoded content or file path
    storage_type = Column(String(50), default='filesystem')
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    specification = relationship('ColumbiaSpecification', back_populates='file_storage')
    
    __table_args__ = (
        Index('idx_spec_file_spec', 'spec_id'),
    )
    
    def __repr__(self):
        return f"<ColumbiaSpecFile(id={self.id}, spec_id={self.spec_id})>"


class ColumbiaExport(Base):
    """
    Export history
    """
    __tablename__ = 'columbia_spec_exports'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    spec_id = Column(Integer, ForeignKey('columbia_specifications.id', ondelete='SET NULL'))
    export_type = Column(String(50))
    export_format = Column(String(50))
    filename = Column(String(255))
    file_path = Column(Text)
    exported_at = Column(DateTime, default=datetime.utcnow)
    exported_by = Column(Integer)
    record_count = Column(Integer)
    
    # Relationships
    specification = relationship('ColumbiaSpecification', back_populates='exports')
    
    __table_args__ = (
        Index('idx_export_spec', 'spec_id'),
        Index('idx_export_date', 'exported_at'),
    )
    
    def __repr__(self):
        return f"<ColumbiaExport(id={self.id}, type='{self.export_type}')>"


class ColumbiaParsingLog(Base):
    """
    Parsing logs for debugging
    """
    __tablename__ = 'columbia_spec_parsing_logs'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    spec_id = Column(Integer, ForeignKey('columbia_specifications.id', ondelete='CASCADE'))
    log_level = Column(String(20))
    message = Column(Text)
    line_number = Column(Integer)
    context = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    specification = relationship('ColumbiaSpecification', back_populates='logs')
    
    __table_args__ = (
        Index('idx_log_spec', 'spec_id'),
        Index('idx_log_level', 'log_level'),
    )
    
    def __repr__(self):
        return f"<ColumbiaParsingLog(id={self.id}, level='{self.log_level}')>"

