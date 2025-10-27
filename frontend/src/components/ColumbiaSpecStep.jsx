import React, { useState, useRef } from 'react';
import { Upload, Download, FileText, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { parseSpecificationFile } from '../parsers/specParser';
import { exportAllDataToExcel, exportTrimsToExcel, exportColorBOMToExcel } from '../utils/dataExporter';

export function ColumbiaSpecStep() {
  const [parsedData, setParsedData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedView, setSelectedView] = useState('trims'); // 'trims', 'colorBOM', 'measurements'
  const fileInputRef = useRef(null);

  const handleFileUpload = async (file) => {
    setIsLoading(true);
    try {
      const data = await parseSpecificationFile(file);
      setParsedData(data);
      toast.success('Specification parsed successfully!');
    } catch (error) {
      toast.error('Failed to parse specification: ' + error.message);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleExport = (type) => {
    try {
      if (type === 'all') {
        exportAllDataToExcel(parsedData, 'columbia_specification.xlsx');
        toast.success('All data exported successfully!');
      } else if (type === 'trims' && parsedData.trims) {
        exportTrimsToExcel(parsedData.trims, 'trims.xlsx');
        toast.success('Trims data exported successfully!');
      } else if (type === 'colorBOM' && parsedData.colorBOM) {
        exportColorBOMToExcel(parsedData.colorBOM, 'color_bom.xlsx');
        toast.success('Color BOM exported successfully!');
      }
    } catch (error) {
      toast.error('Export failed: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <h2 className="text-xl font-bold mb-2">Columbia Sportswear Specification Parser</h2>
        <p className="text-gray-600">
          Upload and parse Columbia specification documents to extract trim, component, and BOM data
        </p>
      </div>

      {/* File Upload */}
      {!parsedData && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Upload Specification File</h3>
          
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary-500 transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <span>Parsing file...</span>
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium mb-2">Drop file here or click to upload</p>
                <p className="text-sm text-gray-600 mb-4">
                  Supports text files (.txt) and PDF files (.pdf)
                </p>
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
                  accept=".txt,.pdf"
                  className="hidden"
                />
              </>
            )}
          </div>
        </div>
      )}

      {/* Results */}
      {parsedData && (
        <>
          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="card">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-primary-600" />
                <span className="font-semibold">Trims</span>
              </div>
              <p className="text-2xl font-bold">{parsedData.trims?.length || 0}</p>
              <p className="text-sm text-gray-600">Components found</p>
            </div>
            <div className="card">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="font-semibold">Color BOM</span>
              </div>
              <p className="text-2xl font-bold">{parsedData.colorBOM?.length || 0}</p>
              <p className="text-sm text-gray-600">Color variants</p>
            </div>
            <div className="card">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <span className="font-semibold">Measurements</span>
              </div>
              <p className="text-2xl font-bold">{parsedData.measurements?.length || 0}</p>
              <p className="text-sm text-gray-600">Measurements found</p>
            </div>
          </div>

          {/* View Selector */}
          <div className="card">
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setSelectedView('trims')}
                className={`btn ${selectedView === 'trims' ? 'btn-primary' : 'btn-secondary'}`}
              >
                Trims ({parsedData.trims?.length || 0})
              </button>
              <button
                onClick={() => setSelectedView('colorBOM')}
                className={`btn ${selectedView === 'colorBOM' ? 'btn-primary' : 'btn-secondary'}`}
              >
                Color BOM ({parsedData.colorBOM?.length || 0})
              </button>
              <button
                onClick={() => setSelectedView('measurements')}
                className={`btn ${selectedView === 'measurements' ? 'btn-primary' : 'btn-secondary'}`}
              >
                Measurements ({parsedData.measurements?.length || 0})
              </button>
            </div>

            {/* Trims View */}
            {selectedView === 'trims' && parsedData.trims && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Number</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">UM</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Suppliers</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {parsedData.trims.slice(0, 50).map((trim, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium">{trim.number}</td>
                        <td className="px-4 py-3 text-sm">{trim.description}</td>
                        <td className="px-4 py-3 text-sm">{trim.um}</td>
                        <td className="px-4 py-3 text-sm">
                          {trim.suppliers?.length > 0 ? (
                            <div className="space-y-1">
                              {trim.suppliers.map((supplier, sIdx) => (
                                <div key={sIdx} className="text-xs bg-blue-50 px-2 py-1 rounded">
                                  {supplier.name}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">No suppliers</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Color BOM View */}
            {selectedView === 'colorBOM' && parsedData.colorBOM && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Color</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Components</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {parsedData.colorBOM.map((color, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium">{color.colorName}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="space-y-1">
                            {color.components?.map((comp, cIdx) => (
                              <div key={cIdx} className="text-sm">
                                <span className="font-medium">{comp.component}</span>
                                {comp.usage && <span className="text-gray-600"> - {comp.usage}</span>}
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Measurements View */}
            {selectedView === 'measurements' && parsedData.measurements && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {parsedData.measurements.map((measurement, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium">{measurement.key}</td>
                        <td className="px-4 py-3 text-sm">{measurement.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Export Options */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Export Data</h3>
            <div className="flex gap-3">
              <button
                onClick={() => handleExport('all')}
                className="btn btn-primary flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export All Data
              </button>
              <button
                onClick={() => handleExport('trims')}
                className="btn btn-secondary flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Trims Only
              </button>
              <button
                onClick={() => handleExport('colorBOM')}
                className="btn btn-secondary flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Color BOM Only
              </button>
              <button
                onClick={() => {
                  setParsedData(null);
                  toast.success('Data cleared');
                }}
                className="btn btn-secondary flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear & Start Over
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

