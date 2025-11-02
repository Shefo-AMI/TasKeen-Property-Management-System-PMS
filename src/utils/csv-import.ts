/**
 * Smart CSV/Excel Import Utility for Units & Tenants
 * 
 * Features:
 * - Parse CSV/Excel files
 * - Smart data mapping
 * - Payment reminder setup
 * - Bulk tenant creation
 * - Data validation
 */

export interface ImportedTenant {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  unitNumber: string;
  propertyName: string;
  rentAmount: number;
  rentDueDate: string; // Day of month (1-31)
  leaseStartDate: string;
  leaseEndDate: string;
  depositAmount: number;
  employmentInfo?: {
    employer: string;
    position: string;
    salary?: number;
  };
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: Array<{ row: number; message: string }>;
  reminders: Array<{
    tenantEmail: string;
    tenantName: string;
    reminderDate: string;
    amount: number;
  }>;
}

/**
 * Parse CSV file
 */
export async function parseCSV(file: File): Promise<Record<string, unknown>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          reject(new Error('CSV file must have at least a header and one data row'));
          return;
        }
        
        // Parse header
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        // Parse data rows
        const data = lines.slice(1).map((line, index) => {
          const values = line.split(',').map(v => v.trim());
          const row: Record<string, string> = {};
          
          headers.forEach((header, i) => {
            row[header] = values[i] || '';
          });
          
          return { ...row, _rowNumber: index + 2 }; // +2 because 0-indexed and header
        });
        
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

/**
 * Parse Excel file (XLSX)
 * Note: Requires xlsx library - we'll add it
 */
export async function parseExcel(file: File): Promise<Record<string, unknown>[]> {
  // Dynamic import to avoid bundle size if not needed
  const XLSX = await import('xlsx');
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[];
        
        resolve(jsonData.map((row, index) => ({
          ...row,
          _rowNumber: index + 2,
        })));
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Smart column mapping - auto-detect common column names
 */
const COLUMN_MAPPINGS: Record<string, string[]> = {
  firstName: ['first name', 'firstname', 'fname', 'given name'],
  lastName: ['last name', 'lastname', 'lname', 'surname', 'family name'],
  email: ['email', 'email address', 'e-mail', 'mail'],
  phone: ['phone', 'phone number', 'mobile', 'cell', 'contact number'],
  unitNumber: ['unit', 'unit number', 'unit no', 'unit#', 'apartment', 'apt'],
  propertyName: ['property', 'building', 'property name', 'building name', 'address'],
  rentAmount: ['rent', 'rent amount', 'monthly rent', 'rental amount', 'price'],
  rentDueDate: ['due date', 'rent due', 'due day', 'payment day', 'rent day'],
  leaseStartDate: ['lease start', 'start date', 'move in', 'move-in', 'contract start'],
  leaseEndDate: ['lease end', 'end date', 'move out', 'move-out', 'contract end'],
  depositAmount: ['deposit', 'security deposit', 'deposit amount'],
  employer: ['employer', 'company', 'workplace', 'employer name'],
  position: ['position', 'job title', 'title', 'role', 'occupation'],
  salary: ['salary', 'income', 'monthly income'],
};

/**
 * Map CSV/Excel columns to our data structure
 */
function mapColumns(row: Record<string, unknown>): Partial<ImportedTenant> & Record<string, unknown> {
  const mapped: Record<string, unknown> = {};
  
  // Get all keys from row (case-insensitive)
  const rowKeys = Object.keys(row).reduce((acc, key) => {
    acc[key.toLowerCase()] = row[key];
    return acc;
  }, {} as Record<string, unknown>);
  
  // Map each field
  Object.entries(COLUMN_MAPPINGS).forEach(([field, aliases]) => {
    for (const alias of aliases) {
      const key = Object.keys(rowKeys).find(k => 
        k.toLowerCase().includes(alias) || alias.includes(k.toLowerCase())
      );
      if (key && rowKeys[key]) {
        mapped[field] = rowKeys[key];
        break;
      }
    }
  });
  
  return mapped;
}

/**
 * Validate imported tenant data
 */
function validateTenant(data: Partial<ImportedTenant>, _rowNumber: number): string[] {
  const errors: string[] = [];
  
  if (!data.firstName) errors.push('First name is required');
  if (!data.lastName) errors.push('Last name is required');
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Valid email is required');
  }
  if (!data.phone) errors.push('Phone number is required');
  if (!data.unitNumber) errors.push('Unit number is required');
  if (!data.propertyName) errors.push('Property name is required');
  if (!data.rentAmount || isNaN(Number(data.rentAmount))) {
    errors.push('Valid rent amount is required');
  }
  if (!data.leaseStartDate) errors.push('Lease start date is required');
  if (!data.leaseEndDate) errors.push('Lease end date is required');
  
  return errors;
}

/**
 * Parse date from various formats
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  // Try various date formats
  const formats = [
    /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
    /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
    /^\d{2}-\d{2}-\d{4}$/, // MM-DD-YYYY
  ];
  
  for (const format of formats) {
    if (format.test(dateStr)) {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) return date;
    }
  }
  
  // Try direct parsing
  const date = new Date(dateStr);
  return !isNaN(date.getTime()) ? date : null;
}

/**
 * Generate payment reminders based on rent due date
 */
function generatePaymentReminders(
  tenants: ImportedTenant[]
): ImportResult['reminders'] {
  const reminders: ImportResult['reminders'] = [];
  
  tenants.forEach(tenant => {
    if (tenant.rentDueDate && tenant.rentAmount) {
      const dueDay = parseInt(tenant.rentDueDate);
      
      if (!isNaN(dueDay) && dueDay >= 1 && dueDay <= 31) {
        // Create reminders for next 12 months
        const currentDate = new Date();
        
        for (let month = 0; month < 12; month++) {
          const reminderDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + month,
            dueDay - 3 // 3 days before due date
          );
          
          reminders.push({
            tenantEmail: tenant.email,
            tenantName: `${tenant.firstName} ${tenant.lastName}`,
            reminderDate: reminderDate.toISOString(),
            amount: tenant.rentAmount,
          });
        }
      }
    }
  });
  
  return reminders;
}

/**
 * Main import function
 */
export async function importTenantsFromFile(
  file: File,
  onProgress?: (progress: number) => void
): Promise<ImportResult> {
  try {
    onProgress?.(10);
    
    // Determine file type and parse
    let rawData: Record<string, unknown>[];
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      rawData = await parseExcel(file);
    } else if (file.name.endsWith('.csv')) {
      rawData = await parseCSV(file);
    } else {
      throw new Error('Unsupported file format. Please upload CSV or Excel file.');
    }
    
    onProgress?.(30);
    
    const result: ImportResult = {
      success: true,
      imported: 0,
      failed: 0,
      errors: [],
      reminders: [],
    };
    
    const validTenants: ImportedTenant[] = [];
    
    // Process each row
    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      const rowNumber = (row._rowNumber as number) || i + 2;
      
      try {
        // Map columns
        const mapped = mapColumns(row);
        
        // Build tenant object
        const tenant: ImportedTenant = {
          firstName: mapped.firstName || '',
          lastName: mapped.lastName || '',
          email: mapped.email || '',
          phone: mapped.phone || '',
          unitNumber: mapped.unitNumber || '',
          propertyName: mapped.propertyName || '',
          rentAmount: parseFloat(String(mapped.rentAmount || 0)) || 0,
          rentDueDate: mapped.rentDueDate || '',
          leaseStartDate: mapped.leaseStartDate || '',
          leaseEndDate: mapped.leaseEndDate || '',
          depositAmount: parseFloat(String(mapped.depositAmount || 0)) || 0,
        };
        
        // Add employment info if available
        if (mapped.employer || mapped.position) {
          tenant.employmentInfo = {
            employer: String(mapped.employer || ''),
            position: String(mapped.position || ''),
            salary: mapped.salary ? parseFloat(String(mapped.salary)) : undefined,
          };
        }
        
        // Validate
        const errors = validateTenant(tenant, rowNumber);
        
        if (errors.length > 0) {
          result.failed++;
          result.errors.push({
            row: rowNumber,
            message: errors.join('; '),
          });
        } else {
          validTenants.push(tenant);
          result.imported++;
        }
        
        onProgress?.(30 + (i / rawData.length) * 50);
      } catch (error: unknown) {
        result.failed++;
        result.errors.push({
          row: rowNumber,
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
    
    onProgress?.(85);
    
    // Generate payment reminders
    result.reminders = generatePaymentReminders(validTenants);
    
    onProgress?.(100);
    
    return result;
  } catch (error: unknown) {
    throw new Error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Export template CSV
 */
export function generateImportTemplate(): string {
  const headers = [
    'First Name',
    'Last Name',
    'Email',
    'Phone',
    'Unit Number',
    'Property Name',
    'Rent Amount',
    'Rent Due Date',
    'Lease Start Date',
    'Lease End Date',
    'Deposit Amount',
    'Employer',
    'Position',
    'Salary',
  ];
  
  return headers.join(',') + '\n';
}

/**
 * Download template CSV
 */
export function downloadImportTemplate() {
  const template = generateImportTemplate();
  const blob = new Blob([template], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'tenant-import-template.csv';
  a.click();
  window.URL.revokeObjectURL(url);
}

