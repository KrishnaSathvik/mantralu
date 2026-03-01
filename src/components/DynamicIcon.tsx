import { icons, LucideProps } from "lucide-react";

interface DynamicIconProps extends LucideProps {
  name: string;
}

export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  // Convert kebab-case to PascalCase for lucide lookup
  const pascalName = name
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");

  const LucideIcon = (icons as Record<string, any>)[pascalName];

  if (!LucideIcon) {
    // Fallback: render as text (handles any leftover emojis gracefully)
    return <span {...(props as any)}>{name}</span>;
  }

  return <LucideIcon {...props} />;
}
