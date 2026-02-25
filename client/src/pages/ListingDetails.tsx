import { useRoute, Link } from "wouter";
import { useListing, useDeleteListing, useUpdateListing } from "@/hooks/use-listings";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ApplicationDialog } from "@/components/ApplicationDialog";
import { EditListingDialog } from "@/components/EditListingDialog";
import { 
  MapPin, 
  DollarSign, 
  ArrowLeft, 
  Check, 
  Trash2, 
  Share2,
  Calendar,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export default function ListingDetails() {
  const [, params] = useRoute("/listings/:id");
  const id = parseInt(params?.id || "0");
  const { data: listing, isLoading } = useListing(id);
  const { user } = useAuth();
  const { mutate: deleteListing, isPending: isDeleting } = useDeleteListing();
  const { mutate: updateListing, isPending: isUpdating } = useUpdateListing();

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in-up">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-[400px] w-full rounded-3xl" />
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
          <Skeleton className="h-[200px] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!listing) return <div className="text-center py-20">Listing not found</div>;

  const isOwner = user?.id === listing.landlordId;
  const isLandlord = user?.role === "landlord";

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this listing? This cannot be undone.")) {
      deleteListing(id);
      window.location.href = "/";
    }
  };

  const handleToggleStatus = () => {
    if (listing) {
      const newStatus = listing.status === "available" ? "rented" : "available";
      updateListing({ id: listing.id, status: newStatus });
    }
  };

  const images = listing.images && listing.images.length > 0 
    ? listing.images 
    : ["https://placehold.co/1200x600?text=No+Image"];

  return (
    <div className="space-y-8 animate-in-up pb-12">
      <Link href="/">
        <Button variant="ghost" className="mb-4 pl-0 hover:pl-2 transition-all">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Listings
        </Button>
      </Link>

      {/* Image Gallery */}
      <div className="rounded-3xl overflow-hidden shadow-2xl bg-black">
        <Carousel className="w-full">
          <CarouselContent>
            {images.map((img, index) => (
              <CarouselItem key={index}>
                <div className="relative aspect-video md:aspect-[21/9]">
                  <img src={img} alt={`Slide ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {images.length > 1 && (
            <>
              <CarouselPrevious className="left-4 bg-white/10 hover:bg-white/20 border-0 text-white" />
              <CarouselNext className="right-4 bg-white/10 hover:bg-white/20 border-0 text-white" />
            </>
          )}
        </Carousel>
      </div>

      <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-8">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge variant={listing.status === "available" ? "default" : "secondary"} className="uppercase tracking-wider">
                {listing.status}
              </Badge>
              <div className="flex items-center text-muted-foreground text-sm">
                <MapPin className="w-4 h-4 mr-1 text-primary" />
                {listing.location}
              </div>
              <div className="flex items-center text-muted-foreground text-sm">
                <Calendar className="w-4 h-4 mr-1" />
                Posted {new Date(listing.createdAt!).toLocaleDateString()}
              </div>
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              {listing.title}
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">{listing.address}</p>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-display text-2xl font-bold">About this place</h3>
            <p className="text-muted-foreground leading-loose whitespace-pre-wrap">
              {listing.description}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-display text-2xl font-bold">Features & Amenities</h3>
            <div className="grid grid-cols-2 gap-4">
              {listing.features?.map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-foreground/80">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Check className="w-4 h-4" />
                  </div>
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Card */}
        <div className="space-y-6">
          <Card className="shadow-lg border-border/50 sticky top-4">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-baseline justify-between border-b border-border/50 pb-6">
                <div>
                  <span className="text-3xl font-display font-bold text-primary">${Number(listing.price).toLocaleString()}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>

              {isOwner ? (
                <div className="space-y-3">
                  <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg text-sm border border-yellow-100">
                    You are the owner of this listing.
                  </div>
                  <EditListingDialog listing={listing} />
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleToggleStatus}
                    disabled={isUpdating}
                  >
                    {listing.status === "available" ? (
                      <>
                        <ToggleRight className="w-4 h-4 mr-2" />
                        Mark as Rented
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-4 h-4 mr-2" />
                        Mark as Available
                      </>
                    )}
                  </Button>
                  <Button variant="outline" className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={handleDelete} disabled={isDeleting}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Listing
                  </Button>
                </div>
              ) : (
                <>
                  {!isLandlord ? (
                    <ApplicationDialog listingId={listing.id} listingTitle={listing.title} />
                  ) : (
                    <div className="bg-muted p-3 rounded-lg text-sm text-center">
                      Log in as a tenant to apply.
                    </div>
                  )}
                  <Button variant="outline" className="w-full">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Listing
                  </Button>
                </>
              )}

              <div className="pt-4 border-t border-border/50">
                <h4 className="font-medium mb-3">Landlord</h4>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={listing.landlord?.profileImageUrl || undefined} />
                    <AvatarFallback>{listing.landlord?.firstName?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{listing.landlord?.firstName} {listing.landlord?.lastName}</p>
                    <p className="text-xs text-muted-foreground">Verified Owner</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
