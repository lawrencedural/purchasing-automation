"""
Service layer for Columbia specification data operations
"""

from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional, Dict, Any
import traceback

from models.columbia_spec import (
    ColumbiaSpecification,
    ColumbiaTrim,
    ColumbiaSupplier,
    ColumbiaColorBOM,
    ColumbiaMeasurement,
    ColumbiaSpecFile,
    ColumbiaExport,
    ColumbiaParsingLog
)


class ColumbiaSpecService:
    """Service for managing Columbia specifications"""
    
    def __init__(self, db: Session):
        self.db = db
    
    # ==================== CRUD Operations ====================
    
    def create_specification(self, filename: str, original_filename: str, file_type: str, 
                            file_size: int, created_by: Optional[int] = None) -> ColumbiaSpecification:
        """Create a new specification record"""
        spec = ColumbiaSpecification(
            filename=filename,
            original_filename=original_filename,
            file_type=file_type,
            file_size=file_size,
            upload_date=datetime.utcnow(),
            parsed_date=datetime.utcnow(),
            status='uploaded',
            created_by=created_by
        )
        self.db.add(spec)
        self.db.commit()
        self.db.refresh(spec)
        return spec
    
    def get_specification(self, spec_id: int) -> Optional[ColumbiaSpecification]:
        """Get specification by ID"""
        return self.db.query(ColumbiaSpecification).filter(
            ColumbiaSpecification.id == spec_id
        ).first()
    
    def list_specifications(self, limit: int = 100, offset: int = 0) -> List[ColumbiaSpecification]:
        """List all specifications"""
        return self.db.query(ColumbiaSpecification).order_by(
            ColumbiaSpecification.upload_date.desc()
        ).limit(limit).offset(offset).all()
    
    def delete_specification(self, spec_id: int) -> bool:
        """Delete a specification and all related data"""
        try:
            spec = self.get_specification(spec_id)
            if spec:
                self.db.delete(spec)
                self.db.commit()
                return True
            return False
        except Exception as e:
            self.db.rollback()
            raise
    
    # ==================== Parser Integration ====================
    
    def save_parsed_data(self, spec_id: int, parsed_data: Dict[str, Any]) -> bool:
        """
        Save parsed data to database
        
        Args:
            spec_id: Specification ID
            parsed_data: Dictionary with 'trims', 'colorBOM', 'measurements'
        
        Returns:
            bool: Success status
        """
        try:
            spec = self.get_specification(spec_id)
            if not spec:
                raise ValueError(f"Specification {spec_id} not found")
            
            spec.status = 'parsing'
            self.db.commit()
            
            # Save trims
            if 'trims' in parsed_data:
                self._save_trims(spec_id, parsed_data['trims'])
            
            # Save color BOM
            if 'colorBOM' in parsed_data:
                self._save_color_bom(spec_id, parsed_data['colorBOM'])
            
            # Save measurements
            if 'measurements' in parsed_data:
                self._save_measurements(spec_id, parsed_data['measurements'])
            
            # Update statistics
            self._update_spec_statistics(spec_id)
            
            spec.status = 'parsed'
            spec.parsed_date = datetime.utcnow()
            self.db.commit()
            
            return True
            
        except Exception as e:
            spec.status = 'error'
            spec.error_message = str(e)
            self.db.commit()
            self.add_log(spec_id, 'error', str(e))
            raise
    
    def _save_trims(self, spec_id: int, trims: List[Dict[str, Any]]):
        """Save trims and their suppliers"""
        for trim_data in trims:
            trim = ColumbiaTrim(
                spec_id=spec_id,
                number=trim_data.get('number', ''),
                description=trim_data.get('description', ''),
                um=trim_data.get('um', ''),
                fiber_content=trim_data.get('fiberContent', ''),
                fiber_content_back=trim_data.get('fiberContentBack', ''),
                material_coating=trim_data.get('materialCoating', ''),
                material_finish=trim_data.get('materialFinish', ''),
                material_laminate=trim_data.get('materialLaminate', ''),
                trim_specific=trim_data.get('trimSpecific', '')
            )
            self.db.add(trim)
            self.db.flush()  # Get the ID
            
            # Save suppliers
            if 'suppliers' in trim_data:
                for supplier_data in trim_data['suppliers']:
                    supplier = ColumbiaSupplier(
                        trim_id=trim.id,
                        name=supplier_data.get('name', ''),
                        art_no=supplier_data.get('artNo', ''),
                        country=supplier_data.get('country', ''),
                        standard_cost_fob=self._safe_decimal(supplier_data.get('standardCostFOB')),
                        purchase_cost_cif=self._safe_decimal(supplier_data.get('purchaseCostCIF')),
                        lead_time_with_greige=self._safe_int(supplier_data.get('leadTimeWithGreige')),
                        lead_time_without_greige=self._safe_int(supplier_data.get('leadTimeWithoutGreige'))
                    )
                    self.db.add(supplier)
        
        self.db.commit()
    
    def _save_color_bom(self, spec_id: int, color_bom: List[Dict[str, Any]]):
        """Save color BOM data"""
        for color_data in color_bom:
            if 'components' in color_data:
                for component_data in color_data['components']:
                    bom = ColumbiaColorBOM(
                        spec_id=spec_id,
                        color_name=color_data.get('colorName', ''),
                        component_name=component_data.get('component', ''),
                        usage_details=component_data.get('usage', ''),
                        sap_material_code=component_data.get('sapMaterialCode', ''),
                        quantity=self._safe_int(component_data.get('quantity')),
                        placement=component_data.get('placement', '')
                    )
                    self.db.add(bom)
        
        self.db.commit()
    
    def _save_measurements(self, spec_id: int, measurements: List[Dict[str, Any]]):
        """Save measurements"""
        for measure_data in measurements:
            measurement = ColumbiaMeasurement(
                spec_id=spec_id,
                measurement_key=measure_data.get('key', ''),
                measurement_value=measure_data.get('value', ''),
                unit=measure_data.get('unit', ''),
                size_variant=measure_data.get('sizeVariant', '')
            )
            self.db.add(measurement)
        
        self.db.commit()
    
    def _update_spec_statistics(self, spec_id: int):
        """Update specification statistics"""
        spec = self.get_specification(spec_id)
        if spec:
            spec.total_trims = self.db.query(ColumbiaTrim).filter(
                ColumbiaTrim.spec_id == spec_id
            ).count()
            
            spec.total_suppliers = self.db.query(ColumbiaSupplier).join(
                ColumbiaTrim
            ).filter(ColumbiaTrim.spec_id == spec_id).count()
            
            spec.total_colors = self.db.query(ColumbiaColorBOM.color_name).filter(
                ColumbiaColorBOM.spec_id == spec_id
            ).distinct().count()
            
            spec.total_measurements = self.db.query(ColumbiaMeasurement).filter(
                ColumbiaMeasurement.spec_id == spec_id
            ).count()
            
            self.db.commit()
    
    # ==================== Query Methods ====================
    
    def get_trims_with_suppliers(self, spec_id: int) -> List[Dict[str, Any]]:
        """Get all trims with their suppliers for a specification"""
        trims = self.db.query(ColumbiaTrim).filter(
            ColumbiaTrim.spec_id == spec_id
        ).all()
        
        results = []
        for trim in trims:
            suppliers = self.db.query(ColumbiaSupplier).filter(
                ColumbiaSupplier.trim_id == trim.id
            ).all()
            
            results.append({
                'trim': trim,
                'suppliers': suppliers
            })
        
        return results
    
    def search_trims(self, search_term: str, spec_id: Optional[int] = None) -> List[ColumbiaTrim]:
        """Search for trims by number or description"""
        query = self.db.query(ColumbiaTrim).filter(
            (ColumbiaTrim.number.like(f'%{search_term}%')) |
            (ColumbiaTrim.description.like(f'%{search_term}%'))
        )
        
        if spec_id:
            query = query.filter(ColumbiaTrim.spec_id == spec_id)
        
        return query.all()
    
    # ==================== Helper Methods ====================
    
    def _safe_decimal(self, value: Any) -> Optional[float]:
        """Safely convert to decimal"""
        if value is None or value == '':
            return None
        try:
            return float(value)
        except (ValueError, TypeError):
            return None
    
    def _safe_int(self, value: Any) -> Optional[int]:
        """Safely convert to integer"""
        if value is None or value == '':
            return None
        try:
            return int(value)
        except (ValueError, TypeError):
            return None
    
    # ==================== Logging ====================
    
    def add_log(self, spec_id: int, log_level: str, message: str, 
               line_number: Optional[int] = None, context: Optional[str] = None):
        """Add a parsing log entry"""
        log = ColumbiaParsingLog(
            spec_id=spec_id,
            log_level=log_level,
            message=message,
            line_number=line_number,
            context=context
        )
        self.db.add(log)
        self.db.commit()
    
    # ==================== Export Tracking ====================
    
    def record_export(self, spec_id: int, export_type: str, export_format: str,
                     filename: str, file_path: str, exported_by: int, record_count: int):
        """Record an export operation"""
        export = ColumbiaExport(
            spec_id=spec_id,
            export_type=export_type,
            export_format=export_format,
            filename=filename,
            file_path=file_path,
            exported_by=exported_by,
            record_count=record_count
        )
        self.db.add(export)
        self.db.commit()
        return export
    
    def get_export_history(self, spec_id: int) -> List[ColumbiaExport]:
        """Get export history for a specification"""
        return self.db.query(ColumbiaExport).filter(
            ColumbiaExport.spec_id == spec_id
        ).order_by(ColumbiaExport.exported_at.desc()).all()

