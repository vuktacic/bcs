"use client";

export default function RankingList({ title, data = [] }: { title: string, data: any[] | undefined }) {
  return (
    <div className="p-3 bg-white z-1000 text-2xs md:text-xs text-black overflow-x-hidden truncate mr-3">
      {
        data?.map((school: { schoolname: string, schoolnumber: string, avg: number, writers: number }, index: number) => (
          <div key={school.schoolnumber}>
            {index + 1}. {school.schoolname} - {school.avg}% - {school.writers} Exams
          </div>
        ))
      }
    </div>
  )
}