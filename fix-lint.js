#!/usr/bin/env node

/**
 * Automated ESLint Fix Script
 * Systematically fixes common lint errors for deployment readiness
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Mapping of unused variables to fix with underscore prefix
const unusedVarFixes = {
  // BlockButton.tsx
  'src/components/BlockButton.tsx': [
    { from: "'useBlockuseUnblockuseIsUserBlocked'", to: "'_useBlockuseUnblockuseIsUserBlocked'" }
  ],
  
  // FileUpload.tsx
  'src/components/FileUpload.tsx': [
    { from: "'estimateCompressionSavings'", to: "'_estimateCompressionSavings'" },
    { from: "'showPreview'", to: "'_showPreview'" },
    { from: "'resetUploadState'", to: "'_resetUploadState'" }
  ],
  
  // FollowButton.tsx  
  'src/components/FollowButton.tsx': [
    { from: "'Loader2PlusMinusCheck'", to: "'_Loader2PlusMinusCheck'" }
  ],
  
  // ImageGallery.tsx
  'src/components/ImageGallery.tsx': [
    { from: "'allowReorder'", to: "'_allowReorder'" }
  ],
  
  // MarkdownEditor.tsx
  'src/components/MarkdownEditor.tsx': [
    { from: "'CreateInsertImage'", to: "'_CreateInsertImage'" }
  ],
  
  // MobileMenu.tsx
  'src/components/MobileMenu.tsx': [
    { from: "'Lightbulbs'", to: "'_Lightbulbs'" }
  ],
  
  // NotificationCenter.tsx
  'src/components/NotificationCenter.tsx': [
    { from: "'CheckMoreHorizontal'", to: "'_CheckMoreHorizontal'" },
    { from: "'DropdownMenuItem'", to: "'_DropdownMenuItem'" },
    { from: "'unreadLoading'", to: "'_unreadLoading'" }
  ],
  
  // PostCreateForm.tsx
  'src/components/PostCreateForm.tsx': [
    { from: "'X'", to: "'_X'" },
    { from: "'Trash2'", to: "'_Trash2'" }
  ],
  
  // ProjectCard.tsx
  'src/components/ProjectCard.tsx': [
    { from: "'ExternalGithub'", to: "'_ExternalGithub'" }
  ],
  
  // ProjectGrid.tsx
  'src/components/ProjectGrid.tsx': [
    { from: "'getCategoryCount'", to: "'_getCategoryCount'" }
  ],
  
  // ReportDialog.tsx
  'src/components/ReportDialog.tsx': [
    { from: "'CreateReportParams'", to: "'_CreateReportParams'" },
    { from: "'errors'", to: "'_errors'" },
    { from: "'hasFieldError'", to: "'_hasFieldError'" }
  ],
  
  // SearchHighlight.tsx
  'src/components/SearchHighlight.tsx': [
    { from: "'parts'", to: "'_parts'" }
  ]
};

function fixFile(filePath, fixes) {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;
  
  fixes.forEach(fix => {
    if (content.includes(fix.from)) {
      content = content.replace(new RegExp(fix.from, 'g'), fix.to);
      modified = true;
      console.log(`✅ Fixed ${fix.from} → ${fix.to} in ${filePath}`);
    }
  });
  
  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8');
    return true;
  }
  
  return false;
}

function main() {
  console.log('🚀 Starting automated lint fixes...\n');
  
  let totalFixed = 0;
  
  // Fix unused variables
  Object.entries(unusedVarFixes).forEach(([filePath, fixes]) => {
    if (fixFile(filePath, fixes)) {
      totalFixed++;
    }
  });
  
  console.log(`\n📊 Summary: Fixed ${totalFixed} files`);
  console.log('🔧 Run "npm run lint" to check remaining issues');
}

// Run if script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}