import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { InsertListing, ListingWithLandlord } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

const getApiUrl = () => import.meta.env.VITE_API_URL || '';

export function useListings(filters?: { search?: string; location?: string; minPrice?: string; maxPrice?: string }) {
  // Construct query key including filters so refetch happens on change
  const queryKey = [api.listings.list.path, filters];
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      // Build URL with query params
      const apiUrl = getApiUrl();
      const url = `${apiUrl}${api.listings.list.path}`;
      const searchParams = new URLSearchParams();
      if (filters?.search) searchParams.append("search", filters.search);
      if (filters?.location) searchParams.append("location", filters.location);
      if (filters?.minPrice) searchParams.append("minPrice", filters.minPrice);
      if (filters?.maxPrice) searchParams.append("maxPrice", filters.maxPrice);

      const res = await fetch(`${url}?${searchParams.toString()}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch listings");
      
      return api.listings.list.responses[200].parse(await res.json());
    },
  });
}

export function useListing(id: number) {
  return useQuery({
    queryKey: [api.listings.get.path, id],
    queryFn: async () => {
      const apiUrl = getApiUrl();
      const url = `${apiUrl}${api.listings.get.path}`.replace(':id', id.toString());
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch listing");
      return api.listings.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertListing) => {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}${api.listings.create.path}`, {
        method: api.listings.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create listing");
      }
      
      return api.listings.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.listings.list.path] });
      toast({
        title: "Success",
        description: "Listing created successfully",
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

export function useUpdateListing() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<InsertListing>) => {
      const apiUrl = getApiUrl();
      const url = `${apiUrl}${api.listings.update.path}`.replace(':id', id.toString());
      const res = await fetch(url, {
        method: api.listings.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update listing");
      }

      return api.listings.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.listings.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.listings.get.path, variables.id] });
      toast({
        title: "Success",
        description: "Listing updated successfully",
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

export function useDeleteListing() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const apiUrl = getApiUrl();
      const url = `${apiUrl}${api.listings.delete.path}`.replace(':id', id.toString());
      const res = await fetch(url, {
        method: api.listings.delete.method,
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to delete listing");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.listings.list.path] });
      toast({
        title: "Success",
        description: "Listing deleted successfully",
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
