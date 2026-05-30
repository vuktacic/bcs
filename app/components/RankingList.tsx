"use client";

import { motion } from "motion/react";

export default function RankingList({ title, data = [], query }: { title: string, data: any[] | undefined, query: string }) {
  return (
    <div className="p-3 bg-background z-1000 text-2xs md:text-xs text-foreground mx-auto md:mx-0 max-w-md text-left">
      {
        data?.map((school: { schoolname: string, schoolnumber: string, avg: number, writers: number, isPublic: boolean }, index: number) => (
          // filter for query matches
          (query === "" || school.schoolname.toLowerCase().includes(query?.toLowerCase()) || school.schoolnumber.includes(query)) ? (
            <motion.div
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.005 }}
              key={`${data.length}-${query}-${school.schoolnumber}`} className="text-left md:whitespace-nowrap overflow-scroll lg:overflow-hidden lg:truncate">
              <div className="grid grid-cols-12">
                <div className="text-left text-2xs text-foreground/70 col-auto">{index + 1}.</div>
                <div className="col-span-5 truncate" style={{ color: school.isPublic ? "var(--color-public-light)" : "var(--color-independent-light)" }}>
                  {school.schoolname}
                </div>
                <div className="text-right col-span-3">{school.avg?.toFixed(2) || "n/a"}%</div>
                <div className="text-right text-2xs text-foreground/70 col-span-3">{school.writers || "n/a"} Exams</div>
              </div>
            </motion.div>
          )
            : null

        ))
      }
    </div>
  )
}