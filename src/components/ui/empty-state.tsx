import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface EmptyStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: EmptyStateAction;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4 border border-border rounded-lg bg-card">
      <div className="text-muted-foreground/40 mb-4">
        {icon}
      </div>

      <h3 className="text-lg font-semibold mb-2 text-foreground">
        {title}
      </h3>

      <p className="text-sm text-muted-foreground mb-6 max-w-md">
        {description}
      </p>

      {action && (
        <Button
          onClick={() => {
            if (action.onClick) {
              action.onClick();
            } else if (action.href) {
              window.location.href = action.href;
            }
          }}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
