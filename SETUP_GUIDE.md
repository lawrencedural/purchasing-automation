# Trim Ordering Automation - Setup Guide

## Quick Start

Follow these steps to get the application running:

### Step 1: Install Dependencies

#### Frontend Dependencies
```bash
cd frontend
npm install
```

#### Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Start Backend Server

```bash
cd backend
python main.py
```

Or use the provided script:
```bash
start_backend.bat
```

The API will start on `http://localhost:8000`

### Step 3: Start Frontend Server

Open a new terminal:
```bash
cd frontend
npm run dev
```

The application will start on `http://localhost:3000`

### Step 4: Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## Directory Structure

```
Purchasing-Automation/
│
├── frontend/                  # React Frontend Application
│   ├── src/
│   │   ├── App.jsx          # Main application (1500+ lines!)
│   │   ├── main.jsx         # Entry point
│   │   └── index.css        # Styles
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── backend/                   # FastAPI Backend
│   ├── main.py              # API endpoints
│   └── requirements.txt
│
├── Documentation Files
│   ├── SYSTEM_ARCHITECTURE.md
│   ├── IMPLEMENTATION_GUIDE.md
│   ├── API_SPECIFICATION.md
│   ├── QUICK_REFERENCE.md
│   ├── README.md
│   └── README_APPLICATION.md
│
├── Docker Files
│   ├── Dockerfile
│   └── docker-compose.yml
│
└── Utility Files
    ├── requirements.txt      # Main project dependencies
    ├── env.example
    └── start_backend.bat
```

## What's Included

### Complete Working Application

1. **Frontend Application** (`frontend/`)
   - React 18 with modern hooks
   - Single-page application with 7 workflow steps
   - File upload with drag-and-drop
   - Data tables with search/filter
   - Tech pack entry forms
   - Pivot data generation and preview
   - Excel export functionality
   - Progress tracking and auto-save
   - Professional UI with Tailwind CSS

2. **Backend API** (`backend/`)
   - FastAPI with RESTful endpoints
   - File upload and parsing (CSV/Excel)
   - Data processing and filtering
   - Pivot generation
   - Workflow management

3. **System Architecture Documentation**
   - Complete architecture with Mermaid diagrams
   - Component breakdown
   - Data flow documentation
   - Integration points
   - Technology recommendations

## Features Implemented

✅ **Step-by-step workflow interface** with visual progress tracking  
✅ **File upload capability** for PO schedules (Excel/CSV)  
✅ **Data filtering and search** functionality  
✅ **Tech pack data entry** form with all required fields  
✅ **Automated trim summary** generation  
✅ **Pivot output generation** with supplier, style, color, quantity, allowances  
✅ **Data validation** at each step  
✅ **Save work in progress** functionality  
✅ **Export final Pivot data** to Excel  
✅ **Clean, professional UI** with Tailwind CSS  

## Using the Application

### Workflow Steps

1. **Initial Checks**: Approve fees/cuts and select buy-file option
2. **Upload PO Schedule**: Upload Excel or CSV file
3. **NG Data Processing**: Search and filter uploaded data
4. **Trim Summary**: Add buyer style numbers
5. **Tech Pack Entry**: Enter component details, logos, labels, hangtags
6. **Generate Pivot**: Create pivot data from all inputs
7. **Review & Export**: Review and export to Excel

### Key Features

- **Auto-save**: Your progress is automatically saved to localStorage
- **Manual save**: Click "Save Progress" button anytime
- **Load on startup**: Saved data loads automatically
- **Search & filter**: Find relevant data quickly
- **Responsive design**: Works on desktop and tablet
- **Excel export**: Professional Excel output with all data

## Troubleshooting

### Cannot find module errors
```bash
# Reinstall dependencies
cd frontend
rm -rf node_modules
npm install

cd ../backend
pip install -r requirements.txt
```

### Port already in use
```bash
# Kill process on port 8000
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Or change port in main.py
```

### File upload not working
- Ensure file is .xlsx, .xls, or .csv
- Check file is not corrupted
- Verify file size is reasonable

## Development

### Making Changes

**Frontend**:
- Edit `frontend/src/App.jsx` for workflow changes
- Modify `frontend/src/index.css` for styling
- Update `frontend/tailwind.config.js` for theme changes

**Backend**:
- Edit `backend/main.py` for API changes
- Add new endpoints as needed
- Update response formats

### Testing

```bash
# Frontend tests (when implemented)
cd frontend
npm test

# Backend tests
cd backend
pytest  # (when implemented)
```

## Production Deployment

For production deployment, see:
- `SYSTEM_ARCHITECTURE.md` for architecture
- `IMPLEMENTATION_GUIDE.md` for deployment guide
- `docker-compose.yml` for container setup

## Support

If you encounter issues:
1. Check the browser console for errors
2. Check backend logs in terminal
3. Verify all dependencies are installed
4. Review the README files

## Next Steps

1. Test the application with sample data
2. Customize fields as needed
3. Add your specific business logic
4. Deploy to production environment
5. Integrate with NG system and P-Bot

---

**The application is ready to use!**

Start the backend, then the frontend, and begin your first workflow.

