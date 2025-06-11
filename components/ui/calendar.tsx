"use client"

import type * as React from "react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      hideNavigation={true}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4 w-full",
        caption: "flex justify-center pt-2 pb-3 relative items-center",
        caption_label: "text-lg font-medium text-[#fffbea]",
        table: "w-full border-collapse",
        head_row: "flex justify-between w-full",
        head_cell: "text-[#fffbea] rounded-md w-9 font-normal text-[0.8rem] text-center",
        row: "flex justify-between w-full mt-2",
        cell: "relative p-0",
        day: cn(
          "h-9 w-9 p-0 font-normal text-[#fffbea] hover:bg-[#3a3a3a] hover:text-[#ff7145] rounded-md transition-colors aria-selected:opacity-100 flex items-center justify-center",
        ),
        day_range_end: "day-range-end",
        day_selected: "bg-[#ff7145] text-[#fffbea] hover:bg-[#ff7145] hover:text-[#fffbea]",
        day_today: "bg-[#3a3a3a] text-[#ff7145] font-medium",
        day_outside: "text-[#fffbea]/50 opacity-50",
        day_disabled: "text-[#fffbea]/30 opacity-30 line-through",
        day_range_middle: "aria-selected:bg-[#3a3a3a] aria-selected:text-[#fffbea]",
        day_hidden: "invisible",
        nav: "hidden",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      disabled={props.disabled}
      fromDate={props.fromDate}
      toDate={props.toDate}
      defaultMonth={props.defaultMonth}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
