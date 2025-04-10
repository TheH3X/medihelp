import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Calculator, 
  Database, 
  Settings, 
  BarChart, 
  Users,
  FileJson,
  BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
  const location = useLocation();
  
  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/admin",
    },
    {
      title: "Calculators",
      icon: Calculator,
      href: "/admin",
    },
    {
      title: "Parameters",
      icon: Database,
      href: "/admin/parameters",
    },
    {
      title: "Analytics",
      icon: BarChart,
      href: "/admin/analytics",
    },
    {
      title: "Import/Export",
      icon: FileJson,
      href: "/admin/import-export",
    },
    {
      title: "Documentation",
      icon: BookOpen,
      href: "/admin/documentation",
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/admin/settings",
    },
  ];

  return (
    <aside className="w-64 border-r bg-muted/30 p-4">
      <nav className="space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.title}
            to={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              location.pathname === item.href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.title}
          </Link>
        ))}
      </nav>
    </aside>
  );
}