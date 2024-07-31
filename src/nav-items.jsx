import { Gamepad2 } from "lucide-react";
import Game from "./pages/Index.jsx";

/**
 * Central place for defining the navigation items. Used for navigation components and routing.
 */
export const navItems = [
  {
    title: "FPS Game",
    to: "/",
    icon: <Gamepad2 className="h-4 w-4" />,
    page: <Game />,
  },
];
