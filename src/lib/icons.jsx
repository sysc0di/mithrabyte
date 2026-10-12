import {
  ArrowRight,
  Building2,
  Calendar,
  Check,
  Circle,
  Clock,
  Code2,
  Cpu,
  Flame,
  Globe,
  Lightbulb,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Star,
  Table,
  Users,
} from "lucide-react";

export const ICONS = {
  "arrow-right": ArrowRight,
  browser: Globe,
  bulb: Lightbulb,
  calendar: Calendar,
  check: Check,
  chip: Cpu,
  circle: Circle,
  clock: Clock,
  code: Code2,
  flame: Flame,
  globe: Globe,
  mail: Mail,
  "map-pin": MapPin,
  phone: Phone,
  sparkles: Sparkles,
  star: Star,
  table: Table,
  users: Users,
  web: Globe,
  building: Building2,
};

export function resolveIcon(name, fallback = Sparkles) {
  return ICONS[name] ?? fallback;
}

/** Product category slug -> icon (shared by product cards and detail pages). */
export const CATEGORY_ICONS = {
  "ai-systems": Cpu,
  commerce: Globe,
  "custom-software": Code2,
};
