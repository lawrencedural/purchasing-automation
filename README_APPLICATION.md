# Trim Ordering Automation - Complete Application

A full-stack web application for automating the trim ordering workflow process with a modern, intuitive interface.

## 🎯 Features

- **Step-by-step workflow** with progress tracking
- **File upload** support for PO schedules (Excel/CSV)
- **Data filtering** and search functionality
- **Tech pack data entry** forms
- **Automated trim summary** generation
- **Pivot output generation** with all required fields
- **Data validation** at each step
- **Save work in progress** functionality
- **Export final Pivot data** to Excel
- **Clean, professional UI** built with React and Tailwind CSS

## 🏗️ Architecture

```
trim-ordering-automation/
├── frontend/              # React application
│   ├── src/
│   │   ├── App.jsx       # Main application component
│   │   ├── main.jsx      # Entry point
│   │   └── index.css     # Styling
│   ├── package.json      # Dependencies
│   ├── vite.config.js    # Vite configuration
│   └── tailwind.config.js
├── backend/               # FastAPI server
│   ├── main.py          # API endpoints
│   └── requirements.txt  # Python dependencies
└── README_APPLICATION.md # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- Git

### Installation

#### 1. Clone the Repository

```bash
cd "C:\Users\macky\OneDrive\Documents\Github-Projects\New folder\Purchasing-Automation"
```

#### 2. Set Up Frontend

```bash
cd frontend
npm install
```

#### 3. Set Up Backend

```bash
cd ../backend
pip install -r requirements.txt
```

#### 4. Start Backend Server

```bash
# From the backend directory
python main.py
```

The API will be available at `http://localhost:8000`

#### 5. Start Frontend Development Server

```bash
# From the frontend directory (in a new terminal)
npm run dev
```

The application will be available at `http://localhost:3000`

## 📖 Usage Guide

### Workflow Steps

The application follows a 7-step process:

#### Step 1: Initial Checks
- Check fees or cuts approval
- Evaluate buy-file option
- Click "Next Step" when complete

#### Step 2: Upload PO Schedule
- Upload Excel (.xlsx, .xls) or CSV file
- Drag and drop or click to browse
- File will be automatically parsed

#### Step 3: NG Data Processing
- View uploaded data in table format
- Use search bar to filter data
- Click "Use Filtered Data" to proceed

#### Step 4: Create Trim Summary
- Add buyer style numbers
- Click "+ Add" or press Enter
- Remove numbers by clicking the X icon

#### Step 5: Tech Pack Data Entry
- Fill in component materials
- Enter logo information and colors
- Add main label details
- Specify care label and hangtag codes
- Click "Add Tech Pack Entry" for each component

#### Step 6: Generate Pivot
- Review summary of data to be combined
- Click "Generate Pivot Data"
- View generated pivot table

#### Step 7: Review & Export
- Review final pivot data
- Click "Export to Excel" to download
- File will be saved as `trim_order_pivot.xlsx`

### Saving Progress

- Click "Save Progress" button at any time
- Progress is saved to browser's localStorage
- Automatically loads on page refresh
- Work remains saved until you clear browser data

## 🎨 Features in Detail

### File Upload
- Supports Excel (.xlsx, .xls) and CSV formats
- Drag-and-drop interface
- Automatic parsing and validation
- Displays file information after upload

### Data Filtering
- Real-time search across all columns
- Highlights matching results
- Shows count of filtered results
- Easy to clear and reset

### Tech Pack Entry
- Organized form layout
- All required fields for complete trim details
- Add multiple entries
- Delete individual entries
- Visual table preview

### Pivot Generation
- Automatically combines:
  - Buyer style numbers
  - Tech pack data
  - Component materials
  - Supplier information
  - Quantities and allowances
- Generates comprehensive pivot table

### Export Functionality
- Export to Excel format
- Includes all pivot columns
- Formatted for easy analysis
- Ready for further processing

## 🔧 Development

### Frontend Development

```bash
cd frontend
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
```

### Backend Development

```bash
cd backend
python main.py     # Start API server
```

### API Endpoints

- `GET /api/health` - Health check
- `POST /api/upload/schedule` - Upload and parse PO schedule
- `POST /api/pivot/generate` - Generate pivot data
- `POST /api/export/excel` - Export to Excel
- `POST /api/data/filter` - Filter data by search term
- `GET /api/workflow/{id}` - Get saved workflow
- `POST /api/workflow/{id}` - Save workflow

## 🎯 Technology Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling framework
- **Lucide React** - Icons
- **React Hot Toast** - Notifications
- **PapaParse** - CSV parsing
- **XLSX** - Excel file handling

### Backend
- **FastAPI** - Python web framework
- **Pandas** - Data processing
- **openpyxl** - Excel operations
- **Uvicorn** - ASGI server

## 📊 Data Flow

```
User Input → Frontend → API Endpoints → Data Processing → Response
                                     ↓
                              In-Memory Storage
                                     ↓
                              Frontend Display
```

## 🎨 UI Components

### Progress Tracker
- Visual step indicators
- Color-coded status (complete, active, pending)
- Progress percentage
- Step navigation

### Data Tables
- Sortable columns
- Scrollable content
- Responsive design
- Row highlighting on hover

### Forms
- Input validation
- Real-time feedback
- Error messages
- Success notifications

### File Upload
- Drag and drop zone
- File browser integration
- File type validation
- Upload confirmation

## 🔒 Data Management

### In-Memory Storage
- Current implementation uses in-memory storage
- Data persists during session
- Lost on server restart
- For production, integrate a database

### LocalStorage (Frontend)
- Workflow data saved in browser
- Persists across sessions
- Auto-load on page refresh
- Per-browser storage

## 🚀 Production Deployment

### Environment Variables

Create `.env` files for configuration:

#### Frontend (.env)
```
VITE_API_URL=http://localhost:8000
```

#### Backend (.env)
```
DATABASE_URL=postgresql://user:pass@localhost/dbname
SECRET_KEY=your-secret-key
```

### Build Commands

```bash
# Frontend
cd frontend
npm run build
# Output in 'dist' folder

# Backend
cd backend
# Use gunicorn or similar for production
gunicorn main:app --workers 4
```

### Docker Deployment

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f
```

## 🐛 Troubleshooting

### Frontend Issues

**Port 3000 already in use**
```bash
# Use a different port
npm run dev -- --port 3001
```

**Module not found errors**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### Backend Issues

**Port 8000 already in use**
```bash
# Edit main.py to use different port
uvicorn.run(app, host="0.0.0.0", port=8001)
```

**Import errors**
```bash
# Ensure virtual environment is activated
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Data Issues

**File upload failing**
- Check file format (supports .xlsx, .xls, .csv)
- Verify file is not corrupted
- Check file size (should be reasonable)

**Data not displaying**
- Check browser console for errors
- Verify API is running
- Check network tab in dev tools

## 📝 Customization

### Changing Colors
Edit `frontend/tailwind.config.js`:
```javascript
colors: {
  primary: {
    500: '#your-color-here'
  }
}
```

### Adding Fields
1. Update form in `App.jsx`
2. Add corresponding API endpoint in `main.py`
3. Update pivot generation logic
4. Add to export function

### Styling
All styles use Tailwind CSS classes.
Custom CSS can be added to `frontend/src/index.css`

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Pandas Documentation](https://pandas.pydata.org)

## 📞 Support

For issues or questions:
1. Check this README
2. Review browser console for errors
3. Check API logs for backend issues
4. Consult project documentation

## 🎉 Next Steps

After using the application:
1. Export your final pivot data
2. Review the generated Excel file
3. Verify all information is correct
4. Submit to Pivot system or use for ordering

---

**Built with ❤️ for efficient trim ordering automation**

