"use client";

export default function RankingList({ title, data = [] }: { title: string, data: any[] | undefined }) {
  return (
    <div className="p-3 bg-background z-1000 text-2xs md:text-xs text-foreground mx-auto md:mx-0 max-w-md text-left">
      {
        data?.map((school: { schoolname: string, schoolnumber: string, avg: number, writers: number }, index: number) => (
          <div key={school.schoolnumber} className="text-left md:whitespace-nowrap overflow-scroll lg:overflow-hidden lg:truncate">
            {index + 1}. {school.schoolname} - {school.avg}% - {school.writers} Exams
          </div>
        ))
      }
    </div>
  )
}