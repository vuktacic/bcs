"use client";

import {
  CartesianGrid,
  Legend,
  LegendProps,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  TooltipContentProps,
  XAxis,
  YAxis
} from "recharts";
import type { DisplayPopupProps } from "../types";

const na10 = "Numeracy Assessment 10";
const la10 = "Literacy Assessment 10";
const la12 = "Literacy Assessment 12";
const currentYear = "2024/2025";

function buildSeries(assessments: any, provinceData: any) {
  const yearCollector = new Set<string>();

  [na10, la10, la12].forEach((assessment) => {
    Object.keys(assessments?.[assessment] || {}).forEach((year) => yearCollector.add(year));
  });

  const years = Array.from(yearCollector).sort();

  return years.map((year) => {
    const row: any = { year: year };

    [na10, la10, la12].forEach((assessment) => {
      if (assessments?.[assessment]?.[year]?.AVERAGE !== 0) {
        row[assessment] = assessments?.[assessment]?.[year]?.AVERAGE;
      } else {
        row[assessment] = null;
      }

      row[`${assessment}_prov`] = provinceData.assessments?.[assessment]?.[year]?.AVERAGE || null;
    });

    return row;
  });
}

const CustomTooltip = ({ active, payload, label }: TooltipContentProps) => {
  const firstPayload = payload?.[0];
  const isVisible = active && firstPayload != null;

  return (
    <div className="custom-tooltip" style={{ visibility: isVisible ? 'visible' : 'hidden' }}>
      {isVisible && (
        <div className="w-full flex justify-between items-start">
          <div className="grid grid-cols-3 grid-rows-2 gap-x-2 mx-auto">
            {[na10, la10, la12].map((assessment) => {
              const entry = payload.find((p) => p.dataKey === assessment)!;
              const prov = payload.find((p) => p.dataKey === `${assessment}_prov`)!;
              if (entry) {
                return (
                  <div key={entry.key}>
                    <div className="" style={{ color: entry.color }}>
                      {entry.value}%
                    </div>
                    <div className="text-xs" style={{ color: prov?.color }}>
                      {prov?.value}%
                    </div>
                  </div>
                );
              }
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const CustomLegend = (props: LegendProps & { payload?: readonly any[] }) => {
  const { payload } = props;
  return (
    <div className="custom-legend grid grid-cols-2 grid-rows-3">
      {[na10, la10, la12].map((assessment) => {
        const entry = payload?.find((p: any) => p.dataKey === assessment);
        const prov = payload?.find((p: any) => p.dataKey === `${assessment}_prov`);

        return (
          <div key={assessment} className="col-span-2 row-span-1 flex flex-row gap-2 items-center">
            <div className="text-xs text-right w-28" style={{ color: entry?.color ?? undefined }} title={String(entry?.value ?? "")}>
              {String(entry?.value ?? assessment).replace("Assessment ", "")}
            </div>
            <div className="text-xs text-left w-32" style={{ color: prov?.color ?? undefined }} title={String(prov?.value ?? "")}>{String(prov?.value ?? "").replace("Assessment ", "")}</div>
          </div>
        );
      })}
    </div>
  );
};

export default function DisplayPopup(props: DisplayPopupProps) {
  const { selected, object, isSchool, provinceData, popupWidth } = props;

  return (
    <div className="bg-background text-foreground w-full h-full">
      {isSchool ?
        <div>
          <strong style={{ color: object.PUBLIC ? "var(--color-public-light)" : "var(--color-independent-light)" }}>
            {object.SCHOOL_NAME} ({object.SCHOOL_NUMBER})
          </strong>
          <br />

          {object.PUBLIC ?
            <div>District: {object.DISTRICT_NAME} {(object.DISTRICT_NUMBER ? `(${object.DISTRICT_NUMBER})` : "")}</div>
            : null}
        </div>
        :
        <div>
          <strong>{object.DISTRICT_NAME} ({object.DISTRICT_NUMBER})</strong>
        </div>}

      <div>
        {selected ? (
          <div className="mt-2">
            <div><strong>Assessment Mean Scores ({currentYear}):</strong></div>
            <div>Numeracy 10: {selected?.assessments?.[na10]?.[currentYear]?.AVERAGE || "—"}% - {selected?.assessments?.[na10]?.[currentYear]?.NUMBER_WRITERS || "—"} Exams</div>
            <div>Literacy 10: {selected?.assessments?.[la10]?.[currentYear]?.AVERAGE || "—"}% - {selected?.assessments?.[la10]?.[currentYear]?.NUMBER_WRITERS || "—"} Exams</div>
            <div>Literacy 12: {selected?.assessments?.[la12]?.[currentYear]?.AVERAGE || "—"}% - {selected?.assessments?.[la12]?.[currentYear]?.NUMBER_WRITERS || "—"} Exams</div>
          </div>
        ) : (
          <div><em>Loading data...</em></div>
        )}
      </div>
      <strong className="mt-2 block">Score Trends:</strong>

      {selected ? (
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={buildSeries(selected.assessments, provinceData)} style={{}}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis domain={[0, 100]} />
            <Tooltip
              content={CustomTooltip}
              position={{ x: 70, y: 5 }}
            />
            <Legend content={CustomLegend} wrapperStyle={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px"
            }} />
            {/* only add padders if viewport below md */}
            <Line connectNulls type="monotone" name={na10} dataKey={na10} stroke="#a09cff" strokeWidth={2} />
            <Line connectNulls type="monotone" name={la10} dataKey={la10} stroke="#7ff0a9" strokeWidth={2} />
            <Line connectNulls type="monotone" name={la12} dataKey={la12} stroke="#ffc658" strokeWidth={2} />
            <Line connectNulls strokeDasharray="5 5" type="monotone" name={`${na10}_prov`} dataKey={`${na10}_prov`} stroke="#4e4b82" strokeWidth={2} />
            <Line connectNulls strokeDasharray="5 5" type="monotone" name={`${la10}_prov`} dataKey={`${la10}_prov`} stroke="#4f7d5f" strokeWidth={2} />
            <Line connectNulls strokeDasharray="5 5" type="monotone" name={`${la12}_prov`} dataKey={`${la12}_prov`} stroke="#baba6e" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div><em>Loading data...</em></div>
      )}
    </div>
  );
}