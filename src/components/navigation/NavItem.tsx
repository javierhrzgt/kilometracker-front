"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface NavItemProps {
  href: string;
  icon: ReactNode;
  label: string;
  badge?: string | number;
  isCollapsed?: boolean;
  onClick?: () => void;
}

export function NavItem({
  href,
  icon,
  label,
  badge,
  isCollapsed = false,
  onClick,
}: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  const content = (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent",
        isActive
          ? "bg-primary/10 text-primary border-l-2 border-primary"
          : "text-muted-foreground hover:text-foreground",
        isCollapsed && "justify-center px-2"
      )}
    >
      <div className="flex-shrink-0">{icon}</div>
      {!isCollapsed && (
        <>
          <span className="flex-1">{label}</span>
          {badge !== undefined && (
            <Badge variant="secondary" className="ml-auto">
              {badge}
            </Badge>
          )}
        </>
      )}
    </Link>
  );

  if (isCollapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-4">
            {label}
            {badge !== undefined && (
              <Badge variant="secondary">{badge}</Badge>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}
