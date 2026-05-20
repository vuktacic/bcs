import fs from "fs";
import Papa from "papaparse";
import z, { string } from "zod";

type Row = {
  SCHOOL_YEAR: string;
  DATA_LEVEL: string;
  PUBLIC_OR_INDEPENDENT: string;
  DISTRICT_NUMBER: string;
  DISTRICT_NAME: string;
  SCHOOL_NUMBER: string;
  SCHOOL_NAME: string;
  SUB_POPULATION: string;
  GRADUATION_ASSESSMENT: string;
  ASSESSMENT_LANGUAGE: string;
  NUMBER_WRITERS: string;
  NUMBER_EMERGING: string;
  NUMBER_DEVELOPING: string;
  NUMBER_PROFICIENT: string;
  NUMBER_EXTENDING: string;
  SCORE: string;
};

const csv = fs.readFileSync("raw-data.csv", "utf-8");

const parsed = Papa.parse<Row>(csv, {
  header: true,
  skipEmptyLines: true,
});

const rows = parsed.data.filter(
  (row) => row["SUB_POPULATION"] === "All Students",
);

function getKey(row: Row) {
  const level = row.DATA_LEVEL;
  const pi = row.PUBLIC_OR_INDEPENDENT;
  const district = row.DISTRICT_NUMBER;
  const school = row.SCHOOL_NUMBER;

  return `${level}:${pi}:${district}:${school}`;
}

const entities = new Map<string, any>();

for (const row of rows) {
  const key = getKey(row);

  if (!entities.has(key)) {
    entities.set(key, {
      DATA_LEVEL: row.DATA_LEVEL,
      PUBLIC_OR_INDEPENDENT: row.PUBLIC_OR_INDEPENDENT,
      DISTRICT_NUMBER: row.DISTRICT_NUMBER,
      DISTRICT_NAME: row.DISTRICT_NAME,
      SCHOOL_NUMBER: row.SCHOOL_NUMBER,
      SCHOOL_NAME: row.SCHOOL_NAME,
      SUB_POPULATION: row.SUB_POPULATION,
      assessments: {},
    });
  }

  const entity = entities.get(key);

  const assessment = row.GRADUATION_ASSESSMENT;
  const year = row.SCHOOL_YEAR;

  if (!assessment || !year) {
    console.log(`skipped: ${JSON.stringify(row)}`);
    continue;
  }

  if (!entity.assessments[assessment]) {
    entity.assessments[assessment] = [];
  }

  if (!entity.assessments[assessment][year]) {
    entity.assessments[assessment][year] = [];
  }

  entity.assessments[assessment][year].push({
    ASSESSMENT_LANGUAGE: row.ASSESSMENT_LANGUAGE,
    NUMBER_WRITERS: row.NUMBER_WRITERS,
    NUMBER_EMERGING: row.NUMBER_EMERGING,
    NUMBER_DEVELOPING: row.NUMBER_DEVELOPING,
    NUMBER_PROFICIENT: row.NUMBER_PROFICIENT,
    NUMBER_EXTENDING: row.NUMBER_EXTENDING,
    SCORE: row.SCORE,
  });
}

// for (const entity of entities.values()) {
//   for (const key of Object.keys(entity.assessments)) {
//     entity.assessments[key].sort((a: any, b: any) =>
//         a.SCHOOL_YEAR.localeCompare(b.SCHOOL_YEAR)
//     );
//   }
// }

fs.writeFileSync(
  "../generated/entities.json",
  JSON.stringify([...entities.values()], null, 2),
);
