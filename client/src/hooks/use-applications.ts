import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { InsertApplication, Application } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

const getApiUrl = () => import.meta.env.VITE_API_URL || '';

export function useCreateApplication() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertApplication) => {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}${api.applications.create.path}`, {
        method: api.applications.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to submit application");
      }

      return api.applications.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.applications.listMyApplications.path] });
      toast({
        title: "Application Sent",
        description: "The landlord has been notified of your interest.",
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

export function useMyApplications() {
  return useQuery({
    queryKey: [api.applications.listMyApplications.path],
    queryFn: async () => {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}${api.applications.listMyApplications.path}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch applications");
      return api.applications.listMyApplications.responses[200].parse(await res.json());
    },
  });
}

export function useListingApplications(listingId: number) {
  return useQuery({
    queryKey: [api.applications.listByListing.path, listingId],
    queryFn: async () => {
      const apiUrl = getApiUrl();
      const url = `${apiUrl}${api.applications.listByListing.path}`.replace(':id', listingId.toString());
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch applications");
      return api.applications.listByListing.responses[200].parse(await res.json());
    },
    enabled: !!listingId,
  });
}

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: "accepted" | "rejected" }) => {
      const apiUrl = getApiUrl();
      const url = `${apiUrl}${api.applications.updateStatus.path}`.replace(':id', id.toString());
      const res = await fetch(url, {
        method: api.applications.updateStatus.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      return api.applications.updateStatus.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      // Invalidate specific listing apps query - we don't know listingId here easily without prop drilling
      // so we invalidate all listing application queries
      queryClient.invalidateQueries({ queryKey: [api.applications.listByListing.path] });
      toast({
        title: "Status Updated",
        description: `Application marked as ${variables.status}`,
      });
    },
  });
}
