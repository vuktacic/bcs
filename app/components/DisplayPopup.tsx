import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, TooltipContentProps, XAxis, YAxis } from "recharts";

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
                    <div className="text-xs" style={{ color: prov.color }}>
                      {prov.value}%
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

export default function DisplayPopup({ selected, object, isSchool, provinceData, popupWidth }: { selected: any, object: any, isSchool: boolean, provinceData: any, popupWidth: number }) {
  return (
    <div style={{ width: `${popupWidth}px`, maxWidth: `${popupWidth}px` }}>
      {isSchool ?
        <div>
          <strong>{object.SCHOOL_NAME} ({object.SCHOOL_NUMBER})</strong><br />
          District: {object.DISTRICT_NAME} {(object.DISTRICT_NUMBER ? `(${object.DISTRICT_NUMBER})` : "")}
        </div>
        :
        <div>
          <strong>{object.DISTRICT_NAME} ({object.DISTRICT_NUMBER})</strong>
        </div>}

      <div>
        {selected ? (
          <div>
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
          <LineChart data={buildSeries(selected.assessments, provinceData)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis domain={[0, 100]} />
            <Tooltip
              content={CustomTooltip}
              position={{ x: 70, y: 5 }}
            />
            <Legend />
            <Line connectNulls type="monotone" dataKey={na10} stroke="#8884d8" strokeWidth={2} />
            <Line connectNulls type="monotone" dataKey={la10} stroke="#82ca9d" strokeWidth={2} />
            <Line connectNulls type="monotone" dataKey={la12} stroke="#ffc658" strokeWidth={2} />
            <Line connectNulls type="monotone" dataKey={`${na10}_prov`} stroke="#ababc8" strokeWidth={1} />
            <Line connectNulls type="monotone" dataKey={`${la10}_prov`} stroke="#91b59e" strokeWidth={1} />
            <Line connectNulls type="monotone" dataKey={`${la12}_prov`} stroke="#baba6e" strokeWidth={1} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div><em>Loading data...</em></div>
      )}
    </div>
  );
}