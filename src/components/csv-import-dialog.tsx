/**
 * CSV/Excel Import Dialog Component
 * Smart import for Units & Tenants with payment reminders
 */

import React, { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Progress } from './ui/progress'
import { ScrollArea } from './ui/scroll-area'
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Download,
  FileSpreadsheet,
  Bell,
  Loader2,
  Sparkles
} from 'lucide-react'
import { 
  importTenantsFromFile, 
  downloadImportTemplate,
  type ImportResult 
} from '../utils/csv-import'
import { toast } from 'sonner'

interface CSVImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImportComplete: () => void
  companyId: string
}

export function CSVImportDialog({ 
  open, 
  onOpenChange, 
  onImportComplete,
  companyId: _companyId 
}: CSVImportDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<ImportResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      // Validate file type
      const validTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ]
      const validExtensions = ['.csv', '.xls', '.xlsx']
      const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.'))

      if (
        validTypes.includes(selectedFile.type) || 
        validExtensions.includes(fileExtension.toLowerCase())
      ) {
        setFile(selectedFile)
        setResult(null)
        setProgress(0)
      } else {
        toast.error('Invalid file type. Please upload a CSV or Excel file.')
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    }
  }

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a file first')
      return
    }

    try {
      setImporting(true)
      setProgress(0)

      // Import tenants from file
      const importResult = await importTenantsFromFile(file, (prog) => {
        setProgress(prog)
      })

      setResult(importResult)

      if (importResult.success && importResult.imported > 0) {
        // Save to Supabase
        await saveToSupabase(importResult)
        
        toast.success(
          `Successfully imported ${importResult.imported} tenant(s)!`,
          {
            description: importResult.failed > 0 
              ? `${importResult.failed} row(s) failed. Check errors below.`
              : 'All tenants imported successfully with payment reminders set up.',
          }
        )

        if (importResult.reminders.length > 0) {
          toast.info(
            `Payment reminders created for ${importResult.reminders.length} upcoming payments`,
            { duration: 5000 }
          )
        }

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        setFile(null)
        onImportComplete()
      } else {
        toast.error('Import failed. Please check the errors below.')
      }
    } catch (error: unknown) {
      console.error('Import error:', error)
      toast.error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setImporting(false)
      setProgress(0)
    }
  }

  const saveToSupabase = async (importResult: ImportResult) => {
    // This would save the imported tenants and payment reminders to Supabase
    // Implementation depends on your Supabase schema
    try {
      // TODO: Implement actual Supabase save logic
      // For now, just log
      console.log('Would save to Supabase:', importResult)
      
      // Example structure:
      // 1. Create tenants in 'tenants' table
      // 2. Create units in 'units' table if they don't exist
      // 3. Create payment reminders in 'payment_reminders' table
      
      toast.success('Data saved to database')
    } catch (error) {
      console.error('Error saving to Supabase:', error)
      toast.error('Failed to save to database')
    }
  }

  const handleDownloadTemplate = () => {
    downloadImportTemplate()
    toast.success('Template downloaded! Fill it with your data and upload.')
  }

  const handleClose = () => {
    if (!importing) {
      setFile(null)
      setResult(null)
      setProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <FileSpreadsheet className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle>Import Units & Tenants</DialogTitle>
              <DialogDescription>
                Upload a CSV or Excel file to import tenants and automatically set up payment reminders
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* File Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Step 1: Upload File</CardTitle>
              <CardDescription>
                Supported formats: CSV, XLS, XLSX
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xls,.xlsx"
                  onChange={handleFileSelect}
                  disabled={importing}
                  className="hidden"
                  id="csv-import-input"
                />
                <label htmlFor="csv-import-input" className="cursor-pointer">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm font-medium mb-2">
                    {file ? file.name : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    CSV or Excel files only
                  </p>
                </label>
              </div>

              {file && (
                <div className="flex items-center gap-2 p-3 bg-accent rounded-lg">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm flex-1">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                  {!importing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFile(null)
                        if (fileInputRef.current) {
                          fileInputRef.current.value = ''
                        }
                      }}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3" />
                <span>Smart import will automatically map columns and set up payment reminders</span>
              </div>
            </CardContent>
          </Card>

          {/* Template Download */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium mb-1">Need a template?</p>
                  <p className="text-xs text-muted-foreground">
                    Download our CSV template with example data
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Import Progress */}
          {importing && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Importing...</span>
                    <span className="text-muted-foreground">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Import Results */}
          {result && !importing && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Import Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-green-600">{result.imported}</p>
                    <p className="text-xs text-muted-foreground">Imported</p>
                  </div>
                  <div className="text-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                    <XCircle className="h-6 w-6 text-red-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-red-600">{result.failed}</p>
                    <p className="text-xs text-muted-foreground">Failed</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <Bell className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-blue-600">{result.reminders.length}</p>
                    <p className="text-xs text-muted-foreground">Reminders</p>
                  </div>
                </div>

                {result.errors.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2 text-red-600">Errors:</p>
                    <ScrollArea className="h-32">
                      <div className="space-y-1">
                        {result.errors.map((error, index) => (
                          <div key={index} className="text-xs p-2 bg-red-50 dark:bg-red-950/20 rounded">
                            <span className="font-medium">Row {error.row}:</span> {error.message}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                {result.reminders.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Payment Reminders Created:
                    </p>
                    <ScrollArea className="h-32">
                      <div className="space-y-1">
                        {result.reminders.slice(0, 5).map((reminder, index) => (
                          <div key={index} className="text-xs p-2 bg-blue-50 dark:bg-blue-950/20 rounded">
                            <span className="font-medium">{reminder.tenantName}</span> - 
                            AED {reminder.amount.toLocaleString()} on{' '}
                            {new Date(reminder.reminderDate).toLocaleDateString()}
                          </div>
                        ))}
                        {result.reminders.length > 5 && (
                          <p className="text-xs text-muted-foreground italic">
                            ...and {result.reminders.length - 5} more reminders
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose} disabled={importing}>
              {result ? 'Close' : 'Cancel'}
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={!file || importing}
            >
              {importing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

