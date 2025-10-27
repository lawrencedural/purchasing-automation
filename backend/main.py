from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
import io
from typing import List, Dict, Any
import json
from datetime import datetime

app = FastAPI(title="Trim Ordering Automation API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage (replace with database in production)
workflows = {}

@app.get("/")
async def root():
    return {"message": "Trim Ordering Automation API"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/api/workflow/{workflow_id}")
async def save_workflow(workflow_id: str, data: Dict[str, Any]):
    """Save workflow data"""
    workflows[workflow_id] = data
    return {"message": "Workflow saved successfully", "workflow_id": workflow_id}

@app.get("/api/workflow/{workflow_id}")
async def get_workflow(workflow_id: str):
    """Get workflow data"""
    if workflow_id not in workflows:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflows[workflow_id]

@app.post("/api/upload/schedule")
async def upload_schedule(file: UploadFile = File(...)):
    """Upload and parse PO schedule file"""
    try:
        # Read file content
        contents = await file.read()
        
        # Parse based on file type
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        elif file.filename.endswith('.xlsx') or file.filename.endswith('.xls'):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")
        
        # Convert to JSON
        data = df.to_dict(orient='records')
        
        return {
            "message": "File uploaded successfully",
            "filename": file.filename,
            "rows": len(data),
            "data": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.post("/api/pivot/generate")
async def generate_pivot(request: Dict[str, Any]):
    """Generate pivot data from trim summary and tech pack data"""
    try:
        trim_summary = request.get('trimSummary', {})
        tech_pack_data = request.get('techPackData', [])
        
        buyer_style_numbers = trim_summary.get('buyerStyleNumbers', [])
        
        pivot_data = []
        
        for tech_pack in tech_pack_data:
            for style_num in buyer_style_numbers:
                pivot_data.append({
                    "supplier": tech_pack.get('careLabelSupplier', 'N/A'),
                    "styleNumber": style_num,
                    "color": tech_pack.get('mainLabelColor', 'N/A'),
                    "quantity": request.get('quantity', 1000),
                    "allowances": request.get('allowances', '5%'),
                    "componentMaterial": tech_pack.get('componentMaterial', ''),
                    "logo": tech_pack.get('logo', ''),
                    "logoColor": tech_pack.get('logoColor', ''),
                    "mainLabel": tech_pack.get('mainLabel', ''),
                    "mainLabelColor": tech_pack.get('mainLabelColor', ''),
                    "careLabelCode": tech_pack.get('careLabelCode', ''),
                    "careLabelSupplier": tech_pack.get('careLabelSupplier', ''),
                    "hangtagCode": tech_pack.get('hangtagCode', ''),
                    "hangtagSupplier": tech_pack.get('hangtagSupplier', '')
                })
        
        return {
            "message": "Pivot generated successfully",
            "pivotData": pivot_data,
            "totalEntries": len(pivot_data)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating pivot: {str(e)}")

@app.post("/api/export/excel")
async def export_to_excel(request: Dict[str, Any]):
    """Export pivot data to Excel"""
    try:
        pivot_data = request.get('pivotData', [])
        
        if not pivot_data:
            raise HTTPException(status_code=400, detail="No pivot data to export")
        
        # Create DataFrame
        df = pd.DataFrame(pivot_data)
        
        # Create Excel writer
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Pivot Data', index=False)
        
        output.seek(0)
        
        return JSONResponse(
            content=json.dumps(pivot_data),
            headers={
                "Content-Disposition": "attachment; filename=pivot_data.json"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error exporting to Excel: {str(e)}")

@app.post("/api/data/filter")
async def filter_data(request: Dict[str, Any]):
    """Filter data based on search criteria"""
    try:
        data = request.get('data', [])
        search_term = request.get('searchTerm', '').lower()
        
        if not search_term:
            return {"filteredData": data}
        
        # Filter data
        filtered = []
        for row in data:
            # Search in all values
            values = ' '.join(str(v).lower() for v in row.values())
            if search_term in values:
                filtered.append(row)
        
        return {"filteredData": filtered, "total": len(filtered)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error filtering data: {str(e)}")

@app.get("/api/workflows")
async def list_workflows():
    """List all saved workflows"""
    return {
        "total": len(workflows),
        "workflows": list(workflows.keys())
    }

@app.delete("/api/workflow/{workflow_id}")
async def delete_workflow(workflow_id: str):
    """Delete a workflow"""
    if workflow_id not in workflows:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    del workflows[workflow_id]
    return {"message": "Workflow deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

