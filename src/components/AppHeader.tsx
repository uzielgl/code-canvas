import React from "react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  children?: React.ReactNode;
}

const navClassName = "rounded-md px-3 py-1 text-xs font-mono transition-colors";

const AppHeader: React.FC<AppHeaderProps> = ({ children }) => {
  return (
    <div className="h-12 bg-deep-slate flex items-center justify-between px-4 shrink-0 gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <span className="font-mono text-xs font-bold tracking-wider text-primary-foreground whitespace-nowrap">
          WIREFRAME<span className="text-primary">DSL</span>
        </span>
        <div className="h-4 w-px bg-wire-stroke/30" />
        <nav className="flex items-center gap-1">
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
        </nav>
      </div>
      <div className="flex items-center gap-2 flex-wrap justify-end">
        {children}
      </div>
    </div>
  );
};

export default AppHeader;
