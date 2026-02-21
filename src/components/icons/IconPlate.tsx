import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface IconPlateProps {
  svg?: string | null;
  pngUrl?: string | null;
  sizePx?: number;
  variant?: "dark" | "yellow";
  label?: string;
  className?: string;
}

export default function IconPlate({
  svg,
  pngUrl,
  sizePx = 72,
  variant = "dark",
  label,
  className,
}: IconPlateProps) {
  const isDark = variant === "dark";

  const plateClasses = cn(
    "inline-flex items-center justify-center rounded-[6px] shrink-0 overflow-hidden",
    isDark
      ? "bg-secondary border border-primary/30"
      : "bg-primary border border-primary",
    className
  );

  const iconColor = isDark ? "hsl(45 100% 50%)" : "hsl(0 0% 4%)";
  const innerSize = Math.round(sizePx * 0.65);

  const renderIcon = () => {
    if (svg) {
      // Inject currentColor-friendly SVG
      const processed = svg
        .replace(/fill="(?!none)[^"]*"/gi, `fill="${iconColor}"`)
        .replace(/stroke="(?!none)[^"]*"/gi, `stroke="${iconColor}"`);
      return (
        <span
          style={{ width: innerSize, height: innerSize, display: "inline-block" }}
          dangerouslySetInnerHTML={{ __html: processed }}
        />
      );
    }
    if (pngUrl) {
      return (
        <img
          src={pngUrl}
          alt={label || ""}
          style={{ width: innerSize, height: innerSize, objectFit: "contain" }}
          className={isDark ? "brightness-0 invert sepia saturate-[10000%] hue-rotate-[15deg]" : "brightness-0"}
        />
      );
    }
    return (
      <BookOpen
        style={{ width: innerSize, height: innerSize, color: iconColor }}
        strokeWidth={1.5}
      />
    );
  };

  return (
    <div className={plateClasses} style={{ width: sizePx, height: sizePx }}>
      {renderIcon()}
    </div>
  );
}
