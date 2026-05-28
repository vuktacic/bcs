"use client";

export default function RankingList({ title, data = [] }: { title: string, data: any[] | undefined }) {
  return (
    <div className="h-[19vh] bg-white z-1000 p-3 rounded shadow text-sm text-black mb-4">

      <div className="font-semibold">{title}</div>

      <div className="h-[15vh] overflow-y-auto p-4">
        {
          data?.map((school: { schoolname: string, schoolnumber: string, avg: number, writers: number }, index: number) => (
            <div key={school.schoolnumber}>
              {index + 1}. {school.schoolname} - {school.avg}% - {school.writers} Exams
            </div>
          ))
        }
      </div>
    </div>
  )
}