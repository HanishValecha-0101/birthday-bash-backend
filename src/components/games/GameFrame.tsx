import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type GameFrameProps = {
  title: string;
  subtitle: string;
  badge?: string;
  className?: string;
  children: ReactNode;
};

const GameFrame = ({ title, subtitle, badge, className, children }: GameFrameProps) => {
  return (
    <Card className={cn("overflow-hidden rounded-[1.5rem] border-border/80 bg-card/95", className)}>
      <CardHeader className="border-b border-border/70 bg-muted/50 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base text-foreground">{title}</CardTitle>
            <CardDescription className="mt-1 text-xs text-muted-foreground">{subtitle}</CardDescription>
          </div>
          {badge ? (
            <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {badge}
            </span>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="p-5">{children}</CardContent>
    </Card>
  );
};

export default GameFrame;