"use client";

import { motion } from "motion/react";
import type { RankingEntry, RankingListProps } from "../types";

export default function RankingList(props: RankingListProps) {
  const { title, data = [], query } = props;

  return (
    <div className="p-3 bg-background z-1000 text-2xs md:text-xs text-foreground mx-auto md:mx-0 max-w-md text-left">
      {
        data?.map((entry: RankingEntry, index: number) => (
          // filter for query matches
          (query === "" || entry.name.toLowerCase().includes(query?.toLowerCase()) || entry.number.includes(query)) ? (
            <motion.div
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.005 }}
              key={`${data.length}-${query}-${entry.number}`} className="text-left md:whitespace-nowrap overflow-scroll lg:overflow-hidden lg:truncate">
              <div className="grid grid-cols-12">
                <div className="text-left text-2xs text-foreground/70 col-auto">{index + 1}.</div>
                <div className="col-span-5 truncate" style={{ color: entry.isPublic ? "var(--color-public-light)" : "var(--color-independent-light)" }}>
                  {entry.name}
                </div>
                <div className="text-right col-span-3">{entry.average?.toFixed(2) || "n/a"}%</div>
                <div className="text-right text-2xs text-foreground/70 col-span-3">{entry.writers || "n/a"} Exams</div>
              </div>
            </motion.div>
          )
            : null

        ))
      }
    </div>
  )
}