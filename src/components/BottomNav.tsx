import { Link, useLocation } from "react-router-dom";
import { Home, Search, MessageCircle, Heart, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/search", icon: Search, label: "Search" },
  { to: "/chat", icon: MessageCircle, label: "Chat" },
  { to: "/favorites", icon: Heart, label: "Favorites" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur-md safe-area-x">
      <div className="mx-auto flex max-w-lg items-stretch justify-around pb-[max(0.5rem,var(--safe-area-bottom))]">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-[11px] transition-colors active:scale-95",
                active
                  ? "text-primary font-semibold"
                  : "text-muted-foreground"
              )}
            >
              {active && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-8 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <Icon className={cn("h-5 w-5", active && "fill-primary/20")} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
