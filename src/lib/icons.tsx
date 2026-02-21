import {
  Shield, Wrench, HardHat, Flame, Zap, BookOpen, Award, Users,
  Truck, Heart, Anchor, Construction, Factory, Gauge, type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  shield: Shield,
  wrench: Wrench,
  hardhat: HardHat,
  flame: Flame,
  zap: Zap,
  book: BookOpen,
  award: Award,
  users: Users,
  truck: Truck,
  heart: Heart,
  anchor: Anchor,
  construction: Construction,
  factory: Factory,
  gauge: Gauge,
};

export function getIcon(key: string | null): LucideIcon {
  if (!key) return BookOpen;
  return iconMap[key] ?? BookOpen;
}

export const availableIcons = Object.keys(iconMap);
