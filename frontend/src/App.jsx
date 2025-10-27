import React, { useState, useEffect } from 'react'
import { 
  CheckCircle2, Circle, Upload, FileText, Download, 
  Save, Search, Filter, X, Plus, Trash2, Eye 
} from 'lucide-react'
import toast from 'react-hot-toast'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { ColumbiaSpecStep } from './components/ColumbiaSpecStep'

function App() {
  const [currentStep, setCurrentStep] = useState(1)
  const [workflowData, setWorkflowData] = useState({
    feesApproved: false,
    buyFileOption: '',
    poSchedule: null,
    ngData: [],
    filteredData: [],
    trimSummary: {
      buyerStyleNumbers: [],
      components: []
    },
    techPackData: [],
    pivotData: []
  })

  const steps = [
    { id: 1, title: 'Initial Checks', icon: CheckCircle2 },
    { id: 2, title: 'Upload PO Schedule', icon: Upload },
    { id: 3, title: 'NG Data Processing', icon: FileText },
    { id: 4, title: 'Trim Summary', icon: Download },
    { id: 5, title: 'Tech Pack Entry', icon: FileText },
    { id: 6, title: 'Generate Pivot', icon: Download },
    { id: 7, title: 'Review & Export', icon: Eye },
    { id: 8, title: 'Columbia Spec Parser', icon: FileText }
  ]

  const saveWorkflow = () => {
    try {
      localStorage.setItem('trimOrderingWorkflow', JSON.stringify(workflowData))
      toast.success('Workflow saved successfully!')
    } catch (error) {
      toast.error('Failed to save workflow')
    }
  }

  const loadWorkflow = () => {
    try {
      const saved = localStorage.getItem('trimOrderingWorkflow')
      if (saved) {
        setWorkflowData(JSON.parse(saved))
        toast.success('Workflow loaded from saved data')
      }
    } catch (error) {
      toast.error('Failed to load saved workflow')
    }
  }

  useEffect(() => {
    loadWorkflow()
  }, [])

  const handleFileUpload = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const data = e.target.result
      
      if (file.name.endsWith('.csv')) {
        Papa.parse(data, {
          header: true,
          complete: (results) => {
            setWorkflowData(prev => ({
              ...prev,
              poSchedule: results.data,
              ngData: results.data
            }))
            toast.success('CSV file uploaded successfully!')
          }
        })
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const workbook = XLSX.read(data, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)
        
        setWorkflowData(prev => ({
          ...prev,
          poSchedule: jsonData,
          ngData: jsonData
        }))
        toast.success('Excel file uploaded successfully!')
      }
    }
    reader.readAsBinaryString(file)
  }

  const exportToExcel = () => {
    if (!workflowData.pivotData || workflowData.pivotData.length === 0) {
      toast.error('No pivot data to export')
      return
    }

    const worksheet = XLSX.utils.json_to_sheet(workflowData.pivotData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pivot Data')
    XLSX.writeFile(workbook, 'trim_order_pivot.xlsx')
    toast.success('File exported successfully!')
  }

  const getStepIcon = (stepId, IconComponent) => {
    const stepStatus = currentStep > stepId ? 'complete' : currentStep === stepId ? 'active' : 'pending'
    const iconClass = stepStatus === 'complete' ? 'text-green-600' : 
                     stepStatus === 'active' ? 'text-primary-600' : 'text-gray-400'
    
    if (stepStatus === 'complete') {
      return <CheckCircle2 className={`w-6 h-6 ${iconClass}`} />
    }
    return <IconComponent className={`w-6 h-6 ${iconClass}`} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Trim Ordering Automation</h1>
            <p className="text-sm text-gray-600">Automated workflow for trim ordering process</p>
          </div>
          <button 
            onClick={saveWorkflow}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Progress
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex items-center">
                  <div className={`step-item ${
                    currentStep > step.id ? 'step-complete' : 
                    currentStep === step.id ? 'step-active' : 'step-pending'
                  } flex-col items-center text-center`} style={{ minWidth: '140px' }}>
                    <div className="mb-2">
                      {getStepIcon(step.id, step.icon)}
                    </div>
                    <span className={`text-sm font-medium ${
                      currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 h-0.5 bg-gray-300 mx-2" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Step Content */}
          <div className="lg:col-span-2">
            {currentStep === 1 && <Step1InitialChecks workflowData={workflowData} setWorkflowData={setWorkflowData} />}
            {currentStep === 2 && <Step2UploadPO handleFileUpload={handleFileUpload} workflowData={workflowData} />}
            {currentStep === 3 && <Step3NGData workflowData={workflowData} setWorkflowData={setWorkflowData} />}
            {currentStep === 4 && <Step4TrimSummary workflowData={workflowData} setWorkflowData={setWorkflowData} />}
            {currentStep === 5 && <Step5TechPack workflowData={workflowData} setWorkflowData={setWorkflowData} />}
            {currentStep === 6 && <Step6GeneratePivot workflowData={workflowData} setWorkflowData={setWorkflowData} />}
            {currentStep === 7 && <Step7Review workflowData={workflowData} exportToExcel={exportToExcel} />}
            {currentStep === 8 && <ColumbiaSpecStep />}
          </div>

          {/* Right Sidebar - Navigation */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Workflow Navigation</h2>
            <div className="space-y-2">
              <button
                onClick={() => currentStep > 1 && setCurrentStep(currentStep - 1)}
                disabled={currentStep === 1}
                className="btn btn-secondary w-full disabled:opacity-50"
              >
                Previous Step
              </button>
              <button
                onClick={() => currentStep < steps.length && setCurrentStep(currentStep + 1)}
                disabled={currentStep === steps.length}
                className="btn btn-primary w-full disabled:opacity-50"
              >
                Next Step
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-medium mb-2">Current Progress</h3>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all"
                    style={{ width: `${(currentStep / steps.length) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {Math.round((currentStep / steps.length) * 100)}%
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                Tip: Save your progress regularly to avoid data loss
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Step 1: Initial Checks
function Step1InitialChecks({ workflowData, setWorkflowData }) {
  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4">Step 1: Initial Checks</h2>
      
      <div className="space-y-6">
        <div>
          <label className="flex items-center gap-3 mb-3">
            <input
              type="checkbox"
              checked={workflowData.feesApproved}
              onChange={(e) => setWorkflowData(prev => ({
                ...prev,
                feesApproved: e.target.checked
              }))}
              className="w-5 h-5 text-primary-600 rounded"
            />
            <span className="text-lg font-medium">Fees or cuts have been checked and approved</span>
          </label>
          <p className="text-sm text-gray-600 ml-8">
            Ensure all fees and cuts have been reviewed before proceeding
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Buy-File Option Evaluation
          </label>
          <select
            value={workflowData.buyFileOption}
            onChange={(e) => setWorkflowData(prev => ({
              ...prev,
              buyFileOption: e.target.value
            }))}
            className="input-field"
          >
            <option value="">Select an option</option>
            <option value="proceed">Proceed with buy-file</option>
            <option value="skip">Skip buy-file option</option>
            <option value="review">Needs further review</option>
          </select>
          <p className="text-sm text-gray-600 mt-1">
            Evaluate whether the buy-file option should be used before proceeding
          </p>
        </div>

        {workflowData.feesApproved && workflowData.buyFileOption && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-green-800 font-medium">✓ Ready to proceed to next step</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Step 2: Upload PO Schedule
function Step2UploadPO({ handleFileUpload, workflowData }) {
  const fileInputRef = React.useRef(null)

  const handleDrop = (e) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleChange = (e) => {
    const files = e.target.files
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4">Step 2: Upload PO Line Delivery Schedule</h2>
      
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary-500 transition-colors"
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium mb-2">Drop file here or click to upload</p>
        <p className="text-sm text-gray-600 mb-4">Supports Excel (.xlsx, .xls) and CSV formats</p>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn btn-primary"
        >
          Browse Files
        </button>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleChange}
          accept=".csv,.xlsx,.xls"
          className="hidden"
        />
      </div>

      {workflowData.poSchedule && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-green-800 font-medium">
            ✓ File uploaded successfully ({workflowData.poSchedule.length} rows)
          </p>
        </div>
      )}
    </div>
  )
}

// Step 3: NG Data Processing
function Step3NGData({ workflowData, setWorkflowData }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filtered, setFiltered] = useState(workflowData.ngData)

  useEffect(() => {
    if (workflowData.ngData) {
      const filtered = workflowData.ngData.filter(row => {
        const values = Object.values(row).join(' ').toLowerCase()
        return values.includes(searchTerm.toLowerCase())
      })
      setFiltered(filtered)
    }
  }, [searchTerm, workflowData.ngData])

  if (!workflowData.ngData || workflowData.ngData.length === 0) {
    return (
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Step 3: NG Data Processing</h2>
        <p className="text-gray-600">Please upload PO schedule in previous step</p>
      </div>
    )
  }

  const columns = Object.keys(workflowData.ngData[0] || {})

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4">Step 3: NG Data Processing</h2>
      
      <div className="mb-4 flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search data..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <button
          onClick={() => setWorkflowData(prev => ({
            ...prev,
            filteredData: filtered
          }))}
          className="btn btn-primary"
        >
          Use Filtered Data
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map(col => (
                <th key={col} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.slice(0, 10).map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                {columns.map(col => (
                  <td key={col} className="px-4 py-3 text-sm text-gray-900">
                    {row[col]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-gray-600 mt-4">
        Showing {Math.min(10, filtered.length)} of {filtered.length} filtered results
      </p>
    </div>
  )
}

// Step 4: Trim Summary
function Step4TrimSummary({ workflowData, setWorkflowData }) {
  const [newBuyerStyle, setNewBuyerStyle] = useState('')

  const addBuyerStyle = () => {
    if (newBuyerStyle.trim()) {
      setWorkflowData(prev => ({
        ...prev,
        trimSummary: {
          ...prev.trimSummary,
          buyerStyleNumbers: [...prev.trimSummary.buyerStyleNumbers, newBuyerStyle.trim()]
        }
      }))
      setNewBuyerStyle('')
      toast.success('Buyer style number added')
    }
  }

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4">Step 4: Create Trim Summary</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Buyer Style Numbers
        </label>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newBuyerStyle}
            onChange={(e) => setNewBuyerStyle(e.target.value)}
            placeholder="Enter buyer style number..."
            className="input-field"
            onKeyPress={(e) => e.key === 'Enter' && addBuyerStyle()}
          />
          <button
            onClick={addBuyerStyle}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        {workflowData.trimSummary.buyerStyleNumbers.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {workflowData.trimSummary.buyerStyleNumbers.map((style, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
              >
                {style}
                <button
                  onClick={() => setWorkflowData(prev => ({
                    ...prev,
                    trimSummary: {
                      ...prev.trimSummary,
                      buyerStyleNumbers: prev.trimSummary.buyerStyleNumbers.filter((_, i) => i !== idx)
                    }
                  }))}
                  className="text-primary-600 hover:text-primary-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium mb-2">Trim Summary Preview</h3>
        <p className="text-sm text-gray-600">
          Buyer Style Numbers: {workflowData.trimSummary.buyerStyleNumbers.length}
        </p>
      </div>
    </div>
  )
}

// Step 5: Tech Pack Entry
function Step5TechPack({ workflowData, setWorkflowData }) {
  const [currentEntry, setCurrentEntry] = useState({
    componentMaterial: '',
    logo: '',
    logoColor: '',
    mainLabel: '',
    mainLabelColor: '',
    careLabelCode: '',
    careLabelSupplier: '',
    hangtagCode: '',
    hangtagSupplier: ''
  })

  const addTechPackEntry = () => {
    setWorkflowData(prev => ({
      ...prev,
      techPackData: [...prev.techPackData, currentEntry]
    }))
    setCurrentEntry({
      componentMaterial: '',
      logo: '',
      logoColor: '',
      mainLabel: '',
      mainLabelColor: '',
      careLabelCode: '',
      careLabelSupplier: '',
      hangtagCode: '',
      hangtagSupplier: ''
    })
    toast.success('Tech pack entry added')
  }

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4">Step 5: Tech Pack Data Entry</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Component Material
          </label>
          <input
            type="text"
            value={currentEntry.componentMaterial}
            onChange={(e) => setCurrentEntry({...currentEntry, componentMaterial: e.target.value})}
            className="input-field"
            placeholder="e.g., Cotton, Polyester"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Logo
          </label>
          <input
            type="text"
            value={currentEntry.logo}
            onChange={(e) => setCurrentEntry({...currentEntry, logo: e.target.value})}
            className="input-field"
            placeholder="Logo description"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Logo Color
          </label>
          <input
            type="text"
            value={currentEntry.logoColor}
            onChange={(e) => setCurrentEntry({...currentEntry, logoColor: e.target.value})}
            className="input-field"
            placeholder="e.g., Black, White"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Main Label
          </label>
          <input
            type="text"
            value={currentEntry.mainLabel}
            onChange={(e) => setCurrentEntry({...currentEntry, mainLabel: e.target.value})}
            className="input-field"
            placeholder="Label description"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Main Label Color
          </label>
          <input
            type="text"
            value={currentEntry.mainLabelColor}
            onChange={(e) => setCurrentEntry({...currentEntry, mainLabelColor: e.target.value})}
            className="input-field"
            placeholder="e.g., Black"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Care Label Code
          </label>
          <input
            type="text"
            value={currentEntry.careLabelCode}
            onChange={(e) => setCurrentEntry({...currentEntry, careLabelCode: e.target.value})}
            className="input-field"
            placeholder="e.g., CARE-001"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Care Label Supplier
          </label>
          <input
            type="text"
            value={currentEntry.careLabelSupplier}
            onChange={(e) => setCurrentEntry({...currentEntry, careLabelSupplier: e.target.value})}
            className="input-field"
            placeholder="Supplier name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hangtag Code
          </label>
          <input
            type="text"
            value={currentEntry.hangtagCode}
            onChange={(e) => setCurrentEntry({...currentEntry, hangtagCode: e.target.value})}
            className="input-field"
            placeholder="e.g., HT-001"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hangtag Supplier
          </label>
          <input
            type="text"
            value={currentEntry.hangtagSupplier}
            onChange={(e) => setCurrentEntry({...currentEntry, hangtagSupplier: e.target.value})}
            className="input-field"
            placeholder="Supplier name"
          />
        </div>
      </div>

      <button
        onClick={addTechPackEntry}
        className="btn btn-primary flex items-center gap-2 mb-6"
      >
        <Plus className="w-4 h-4" />
        Add Tech Pack Entry
      </button>

      {workflowData.techPackData.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 font-medium text-sm text-gray-700 border-b">
            Tech Pack Entries ({workflowData.techPackData.length})
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Logo</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Main Label</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {workflowData.techPackData.map((entry, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-2 text-sm">{entry.componentMaterial}</td>
                    <td className="px-4 py-2 text-sm">{entry.logo}</td>
                    <td className="px-4 py-2 text-sm">{entry.mainLabel}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => setWorkflowData(prev => ({
                          ...prev,
                          techPackData: prev.techPackData.filter((_, i) => i !== idx)
                        }))}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// Step 6: Generate Pivot
function Step6GeneratePivot({ workflowData, setWorkflowData }) {
  const generatePivot = () => {
    const pivotData = []
    
    workflowData.techPackData.forEach((techPack, idx) => {
      workflowData.trimSummary.buyerStyleNumbers.forEach((styleNum) => {
        pivotData.push({
          supplier: techPack.careLabelSupplier || 'N/A',
          styleNumber: styleNum,
          color: techPack.mainLabelColor || 'N/A',
          quantity: 1000, // Default, can be calculated
          allowances: '5%',
          componentMaterial: techPack.componentMaterial,
          logo: techPack.logo,
          logoColor: techPack.logoColor,
          mainLabel: techPack.mainLabel,
          mainLabelColor: techPack.mainLabelColor,
          careLabelCode: techPack.careLabelCode,
          careLabelSupplier: techPack.careLabelSupplier,
          hangtagCode: techPack.hangtagCode,
          hangtagSupplier: techPack.hangtagSupplier
        })
      })
    })

    setWorkflowData(prev => ({
      ...prev,
      pivotData
    }))

    toast.success(`Generated ${pivotData.length} pivot entries`)
  }

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4">Step 6: Generate Pivot</h2>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-blue-800 mb-2">
          The pivot will combine your trim summary with tech pack data to generate complete ordering information.
        </p>
        <p className="text-sm text-blue-700">
          <strong>{workflowData.trimSummary.buyerStyleNumbers.length}</strong> style numbers ×{' '}
          <strong>{workflowData.techPackData.length}</strong> tech pack entries
        </p>
      </div>

      <button
        onClick={generatePivot}
        className="btn btn-primary flex items-center gap-2 mb-6"
      >
        <Download className="w-4 h-4" />
        Generate Pivot Data
      </button>

      {workflowData.pivotData.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 font-medium text-sm text-gray-700 border-b">
            Generated Pivot Data ({workflowData.pivotData.length} entries)
          </div>
          <div className="overflow-x-auto max-h-96">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Style</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Color</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Allowances</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {workflowData.pivotData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm">{row.supplier}</td>
                    <td className="px-4 py-2 text-sm">{row.styleNumber}</td>
                    <td className="px-4 py-2 text-sm">{row.color}</td>
                    <td className="px-4 py-2 text-sm">{row.quantity}</td>
                    <td className="px-4 py-2 text-sm">{row.allowances}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// Step 7: Review & Export
function Step7Review({ workflowData, exportToExcel }) {
  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4">Step 7: Review & Export</h2>
      
      <div className="space-y-6">
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-medium text-green-800 mb-2">✓ Workflow Complete</h3>
          <p className="text-sm text-green-700">
            Review your pivot data below and export when ready
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Buyer Style Numbers</p>
            <p className="text-2xl font-bold">{workflowData.trimSummary.buyerStyleNumbers.length}</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600">Tech Pack Entries</p>
            <p className="text-2xl font-bold">{workflowData.techPackData.length}</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <p className="text-sm text-gray-600">Pivot Entries</p>
            <p className="text-2xl font-bold">{workflowData.pivotData.length}</p>
          </div>
        </div>

        <button
          onClick={exportToExcel}
          className="btn btn-primary flex items-center gap-2 w-full"
        >
          <Download className="w-5 h-5" />
          Export to Excel
        </button>

        {workflowData.pivotData.length > 0 && (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 font-medium text-sm text-gray-700 border-b">
              Final Pivot Data
            </div>
            <div className="overflow-x-auto max-h-96">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Style</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Color</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Care Label</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hangtag</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {workflowData.pivotData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm">{row.supplier}</td>
                      <td className="px-4 py-2 text-sm">{row.styleNumber}</td>
                      <td className="px-4 py-2 text-sm">{row.color}</td>
                      <td className="px-4 py-2 text-sm">{row.quantity}</td>
                      <td className="px-4 py-2 text-sm">{row.componentMaterial}</td>
                      <td className="px-4 py-2 text-sm">{row.careLabelCode}</td>
                      <td className="px-4 py-2 text-sm">{row.hangtagCode}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App

