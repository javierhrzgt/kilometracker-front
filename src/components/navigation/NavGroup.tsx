"use client";

import { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface NavGroupProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  isCollapsed?: boolean;
  defaultOpen?: boolean;
}

export function NavGroup({
  title,
  icon,
  children,
  isCollapsed = false,
  defaultOpen = false,
}: NavGroupProps) {
  // When collapsed, show icon with tooltip
  if (isCollapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center justify-center px-2 py-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              {icon}
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{title}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // When expanded, show full accordion
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={defaultOpen ? "item-1" : undefined}
      className="w-full"
    >
      <AccordionItem value="item-1" className="border-none">
        <AccordionTrigger className="px-3 py-2 hover:bg-accent rounded-lg hover:no-underline">
          <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
            <div className="flex-shrink-0">{icon}</div>
            <span>{title}</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-1 pt-1">
          <div className="ml-6 space-y-1 border-l border-border pl-3">
            {children}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
