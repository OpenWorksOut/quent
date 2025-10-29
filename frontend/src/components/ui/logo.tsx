import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "default" | "white";
}

export const Logo = ({ className, variant = "default" }: LogoProps) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-8 h-8"
      >
        <rect
          width="32"
          height="32"
          rx="4"
          fill={variant === "white" ? "#FFFFFF" : "#E31837"}
        />
        <path
          d="M8 16H24M16 8V24"
          stroke={variant === "white" ? "#E31837" : "#FFFFFF"}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span
        className={cn(
          "text-xl font-semibold tracking-tight",
          variant === "white" ? "text-white" : "text-primary"
        )}
      >
        QuantBank
      </span>
    </div>
  );
};
