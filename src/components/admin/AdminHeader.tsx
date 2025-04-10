import { Link } from "react-router-dom";
import { Calculator, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/layout/theme-toggle";
import { useNavigate } from "react-router-dom";
import { fine } from "@/lib/fine";

export function AdminHeader() {
  const navigate = useNavigate();
  const { data: session } = fine.auth.useSession();
  
  const handleLogout = async () => {
    await fine.auth.signOut();
    navigate("/");
  };

  return (
    <header className="border-b bg-background">
      <div className="flex h-16 items-center px-4 md:px-6">
        <Link to="/admin" className="flex items-center gap-2 font-semibold">
          <Calculator className="h-6 w-6" />
          <span className="text-xl">Clinical Calculator <span className="text-primary">Admin</span></span>
        </Link>
        <nav className="ml-auto flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="sm">
              View Public Site
            </Button>
          </Link>
          <ModeToggle />
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </nav>
      </div>
    </header>
  );
}