"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addMonths, subMonths } from "date-fns";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./select";
import { Button } from "./button";
import { cn } from "./utils";

interface SmartCalendarProps {
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  month?: Date;
  onMonthChange?: (date: Date) => void;
  initialFocus?: boolean;
}

export function SmartCalendar({
  selected,
  onSelect,
  month,
  onMonthChange,
}: SmartCalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(month ?? new Date());

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const years = Array.from({ length: 200 }, (_, i) => 1900 + i);

  const handleChangeMonth = (newMonth: Date) => {
    setCurrentMonth(newMonth);
    onMonthChange?.(newMonth);
  };

  const daysOfWeek = ["D", "S", "T", "Q", "Q", "S", "S"]; // PT-BR normal

  const getDaysMatrix = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const firstWeekDay = firstDay.getDay();
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

    let calendar: (Date | null)[] = [];
    for (let i = 0; i < firstWeekDay; i++) calendar.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      calendar.push(new Date(date.getFullYear(), date.getMonth(), d));
    }
    while (calendar.length % 7 !== 0) calendar.push(null);
    return calendar;
  };

  const matrix = getDaysMatrix(currentMonth);

  return (
    <div className="p-3 pt-2 w-[280px]">
      {/* Header */}
      <div className="flex gap-2 mb-3">
        <Select
          value={currentMonth.getMonth().toString()}
          onValueChange={(m) =>
            handleChangeMonth(new Date(currentMonth.setMonth(parseInt(m))))
          }
        >
          <SelectTrigger className="h-8 flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {months.map((m, i) => (
              <SelectItem key={i} value={i.toString()}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={currentMonth.getFullYear().toString()}
          onValueChange={(y) =>
            handleChangeMonth(new Date(currentMonth.setFullYear(parseInt(y))))
          }
        >
          <SelectTrigger className="h-8 w-[90px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8"
          onClick={() => handleChangeMonth(subMonths(currentMonth, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8"
          onClick={() => handleChangeMonth(addMonths(currentMonth, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-7 text-center text-xs text-muted-foreground mb-1">
        {daysOfWeek.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {matrix.map((date, idx) => {
          const isSelected =
            date &&
            selected &&
            date.toDateString() === selected.toDateString();

          return (
            <button
              key={idx}
              disabled={!date}
              onClick={() => date && onSelect?.(date)}
              className={cn(
                "h-8 w-8 flex items-center justify-center text-sm rounded-md hover:bg-accent",
                isSelected && "bg-primary text-primary-foreground hover:bg-primary",
                !date && "opacity-0 cursor-default"
              )}
            >
              {date?.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}