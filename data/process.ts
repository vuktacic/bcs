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
    }
  );
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
    NUMBER_EMERGING: row.NUMBER_EMERGING,
    NUMBER_DEVELOPING: row.NUMBER_DEVELOPING,
    NUMBER_PROFICIENT: row.NUMBER_PROFICIENT,
    NUMBER_EXTENDING: row.NUMBER_EXTENDING,
    SCORE: row.SCORE,
  };
}

fs.mkdirSync("../generated/schools", { recursive: true });
fs.mkdirSync("../generated/districts", { recursive: true });
fs.mkdirSync("../generated/province", { recursive: true });
fs.mkdirSync("../generated/indexes", { recursive: true });


const schoolIndex = [];
const districtIndex = [];

for(const entity of entities.values()) {
  const level = entity.DATA_LEVEL;
  let path = "";

  if(level === "Province Level") {
    if(entity.PUBLIC_OR_INDEPENDENT === "Province-Total") {
      path = "../generated/province/bc.json";
    }
    
    if(entity.PUBLIC_OR_INDEPENDENT === "Public School") {
      path = "../generated/province/public.json";
    }
    
    if(entity.PUBLIC_OR_INDEPENDENT === "Independent School") {
      path = "../generated/province/independent.json";
    }
  }

  if(level === "District Level") {
    path = `../generated/districts/${entity.DISTRICT_NUMBER}.json`;
    districtIndex.push({
      DISTRICT_NUMBER: entity.DISTRICT_NUMBER,
      DISTRICT_NAME: entity.DISTRICT_NAME,
    });
  }

  if(level === "School Level") {
    path = `../generated/schools/${entity.SCHOOL_NUMBER}.json`;

    schoolIndex.push({
      SCHOOL_NUMBER: entity.SCHOOL_NUMBER,
      SCHOOL_NAME: entity.SCHOOL_NAME,
      DISTRICT_NUMBER: entity.DISTRICT_NUMBER,
      DISTRICT_NAME: entity.DISTRICT_NAME,
      LOCATION: school_locations.get(entity.SCHOOL_NUMBER) || null,
    });
  }

  fs.writeFileSync(
    path,
    JSON.stringify(entity, null, 2),
  );
}

fs.writeFileSync(
  "../generated/indexes/schools.json",
  JSON.stringify(schoolIndex, null, 2),
);

fs.writeFileSync(
  "../generated/indexes/districts.json",
  JSON.stringify(districtIndex, null, 2),
);

fs.copyFileSync("simplified.geojson", "../generated/districts.geojson");