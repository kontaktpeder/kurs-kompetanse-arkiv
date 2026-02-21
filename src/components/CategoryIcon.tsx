import { BookOpen } from "lucide-react";

interface CategoryIconProps {
  iconSvg?: string | null;
  iconPngUrl?: string | null;
  className?: string;
  size?: number;
}

export default function CategoryIcon({ iconSvg, iconPngUrl, className = "h-7 w-7 text-primary", size }: CategoryIconProps) {
  if (iconSvg) {
    return (
      <span
        className={className}
        style={size ? { width: size, height: size, display: "inline-block" } : { display: "inline-block" }}
        dangerouslySetInnerHTML={{ __html: iconSvg }}
      />
    );
  }
  if (iconPngUrl) {
    return (
      <img
        src={iconPngUrl}
        alt=""
        className={className}
        style={size ? { width: size, height: size } : undefined}
      />
    );
  }
  return <BookOpen className={className} strokeWidth={1.5} />;
}
