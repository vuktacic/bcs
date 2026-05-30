"use client";

export default function RankingList({ title, data = [] }: { title: string, data: any[] | undefined }) {
  return (
    <div className="p-3 bg-background z-1000 text-2xs md:text-xs text-foreground mx-auto md:mx-0 max-w-md text-left">
      {
        data?.map((school: { schoolname: string, schoolnumber: string, avg: number, writers: number }, index: number) => (
          <div key={school.schoolnumber} className="text-left md:whitespace-nowrap overflow-scroll lg:overflow-hidden lg:truncate">
            <div className="grid grid-cols-12">
              <div className="text-left text-2xs text-foreground/70 col-auto">{index + 1}.</div>
              <div className="col-span-5 truncate">{school.schoolname}</div>
              <div className="text-right col-span-3">{school.avg?.toFixed(2) || "n/a"}%</div>
              <div className="text-right text-2xs text-foreground/70 col-span-3">{school.writers || "n/a"} Exams</div>
            </div>
          </div>
        ))
      }
    </div>
  )
}