import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ReactNode } from "react";

interface TipProps {
  text: string;
  children: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
}

export default function Tip({ text, children, side = "top" }: TipProps) {
  return (
    <TooltipProvider delayDuration={400}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side} className="text-xs px-2 py-1">{text}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
