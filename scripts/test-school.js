const fs = require('fs');
const path = require('path');

const currentYear = '2024/2025';
const na = 'Numeracy Assessment 10';
const la10 = 'Literacy Assessment 10';
const la12 = 'Literacy Assessment 12';

const file = path.join(__dirname, '..', 'public', 'schools', '00501007.json');

try {
  const raw = fs.readFileSync(file, 'utf8');
  const data = JSON.parse(raw);

  console.log('School:', data.SCHOOL_NAME, data.SCHOOL_NUMBER);
  console.log('District:', data.DISTRICT_NAME, data.DISTRICT_NUMBER);
  console.log('Numeracy:', data.assessments?.[na]?.[currentYear]?.SCORE ?? '—');
  console.log('Literacy 10:', data.assessments?.[la10]?.[currentYear]?.SCORE ?? '—');
  console.log('Literacy 12:', data.assessments?.[la12]?.[currentYear]?.SCORE ?? '—');
} catch (err) {
  console.error('Error reading/parsing file:', err);
  process.exit(1);
}
