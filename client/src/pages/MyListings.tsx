import { useAuth } from "@/hooks/use-auth";
import { useListings } from "@/hooks/use-listings"; // Assuming list endpoint can be filtered by landlord or we can just filter client side for MVP since we didn't add specific my-listings endpoint
import { ListingCard } from "@/components/ListingCard";
import { CreateListingDialog } from "@/components/CreateListingDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function MyListings() {
  const { user } = useAuth();
  // In a real app we'd have a specific /api/my-listings endpoint or filter by landlordId
  // For now, let's fetch all and filter client side as a simple workaround given constraints
  const { data: allListings, isLoading } = useListings();
  
  const myListings = allListings?.filter(l => l.landlordId === user?.id) || [];

  return (
    <div className="space-y-8 animate-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">My Listings</h1>
          <p className="text-muted-foreground mt-1">Manage your properties and view applications</p>
        </div>
        <CreateListingDialog />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      ) : myListings.length === 0 ? (
        <div className="text-center py-24 bg-muted/20 rounded-3xl border border-dashed border-border">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold">No properties listed yet</h3>
          <p className="text-muted-foreground mt-2 max-w-sm mx-auto">Start your journey as a landlord by creating your first listing today.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myListings.map(listing => (
            <div key={listing.id} className="space-y-3 group">
              <ListingCard listing={listing} />
              <Link href={`/applications?listingId=${listing.id}`}>
                 <Button variant="outline" className="w-full border-primary/20 text-primary hover:bg-primary/5">
                   View Applications
                 </Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
