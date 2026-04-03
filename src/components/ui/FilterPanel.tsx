"use client";

import { useState, type ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";

interface FilterPanelProps {
  onApply: () => void;
  onClear: () => void;
  /** Number of active filters — shows badge on mobile Filtros button */
  activeCount?: number;
  /** Tailwind grid class for desktop layout, e.g. "grid grid-cols-1 sm:grid-cols-3 gap-4" */
  gridClassName?: string;
  /**
   * Extra controls (e.g. "Mostrar inactivos" checkbox).
   * Renders inline with the mobile Filtros button AND below the grid on desktop.
   * NOT shown inside the Sheet (already accessible inline on mobile).
   */
  extras?: ReactNode;
  /** Filter field groups — each should be a <div className="space-y-2"> with Label + Input/Select */
  children: ReactNode;
}

export function FilterPanel({
  onApply,
  onClear,
  activeCount = 0,
  gridClassName = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
  extras,
  children,
}: FilterPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile: filter trigger row */}
      <div className="flex md:hidden items-center gap-2 mb-4">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => setOpen(true)}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtros
          {activeCount > 0 && (
            <span className="ml-2 rounded-full bg-primary text-primary-foreground text-xs font-bold h-5 w-5 flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </Button>
        {extras}
      </div>

      {/* Desktop: filter card */}
      <div className="hidden md:block mb-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Filtros</CardTitle>
              <Button variant="ghost" size="sm" onClick={onClear}>
                <X className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={gridClassName}>{children}</div>
            {extras && <div>{extras}</div>}
            <div className="flex justify-end">
              <Button onClick={onApply}>
                <Filter className="h-4 w-4 mr-2" />
                Aplicar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile: filter Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl pb-8 bg-card">
          <SheetHeader className="mb-4">
            <SheetTitle>Filtros</SheetTitle>
          </SheetHeader>
          <div className="space-y-4">{children}</div>
          <div className="flex gap-2 mt-6">
            <Button
              className="flex-1"
              onClick={() => { onApply(); setOpen(false); }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Aplicar
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => { onClear(); setOpen(false); }}
            >
              <X className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
