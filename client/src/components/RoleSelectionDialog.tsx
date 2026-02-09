import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useUpdateProfile } from "@/hooks/use-profile";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Home, Key } from "lucide-react";
import { cn } from "@/lib/utils";

export function RoleSelectionDialog() {
  const { user } = useAuth();
  const { mutate, isPending } = useUpdateProfile();
  const [open, setOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"landlord" | "tenant" | null>(null);

  // Check if user has no role assigned (using 'role' custom claim or field logic - assuming backend doesn't set a default, or we want to confirm)
  // For this implementation, we assume we check a custom field. But since auth user object structure is fixed by replit auth, 
  // we rely on the backend /api/auth/user returning our extended DB user which has 'role'.
  useEffect(() => {
    // If user is loaded and has no role (or we want to force selection first time)
    // Here we check if the role is null/undefined in the DB extension
    if (user && !user.role) {
      setOpen(true);
    }
  }, [user]);

  const handleSubmit = () => {
    if (selectedRole) {
      mutate({ role: selectedRole }, {
        onSuccess: () => setOpen(false)
      });
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[500px]" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-display">Welcome! How will you use this platform?</DialogTitle>
          <DialogDescription className="text-center">
            Choose your primary role to get started. You can change this later in your profile.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 py-6">
          <div 
            onClick={() => setSelectedRole("tenant")}
            className={cn(
              "cursor-pointer rounded-xl border-2 p-6 flex flex-col items-center gap-4 transition-all hover:border-primary/50 hover:bg-muted/50",
              selectedRole === "tenant" ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" : "border-border"
            )}
          >
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <Key className="w-8 h-8" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-lg">Tenant</h3>
              <p className="text-sm text-muted-foreground mt-1">I want to find a home</p>
            </div>
          </div>

          <div 
            onClick={() => setSelectedRole("landlord")}
            className={cn(
              "cursor-pointer rounded-xl border-2 p-6 flex flex-col items-center gap-4 transition-all hover:border-primary/50 hover:bg-muted/50",
              selectedRole === "landlord" ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" : "border-border"
            )}
          >
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <Home className="w-8 h-8" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-lg">Landlord</h3>
              <p className="text-sm text-muted-foreground mt-1">I want to list properties</p>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            className="w-full" 
            size="lg" 
            onClick={handleSubmit} 
            disabled={!selectedRole || isPending}
          >
            {isPending ? "Saving..." : "Continue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
