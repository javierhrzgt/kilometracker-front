"use client";

import * as React from "react";
import { CalendarIcon, TriangleAlert } from "lucide-react";
import { es } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { getDatesBetween, splitDistanceEqually, formatDateForDisplay } from "@/lib/dateUtils";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

export interface DateRangeFieldProps {
  singleValue: string;
  onSingleChange: (date: string) => void;
  rangeValue: { from: string; to: string } | null;
  onRangeChange: (range: { from: string; to: string } | null) => void;
  distancia?: number;
  disabled?: boolean;
}

// Convert YYYY-MM-DD string to a local Date (avoids UTC offset shift)
function strToDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// Convert a local Date to YYYY-MM-DD string
function dateToStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function DateRangeField({
  singleValue,
  onSingleChange,
  rangeValue,
  onRangeChange,
  distancia,
  disabled = false,
}: DateRangeFieldProps) {
  const isMobile = useIsMobile();
  const [isRangeMode, setIsRangeMode] = React.useState(false);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const [pendingRange, setPendingRange] = React.useState<DateRange | undefined>(
    rangeValue
      ? { from: strToDate(rangeValue.from), to: strToDate(rangeValue.to) }
      : undefined
  );

  const today = new Date();

  // Summary pill calculation
  const summaryData = React.useMemo(() => {
    if (!rangeValue?.from || !rangeValue?.to) return null;
    const dates = getDatesBetween(rangeValue.from, rangeValue.to);
    const days = dates.length;
    if (days < 2) return null;
    const splits = distancia && distancia > 0 ? splitDistanceEqually(distancia, days) : null;
    const kmPerDay = splits ? splits[0] : null;
    return { days, kmPerDay };
  }, [rangeValue, distancia]);

  const handleEnterRangeMode = () => {
    setIsRangeMode(true);
    setPendingRange(
      rangeValue
        ? { from: strToDate(rangeValue.from), to: strToDate(rangeValue.to) }
        : undefined
    );
    if (isMobile) {
      setSheetOpen(true);
    } else {
      setPopoverOpen(true);
    }
  };

  const handleExitRangeMode = () => {
    setIsRangeMode(false);
    onRangeChange(null);
    setPendingRange(undefined);
  };

  const handleConfirm = () => {
    if (pendingRange?.from && pendingRange?.to) {
      onRangeChange({
        from: dateToStr(pendingRange.from),
        to: dateToStr(pendingRange.to),
      });
    }
    setSheetOpen(false);
    setPopoverOpen(false);
  };

  const handleCancel = () => {
    setPendingRange(
      rangeValue
        ? { from: strToDate(rangeValue.from), to: strToDate(rangeValue.to) }
        : undefined
    );
    setSheetOpen(false);
    setPopoverOpen(false);
  };

  const openPicker = (side: "from" | "to") => {
    if (isMobile) {
      setSheetOpen(true);
    } else {
      setPopoverOpen(true);
    }
    // Scroll selected side into view — handled by Calendar internally
    void side;
  };

  const calendarNode = (
    <div className="flex flex-col gap-4">
      <Calendar
        mode="range"
        selected={pendingRange}
        onSelect={setPendingRange}
        locale={es}
        disabled={{ after: today }}
        numberOfMonths={1}
        className={cn(
          "[--cell-size:3rem]",
          "w-full"
        )}
      />
      <div className="text-sm text-muted-foreground text-center min-h-[1.25rem]">
        {pendingRange?.from && pendingRange?.to
          ? (() => {
              const days = getDatesBetween(dateToStr(pendingRange.from), dateToStr(pendingRange.to)).length;
              return `${formatDateForDisplay(dateToStr(pendingRange.from))} → ${formatDateForDisplay(dateToStr(pendingRange.to))} · ${days} día${days !== 1 ? "s" : ""}`;
            })()
          : pendingRange?.from
          ? `Desde ${formatDateForDisplay(dateToStr(pendingRange.from))} — selecciona la fecha fin`
          : "Selecciona la fecha de inicio"}
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={handleCancel}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          className="flex-1"
          disabled={!pendingRange?.from || !pendingRange?.to}
          onClick={handleConfirm}
        >
          Confirmar
        </Button>
      </div>
    </div>
  );

  if (!isRangeMode) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Fecha *</Label>
          <button
            type="button"
            disabled={disabled}
            onClick={handleEnterRangeMode}
            className="text-xs text-primary underline-offset-2 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ¿Viaje de varios días?
          </button>
        </div>
        <input
          type="date"
          value={singleValue}
          onChange={(e) => onSingleChange(e.target.value)}
          disabled={disabled}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Rango de fechas *</Label>
        <button
          type="button"
          disabled={disabled}
          onClick={handleExitRangeMode}
          className="text-xs text-primary underline-offset-2 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Fecha única
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Inicio */}
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Inicio</span>
          {isMobile ? (
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              onClick={() => openPicker("from")}
              className="justify-start font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate">
                {rangeValue?.from ? formatDateForDisplay(rangeValue.from) : "Seleccionar"}
              </span>
            </Button>
          ) : (
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={disabled}
                  className="justify-start font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">
                    {rangeValue?.from ? formatDateForDisplay(rangeValue.from) : "Seleccionar"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4" align="start">
                {calendarNode}
              </PopoverContent>
            </Popover>
          )}
        </div>

        {/* Fin */}
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Fin</span>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={() => openPicker("to")}
            className="justify-start font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate">
              {rangeValue?.to ? formatDateForDisplay(rangeValue.to) : "Seleccionar"}
            </span>
          </Button>
        </div>
      </div>

      {/* Summary pill */}
      {summaryData && (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            "flex items-start gap-3 rounded-lg border px-4 py-3 text-sm",
            summaryData.kmPerDay && summaryData.kmPerDay > 1000
              ? "border-warning bg-warning/10"
              : "border-border bg-muted/40"
          )}
        >
          {summaryData.kmPerDay && summaryData.kmPerDay > 1000 ? (
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          ) : (
            <CalendarIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          )}
          <div>
            <p className="font-medium">
              {formatDateForDisplay(rangeValue!.from)} → {formatDateForDisplay(rangeValue!.to)}
            </p>
            <p className="text-muted-foreground">
              {summaryData.days} días
              {summaryData.kmPerDay !== null && ` · ${summaryData.kmPerDay} km/día`}
            </p>
          </div>
        </div>
      )}

      {/* Mobile bottom sheet */}
      {isMobile && (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto rounded-t-2xl">
            <SheetHeader className="mb-4">
              <SheetTitle>Selecciona el rango de fechas</SheetTitle>
            </SheetHeader>
            {calendarNode}
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
