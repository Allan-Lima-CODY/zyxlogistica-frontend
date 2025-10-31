"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, type DayPickerProps } from "react-day-picker";

import { cn } from "./utils";
import { buttonVariants } from "./button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

interface CalendarWithYearSelectorProps
  extends Omit<DayPickerProps, "month" | "onMonthChange"> {
  month?: Date;
  onMonthChange?: (month: Date) => void;
  selected?: Date | undefined;
  onSelect?: (date: Date | undefined) => void;
}

function CalendarWithYearSelector({
  className,
  classNames,
  showOutsideDays = true,
  month: controlledMonth,
  onMonthChange,
  ...props
}: CalendarWithYearSelectorProps) {
  const [internalMonth, setInternalMonth] = React.useState<Date>(() => {
    if (controlledMonth) return controlledMonth;

    // ops: props.selected pode ser tipo específico dependendo do mode,
    // então fazemos coerção segura — checamos se é Date em runtime.
    const maybeSelected = (props as any).selected;
    if (maybeSelected instanceof Date) return maybeSelected;
    return new Date();
  });

  const currentMonth = controlledMonth !== undefined ? controlledMonth : internalMonth;

  const handleMonthChange = (newMonth: Date) => {
    if (controlledMonth === undefined) {
      setInternalMonth(newMonth);
    }
    onMonthChange?.(newMonth);
  };

  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const currentYear = currentMonth.getFullYear();
  const currentMonthIndex = currentMonth.getMonth();

  // Generate years from 1900 to current year + 1
  const years = Array.from(
    { length: new Date().getFullYear() - 1899 + 1 },
    (_, i) => 1900 + i
  );

  const handleYearChange = (year: string) => {
    const newDate = new Date(currentMonth);
    newDate.setFullYear(parseInt(year));
    handleMonthChange(newDate);
  };

  const handleMonthSelect = (month: string) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(parseInt(month));
    handleMonthChange(newDate);
  };

  return (
    <div className="relative">
      <div className="flex gap-2 mb-3 px-3 pt-3">
        <Select value={currentMonthIndex.toString()} onValueChange={handleMonthSelect}>
          <SelectTrigger className="h-8 flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {months.map((month, index) => (
              <SelectItem key={index} value={index.toString()}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={currentYear.toString()} onValueChange={handleYearChange}>
          <SelectTrigger className="h-8 w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.slice().reverse().map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DayPicker
        month={currentMonth}
        onMonthChange={handleMonthChange}
        showOutsideDays={showOutsideDays}
        className={cn("p-3 pt-0", className)}
        classNames={{
          months: "flex flex-col sm:flex-row gap-2",
          month: "flex flex-col gap-4",
          caption: "flex justify-center pt-1 relative items-center w-full",
          caption_label: "text-sm font-medium",
          nav: "flex items-center gap-1",
          nav_button: cn(
            buttonVariants({ variant: "outline" }),
            "size-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          ),
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-x-1",
          head_row: "flex",
          head_cell:
            "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
          row: "flex w-full mt-2",
          cell: cn(
            "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-range-end)]:rounded-r-md",
            (props as any).mode === "range"
              ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
              : "[&:has([aria-selected])]:rounded-md",
          ),
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "size-8 p-0 font-normal aria-selected:opacity-100",
          ),
          day_range_start:
            "day-range-start aria-selected:bg-primary aria-selected:text-primary-foreground",
          day_range_end:
            "day-range-end aria-selected:bg-primary aria-selected:text-primary-foreground",
          day_selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "bg-accent text-accent-foreground",
          day_outside:
            "day-outside text-muted-foreground aria-selected:text-muted-foreground",
          day_disabled: "text-muted-foreground opacity-50",
          day_range_middle:
            "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
          ...classNames,
        }}
        components={{
          // tipagem explícita do parâmetro para evitar 'implicit any'
          IconLeft: ({ className, ...iconProps }: { className?: string; [k: string]: any }) => (
            <ChevronLeft className={cn("size-4", className)} {...iconProps} />
          ),
          IconRight: ({ className, ...iconProps }: { className?: string; [k: string]: any }) => (
            <ChevronRight className={cn("size-4", className)} {...iconProps} />
          ),
        } as CalendarWithYearSelectorProps["components"]}
        /* <-- importante: cast aqui para contornar os overloads do DayPicker.
           Se você preferir tipagem estrita, dá pra tornar o componente genérico por `mode`,
           mas isso complica o uso. Este cast é a solução prática e segura. */
        {...(props as DayPickerProps)}
      />
    </div>
  );
}

export { CalendarWithYearSelector };