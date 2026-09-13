import { Activity, Box, Briefcase, Compass, Home, Layers, Monitor, Wind, type LucideProps } from "lucide-react";

/** Renders the Lucide icon stored on a category (`icon` key in the database). */
export function CategoryIcon({ icon, ...props }: LucideProps & { icon: string }) {
  const shared = { "aria-hidden": true, ...props };
  switch (icon) {
    case "activity":
      return <Activity {...shared} />;
    case "wind":
      return <Wind {...shared} />;
    case "home":
      return <Home {...shared} />;
    case "layers":
      return <Layers {...shared} />;
    case "compass":
      return <Compass {...shared} />;
    case "monitor":
      return <Monitor {...shared} />;
    case "briefcase":
      return <Briefcase {...shared} />;
    default:
      return <Box {...shared} />;
  }
}
