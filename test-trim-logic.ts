import * as fs from 'fs';
import * as path from 'path';

const na10 = "Numeracy Assessment 10";
const la10 = "Literacy Assessment 10";
const la12 = "Literacy Assessment 12";

function buildCombinedScoreSeries(assessments: any, provinceData?: any) {
    const allYears = new Set<string>();
    
    [na10, la10, la12].forEach(key => {
        Object.keys(assessments?.[key] || {}).forEach(year => allYears.add(year));
        Object.keys(provinceData?.assessments?.[key] || {}).forEach(year => allYears.add(year));
    });
    
    const years = Array.from(allYears).sort();

    const rows = years.map(year => {
        const obj: any = { year };

        [na10, la10, la12].forEach(key => {
            const value = assessments?.[key]?.[year];
            if (value) {
                const score = parseFloat(value.SCORE) / parseFloat(value.NUMBER_WRITERS) || 0;
                obj[key] = Math.round(score * 100) / 100;
            }

            const provValue = provinceData?.assessments?.[key]?.[year];
            if (provValue) {
                const score = parseFloat(provValue.SCORE) / parseFloat(provValue.NUMBER_WRITERS) || 0;
                obj[`${key}_prov`] = Math.round(score * 100) / 100;
            }
        });

        return obj;
    });

    // Interpolate runs of zero/undefined values for each series using linear slope
    const seriesKeys = new Set<string>();
    rows.forEach(r => Object.keys(r).forEach(k => { if (k !== 'year') seriesKeys.add(k); }));

    seriesKeys.forEach(key => {
        // collect indices where the value is defined and non-zero
        const defined: number[] = [];
        for (let i = 0; i < rows.length; i++) {
            const v = rows[i][key];
            if (v !== undefined && v !== null && Number.isFinite(v) && v !== 0) defined.push(i);
        }

        if (defined.length < 2) return; // need two surrounding points to interpolate

        for (let di = 0; di < defined.length - 1; di++) {
            const startIdx = defined[di];
            const endIdx = defined[di + 1];
            const startVal = rows[startIdx][key];
            const endVal = rows[endIdx][key];
            const span = endIdx - startIdx;
            if (span <= 1) continue;
            const slope = (endVal - startVal) / span;

            for (let j = startIdx + 1; j < endIdx; j++) {
                const cur = rows[j][key];
                if (cur === undefined || cur === 0) {
                    const interp = startVal + slope * (j - startIdx);
                    rows[j][key] = Math.round(interp * 100) / 100;
                }
            }
        }
    });

    return rows;
}

function trimLeadingTrailingZeros(data: any[]) {
    if (!data || data.length === 0) return data;

    const primarySeries = [na10, la10, la12];
    
    // For each series, independently remove leading and trailing zeros
    primarySeries.forEach(key => {
        // Find first row where this series has non-zero/non-null value
        let firstValidIdx = -1;
        for (let i = 0; i < data.length; i++) {
            const v = data[i][key];
            if (v !== undefined && v !== null && v !== 0) {
                firstValidIdx = i;
                break;
            }
        }

        // Find last row where this series has non-zero/non-null value
        let lastValidIdx = -1;
        for (let i = data.length - 1; i >= 0; i--) {
            const v = data[i][key];
            if (v !== undefined && v !== null && v !== 0) {
                lastValidIdx = i;
                break;
            }
        }

        // Clear values outside the valid range for this series
        if (firstValidIdx !== -1) {
            for (let i = 0; i < firstValidIdx; i++) {
                delete data[i][key];
            }
            for (let i = lastValidIdx + 1; i < data.length; i++) {
                delete data[i][key];
            }
        }
    });

    return data;
}

// Load real data
const districtPath = path.join(__dirname, 'public', 'districts', '005.json');
const provincePath = path.join(__dirname, 'public', 'province', 'bc.json');

const districtData = JSON.parse(fs.readFileSync(districtPath, 'utf-8'));
const provinceData = JSON.parse(fs.readFileSync(provincePath, 'utf-8'));

console.log('=== TESTING TRIM LOGIC ===\n');
console.log('District:', districtData.DISTRICT_NAME);
console.log('Province: BC\n');

const fullSeries = buildCombinedScoreSeries(districtData.assessments, provinceData);
const trimmedSeries = trimLeadingTrailingZeros(fullSeries);

console.log('FULL SERIES (before trim):');
console.table(fullSeries);
console.log(`Total rows: ${fullSeries.length}\n`);

console.log('TRIMMED SERIES (after trim):');
console.table(trimmedSeries);
console.log(`Total rows: ${trimmedSeries.length}\n`);

console.log('ANALYSIS:');
console.log(`Removed leading rows: ${fullSeries.findIndex((r) => {
    const hasPrimary = [na10, la10, la12].some(k => r[k] !== undefined && r[k] !== null && r[k] !== 0);
    return hasPrimary;
})}`);

const lastPrimaryIdx = fullSeries.length - 1 - [...fullSeries].reverse().findIndex((r) => {
    const hasPrimary = [na10, la10, la12].some(k => r[k] !== undefined && r[k] !== null && r[k] !== 0);
    return hasPrimary;
});

console.log(`Removed trailing rows: ${fullSeries.length - lastPrimaryIdx - 1}\n`);

// Check for leading zeros in trimmed data
console.log('FIRST ROW OF TRIMMED DATA:');
console.log(trimmedSeries[0]);
console.log('\nPrimary series values in first row:');
console.log(`  ${na10}: ${trimmedSeries[0]?.[na10]}`);
console.log(`  ${la10}: ${trimmedSeries[0]?.[la10]}`);
console.log(`  ${la12}: ${trimmedSeries[0]?.[la12]}`);

if (trimmedSeries[0]) {
    const hasZero = [na10, la10, la12].some(k => trimmedSeries[0][k] === 0);
    console.log(`\nStill has zero values in first row: ${hasZero}`);
}
