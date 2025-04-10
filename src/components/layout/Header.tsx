import { Link } from "react-router-dom";
import { Calculator, Home, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./theme-toggle";
import { fine } from "@/lib/fine";

export function Header() {
  const { data: session } = fine.auth.useSession();
  const isAdmin = session?.user?.email === "admin@example.com"; // In a real app, use a proper admin check

  return (
    <header className="border-b bg-background">
      <div className="flex h-16 items-center px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <Calculator className="h-6 w-6" />
          <span className="text-xl">Clinical Calculator</span>
        </Link>
        <nav className="ml-auto flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
          </Link>
          {isAdmin && (
            <Link to="/admin">
              <Button variant="ghost" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                Admin
              </Button>
            </Link>
          )}
          <ModeToggle />
        </nav>
      </div>
    </header>
  );
}