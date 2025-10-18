/**
 * TasKeen P.M.S. - Document Auto-Tagging System
 * Automatically suggests document categories based on file names and content
 */

export type DocumentCategory = 'lease' | 'inspection' | 'maintenance' | 'invoice' | 'tenant_documents' | 'photo' | 'other';

/**
 * Auto-suggest category based on file name
 */
export function suggestDocumentCategory(fileName: string): DocumentCategory {
  const name = fileName.toLowerCase();
  
  // Lease & Contract Documents
  if (name.includes('lease') || name.includes('contract') || name.includes('tenancy') || name.includes('agreement')) {
    return 'lease';
  }
  
  // Invoice & Payment Documents
  if (name.includes('invoice') || name.includes('receipt') || name.includes('payment') || 
      name.includes('bill') || name.includes('cheque') || name.includes('check') || 
      name.includes('deposit') || name.includes('ejari')) {
    return 'invoice';
  }
  
  // Inspection & Report Documents
  if (name.includes('inspection') || name.includes('report') || name.includes('checklist') || 
      name.includes('assessment') || name.includes('survey')) {
    return 'inspection';
  }
  
  // Maintenance Documents
  if (name.includes('maintenance') || name.includes('repair') || name.includes('work') || 
      name.includes('service') || name.includes('fix') || name.includes('plumbing') || 
      name.includes('electrical') || name.includes('hvac')) {
    return 'maintenance';
  }
  
  // Tenant ID Documents
  if (name.includes('id') || name.includes('passport') || name.includes('license') || 
      name.includes('emirates') || name.includes('visa') || name.includes('eid')) {
    return 'tenant_documents';
  }
  
  // Photo Documents (based on extension)
  if (name.match(/\.(jpg|jpeg|png|gif|heic|webp|bmp)$/i)) {
    return 'photo';
  }
  
  // Default
  return 'other';
}

/**
 * Get suggested description based on category
 */
export function suggestDescription(fileName: string, category: DocumentCategory): string {
  const suggestions: Record<DocumentCategory, string> = {
    lease: 'Lease contract and agreement documents',
    invoice: 'Payment invoice or receipt',
    inspection: 'Property inspection report',
    maintenance: 'Maintenance request or completion documentation',
    tenant_documents: 'Tenant identification documents',
    photo: 'Property or unit photograph',
    other: 'Miscellaneous document',
  };
  
  return suggestions[category] || 'Document';
}

/**
 * Validate file type for category
 */
export function validateFileForCategory(fileName: string, category: DocumentCategory): boolean {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  const allowedExtensions: Record<DocumentCategory, string[]> = {
    lease: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
    invoice: ['pdf', 'jpg', 'jpeg', 'png', 'xlsx', 'xls'],
    inspection: ['pdf', 'doc', 'docx', 'xlsx', 'jpg', 'jpeg', 'png'],
    maintenance: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'],
    tenant_documents: ['pdf', 'jpg', 'jpeg', 'png'],
    photo: ['jpg', 'jpeg', 'png', 'gif', 'heic', 'webp'],
    other: ['pdf', 'doc', 'docx', 'xlsx', 'jpg', 'jpeg', 'png', 'txt'],
  };
  
  return extension ? allowedExtensions[category]?.includes(extension) : false;
}

/**
 * Get category display name
 */
export function getCategoryDisplayName(category: DocumentCategory): string {
  const displayNames: Record<DocumentCategory, string> = {
    lease: 'Lease Contract',
    invoice: 'Invoice/Receipt',
    inspection: 'Inspection Report',
    maintenance: 'Maintenance Record',
    tenant_documents: 'Tenant Documents',
    photo: 'Photo',
    other: 'Other',
  };
  
  return displayNames[category] || category;
}

/**
 * Get category color for badges
 */
export function getCategoryColor(category: DocumentCategory): string {
  const colors: Record<DocumentCategory, string> = {
    lease: 'bg-blue-500',
    invoice: 'bg-purple-500',
    inspection: 'bg-green-500',
    maintenance: 'bg-orange-500',
    tenant_documents: 'bg-indigo-500',
    photo: 'bg-pink-500',
    other: 'bg-gray-500',
  };
  
  return colors[category] || colors.other;
}

/**
 * Extract metadata from file name
 */
export function extractMetadata(fileName: string): {
  unitNumber?: string;
  date?: string;
  type?: string;
} {
  const metadata: any = {};
  
  // Try to extract unit number (e.g., Unit101, 101, U-101)
  const unitMatch = fileName.match(/unit[_-]?(\d+)|u[_-]?(\d+)|^(\d{3,4})/i);
  if (unitMatch) {
    metadata.unitNumber = unitMatch[1] || unitMatch[2] || unitMatch[3];
  }
  
  // Try to extract date (YYYY-MM-DD or DDMMYYYY)
  const dateMatch = fileName.match(/(\d{4}[-/]\d{2}[-/]\d{2})|(\d{2}[-/]\d{2}[-/]\d{4})/);
  if (dateMatch) {
    metadata.date = dateMatch[0];
  }
  
  // Extract document type
  if (fileName.includes('before')) metadata.type = 'before';
  if (fileName.includes('after')) metadata.type = 'after';
  if (fileName.includes('final')) metadata.type = 'final';
  if (fileName.includes('draft')) metadata.type = 'draft';
  
  return metadata;
}

/**
 * Generate smart file name based on metadata
 */
export function generateFileName(
  category: DocumentCategory,
  linkedType: string,
  linkedName: string,
  originalFileName: string
): string {
  const extension = originalFileName.split('.').pop();
  const timestamp = new Date().toISOString().split('T')[0];
  const sanitizedName = linkedName.replace(/[^a-zA-Z0-9]/g, '_');
  
  return `${category}_${linkedType}_${sanitizedName}_${timestamp}.${extension}`;
}

export default {
  suggestDocumentCategory,
  suggestDescription,
  validateFileForCategory,
  getCategoryDisplayName,
  getCategoryColor,
  extractMetadata,
  generateFileName,
};
