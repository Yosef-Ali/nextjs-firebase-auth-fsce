import * as textract from 'textract';
import * as fs from 'fs';
import * as path from 'path';

const DOC_PATH = path.join(process.cwd(), 'app/dashboard/_components/docs/SPM  FSCE 2021-2025 Final Draft.doc');
const OUTPUT_PATH = path.join(process.cwd(), 'scripts/extracted-content.txt');

textract.fromFileWithPath(DOC_PATH, { preserveLineBreaks: true }, (error, text) => {
  if (error) {
    console.error('Error extracting text:', error);
    process.exit(1);
  }
  
  fs.writeFileSync(OUTPUT_PATH, text);
  console.log('Content extracted and saved to:', OUTPUT_PATH);
  console.log('Now you can copy this content into extract-text.ts');
});
