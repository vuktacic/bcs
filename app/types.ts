import type { GeoJsonObject } from "geojson";


// component types

export type BaseProps = {
    geojsonData: GeoJsonObject,
    schoolIndex: SchoolIndex[],
    districtIndex: DistrictIndex[],
    provinceData: ProvincialData,
    publicData: ProvincialData,
    independentData: ProvincialData,
    query: string,
    globalFilter: any
};

export type MapProps = BaseProps & {
    onPopupOpen: () => void
};

export type ProvinceDisplayProps = BaseProps & {
    setQuery: (query: string) => void
    setGlobalFilter: (filter: any) => void,
    isMobileDrawerOpen: boolean,
    setIsMobileDrawerOpen: (open: boolean) => void
};

export type DisplayPopupProps = {
    selected: any,
    object: any,
    isSchool: boolean,
    provinceData: any,
    popupWidth: number
};

export type RankingListProps = {
    title: string,
    data: any[] | undefined,
    query: string
};

export type SearchProps = {
    query: string,
    setQuery: (query: string) => void,
    onFocus: () => void
};


// object types
export type RankingEntry = {
    name: string,
    number: string,
    average: number,
    writers: number,
    isPublic: boolean
};

export type SchoolIndexRaw = {
    SCHOOL_NUMBER: string,
    SCHOOL_NAME: string,
    DISTRICT_NUMBER: string,
    DISTRICT_NAME: string,
    PUBLIC: boolean,
    WRITERS: number | null,
    AVERAGE: number | null,
    RANK: number
    LOCATION: {
        lat: number,
        lng: number
    } | null
};

export type SchoolIndex = {
    schoolNumber: string,
    schoolName: string,
    districtNumber: string,
    districtName: string,
    public: boolean,
    writers: number | null,
    average: number | null,
    rank: number,

    location: {
        lat: number,
        lng: number
    }
};

export type DistrictIndexRaw = {
    DISTRICT_NUMBER: string,
    DISTRICT_NAME: string,
    PUBLIC: boolean,
    WRITERS: number | null,
    AVERAGE: number | null,
    RANK: number
};

export type DistrictIndex = {
    districtNumber: string,
    districtName: string,
    public: boolean,
    writers: number | null,
    average: number | null,
    rank: number
};

export type ProvincialDataRaw = {
    DATA_LEVEL: string,
    PUBLIC_OR_INDEPENDENT: string,
    PUBLIC: boolean,
    DISTRICT_NUMBER: string,
    DISTRICT_NAME: string,
    SCHOOL_NUMBER: string,
    SCHOOL_NAME: string,
    SUB_POPULATION: string,
    assessments: {
        [assessment: string]: {
            [year: string]: {
                ASSESSMENT_LANGUAGE: string,
                NUMBER_WRITERS: string,
                SCORE: string,
                AVERAGE: number
            }
         }
     }
};

export type ProvincialData = {
    dataLevel: string,
    publicOrIndependent: string,
    public: boolean,
    districtNumber: string,
    districtName: string,
    schoolNumber: string,
    schoolName: string,
    subPopulation: string,
    assessments: {
        [assessment: string]: {
            [year: string]: {
                assessmentLanguage: string,
                numberWriters: string,
                score: string,
                average: number
            }
         }
     }
};