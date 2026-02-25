import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./use-auth";

const getApiUrl = () => import.meta.env.VITE_API_URL || '';

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: { role?: "landlord" | "tenant"; bio?: string; phoneNumber?: string }) => {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}${api.auth.updateProfile.path}`, {
        method: api.auth.updateProfile.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }
      
      return api.auth.updateProfile.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/user"], data);
      toast({
        title: "Profile Updated",
        description: "Your profile changes have been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
