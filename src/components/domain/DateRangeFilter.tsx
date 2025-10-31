import { useState, useEffect } from 'react';
import { CalendarWithYearSelector } from '../ui/calendar-with-year-selector';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../ui/utils';

interface DateRangeFilterProps {
  startDate: Date;
  endDate: Date;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  onApply: () => void;
}

export const DateRangeFilter = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onApply,
}: DateRangeFilterProps) => {
  const [error, setError] = useState<string>('');
  const [startMonth, setStartMonth] = useState<Date>(startDate);
  const [endMonth, setEndMonth] = useState<Date>(endDate);

  useEffect(() => {
    // Validate date range (max 3 months)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const maxDays = 90; // approximately 3 months

    if (diffDays > maxDays) {
      setError('A diferença máxima entre as datas deve ser de 3 meses');
    } else if (startDate > endDate) {
      setError('A data inicial não pode ser maior que a data final');
    } else {
      setError('');
    }
  }, [startDate, endDate]);

  // Update internal month state when dates change
  useEffect(() => {
    setStartMonth(startDate);
  }, [startDate]);

  useEffect(() => {
    setEndMonth(endDate);
  }, [endDate]);

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
      <div className="flex-1">
        <label className="text-sm mb-2 block">Data Inicial</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(
                'w-full justify-start text-left',
                !startDate && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? (
                format(startDate, 'dd/MM/yyyy', { locale: ptBR })
              ) : (
                <span>Selecione uma data</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
<CalendarWithYearSelector
  mode="single"
  selected={startDate}
  onSelect={(date: Date | undefined) => date && onStartDateChange(date)}
  month={startMonth}
  onMonthChange={setStartMonth}
  initialFocus
/>

          </PopoverContent>
        </Popover>
      </div>

      <div className="flex-1">
        <label className="text-sm mb-2 block">Data Final</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(
                'w-full justify-start text-left',
                !endDate && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? (
                format(endDate, 'dd/MM/yyyy', { locale: ptBR })
              ) : (
                <span>Selecione uma data</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarWithYearSelector
  mode="single"
  selected={endDate}
  onSelect={(date: Date | undefined) => date && onEndDateChange(date)}
  month={endMonth}
  onMonthChange={setEndMonth}
  initialFocus
/>

          </PopoverContent>
        </Popover>
      </div>

      <Button onClick={onApply} disabled={!!error} className="w-full sm:w-auto">
        Aplicar Filtro
      </Button>

      {error && (
        <p className="text-sm text-red-600 w-full sm:w-auto">{error}</p>
      )}
    </div>
  );
};
