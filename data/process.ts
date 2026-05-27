import fs from "fs";
import Papa from "papaparse";

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

type LocationRow = {
  MINCODE: string;
  LATITUDE: string;
  LONGITUDE: string;
};

const na10 = "Numeracy Assessment 10";
const la10 = "Literacy Assessment 10";
const la12 = "Literacy Assessment 12";
const currentYear = "2024/2025";

const csv = fs.readFileSync("raw-data.csv", "utf-8");
const parsed = Papa.parse<Row>(csv, {
  header: true,
  skipEmptyLines: true,
});

const rows = parsed.data.filter(
  (row) => row["SUB_POPULATION"] === "All Students",
);

const locations_csv = fs.readFileSync("locations.csv", "utf-8");
const parsed_locations = Papa.parse<LocationRow>(locations_csv, {
  header: true,
  skipEmptyLines: true,
});

const location_rows = parsed_locations.data;
const school_locations = new Map();

for (const row of location_rows) {
  school_locations.set(row.MINCODE, {
    lat: row.LATITUDE,
    lng: row.LONGITUDE,
  });
}

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
      PUBLIC: row.PUBLIC_OR_INDEPENDENT === "Public School",
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
    entity.assessments[assessment] = {};
  }

  if (!entity.assessments[assessment][year]) {
    entity.assessments[assessment][year] = {};
  }

  entity.assessments[assessment][year] = {
    ASSESSMENT_LANGUAGE: row.ASSESSMENT_LANGUAGE,
    NUMBER_WRITERS: row.NUMBER_WRITERS,
    // NUMBER_EMERGING: row.NUMBER_EMERGING,
    // NUMBER_DEVELOPING: row.NUMBER_DEVELOPING,
    // NUMBER_PROFICIENT: row.NUMBER_PROFICIENT,
    // NUMBER_EXTENDING: row.NUMBER_EXTENDING,
    SCORE: row.SCORE,
    // round to 2 decimals
    // AVERAGE: parseFloat(row.SCORE) / parseInt(row.NUMBER_WRITERS),
    AVERAGE:
      parseInt(row.NUMBER_WRITERS) > 0
        ? (parseFloat(row.SCORE) / parseInt(row.NUMBER_WRITERS)).toFixed(2)
        : 0,
  };
}

fs.mkdirSync("../public/schools", { recursive: true });
fs.mkdirSync("../public/districts", { recursive: true });
fs.mkdirSync("../public/province", { recursive: true });
fs.mkdirSync("../public/indexes", { recursive: true });

const schoolIndex = [];
const districtIndex = [];

for (const entity of entities.values()) {
  const level = entity.DATA_LEVEL;
  let path = "";
  let writers = 0;
  let score = 0;
  let avg = 0;
  const hasAllThree = [na10, la10, la12].every((assessment) => {
    const entry = entity.assessments[assessment]?.[currentYear];
    if(!entry) {
      return false;
    }
    return parseInt(entry.NUMBER_WRITERS) > 0;
  });

  if (entity.assessments[na10]?.[currentYear]?.AVERAGE !== 0 || entity.assessments[la10]?.[currentYear]?.AVERAGE !== 0 || entity.assessments[la12]?.[currentYear]?.AVERAGE !== 0) {
    for (const assessment of [na10, la10, la12]) {
      if (entity.assessments[assessment]?.[currentYear]) {
        writers +=
          parseInt(
            entity.assessments[assessment]?.[currentYear]?.NUMBER_WRITERS,
          ) || 0;
        score +=
          parseFloat(entity.assessments[assessment]?.[currentYear]?.SCORE) || 0;
      }
    }
  } else {
    writers = 0;
    score = 0;
    avg = 0;
  }

  if (writers > 0) {
    avg = parseFloat((score / writers).toFixed(2));
  }

  if (level === "Province Level") {
    if (entity.PUBLIC_OR_INDEPENDENT === "Province-Total") {
      path = "../public/province/bc.json";
    }

    if (entity.PUBLIC_OR_INDEPENDENT === "Public School") {
      path = "../public/province/public.json";
    }

    if (entity.PUBLIC_OR_INDEPENDENT === "Independent School") {
      path = "../public/province/independent.json";
    }
  }

  if (level === "District Level") {
    path = `../public/districts/${entity.DISTRICT_NUMBER}.json`;
    const districtAverage = hasAllThree ? parseFloat(avg.toFixed(2)) : 0;
    districtIndex.push({
      DISTRICT_NUMBER: entity.DISTRICT_NUMBER,
      DISTRICT_NAME: entity.DISTRICT_NAME,
      PUBLIC: entity.PUBLIC,
      WRITERS: writers,
      SCORE: score,
      AVERAGE: districtAverage,
      RANK: 0,
    });
  }

  if(level === "School Level") {
    path = `../public/schools/${entity.SCHOOL_NUMBER}.json`;
    const schoolAverage = hasAllThree ? parseFloat(avg.toFixed(2)) : 0;

    schoolIndex.push({
      SCHOOL_NUMBER: entity.SCHOOL_NUMBER,
      SCHOOL_NAME: entity.SCHOOL_NAME,
      DISTRICT_NUMBER: entity.DISTRICT_NUMBER,
      DISTRICT_NAME: entity.DISTRICT_NAME,
      PUBLIC: entity.PUBLIC,
      WRITERS: writers,
      SCORE: score,
      AVERAGE: schoolAverage,
      RANK: 0,
      LOCATION: school_locations.get(entity.SCHOOL_NUMBER) || null,
    });
  }

  fs.writeFileSync(path, JSON.stringify(entity, null, 2));
}

// sort schools by score and then assign ranks
schoolIndex.sort((a, b) => b.AVERAGE - a.AVERAGE);

schoolIndex.forEach((school, index) => {
  school.RANK = index + 1;
});

fs.writeFileSync(
  "../public/indexes/schools.json",
  JSON.stringify(schoolIndex, null, 2),
);

districtIndex.sort((a, b) => b.AVERAGE - a.AVERAGE);
districtIndex.forEach((district, index) => {
  district.RANK = index + 1;
});

fs.writeFileSync(
  "../public/indexes/districts.json",
  JSON.stringify(districtIndex, null, 2),
);

fs.copyFileSync("simplified.geojson", "../public/districts.geojson");
