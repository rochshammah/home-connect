import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Home, 
  FileText, 
  User, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navigation() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isLandlord = user?.role === "landlord";

  const navItems = [
    { label: "Browse Listings", href: "/", icon: Home, show: true },
    { label: "My Listings", href: "/my-listings", icon: LayoutDashboard, show: isLandlord },
    { label: "Applications", href: "/applications", icon: FileText, show: true },
    { label: "Profile", href: "/profile", icon: User, show: true },
  ];

  const handleLogout = () => {
    logout();
  };

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <h1 className="text-2xl font-display font-bold text-primary flex items-center gap-2">
          <Home className="w-6 h-6" />
          RentConnect
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isLandlord ? "Landlord Dashboard" : "Find your dream home"}
        </p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.filter(item => item.show).map((item) => (
          <Link key={item.href} href={item.href}>
            <div 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                location === item.href 
                  ? "bg-primary text-primary-foreground font-medium shadow-md shadow-primary/20" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              onClick={() => setIsOpen(false)}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </div>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-border mt-auto">
        <div className="flex items-center gap-3 mb-4 px-2">
          <Avatar>
            <AvatarImage src={user?.profileImageUrl} />
            <AvatarFallback>{user?.firstName?.[0]}{user?.lastName?.[0]}</AvatarFallback>
          </Avatar>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role || "User"}</p>
          </div>
        </div>
        <Button variant="outline" className="w-full justify-start text-muted-foreground" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border h-screen sticky top-0 bg-card">
        <NavContent />
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-background sticky top-0 z-50">
        <span className="font-display font-bold text-xl text-primary flex items-center gap-2">
          <Home className="w-5 h-5" />
          RentConnect
        </span>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
