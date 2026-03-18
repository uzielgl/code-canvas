import React from "react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  leftChildren?: React.ReactNode;
  centerChildren?: React.ReactNode;
  children?: React.ReactNode;
}

const navClassName = "rounded-md px-3 py-1 text-xs font-mono transition-colors";

const AppHeader: React.FC<AppHeaderProps> = ({ leftChildren, centerChildren, children }) => {
  return (
    <div className="h-12 bg-deep-slate flex items-center px-4 shrink-0 gap-4 overflow-hidden">
      <div className="flex items-center gap-2 min-w-0 shrink-0">
        {leftChildren}
      </div>
      <div className="flex items-center gap-1 min-w-0 shrink">
        {centerChildren ?? (
          <nav className="flex items-center gap-1 shrink-0">
            <NavLink
              to="/"
              end
              className={cn(navClassName, "text-console-fg hover:text-primary-foreground")}
              activeClassName="bg-primary text-primary-foreground"
            >
              Editor
            </NavLink>
            <NavLink
              to="/examples"
              className={cn(navClassName, "text-console-fg hover:text-primary-foreground")}
              activeClassName="bg-primary text-primary-foreground"
            >
              Examples
            </NavLink>
            <NavLink
              to="/docs"
              className={cn(navClassName, "text-console-fg hover:text-primary-foreground")}
              activeClassName="bg-primary text-primary-foreground"
            >
              Docs
            </NavLink>
          </nav>
        )}
      </div>
      <div className="ml-auto flex items-center gap-2 min-w-0 shrink overflow-x-auto no-scrollbar">
        {children}
      </div>
    </div>
  );
};

export default AppHeader;
