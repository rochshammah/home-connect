import { Link } from "wouter";
import { ListingWithLandlord } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, BedDouble, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ListingCardProps {
  listing: ListingWithLandlord;
}

export function ListingCard({ listing }: ListingCardProps) {
  const imageUrl = listing.images && listing.images.length > 0 
    ? listing.images[0] 
    : "https://placehold.co/600x400?text=No+Image";

  return (
    <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-border/50 bg-card h-full flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={imageUrl} 
          alt={listing.title}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3">
          <Badge variant={listing.status === "available" ? "default" : "secondary"} className="uppercase tracking-wider font-semibold">
            {listing.status}
          </Badge>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-12">
           <h3 className="text-white font-display text-xl font-bold truncate">{listing.title}</h3>
        </div>
      </div>
      
      <CardContent className="p-5 flex-grow">
        <div className="flex items-center text-muted-foreground mb-3 text-sm">
          <MapPin className="w-4 h-4 mr-1.5 text-primary" />
          <span className="truncate">{listing.location}</span>
        </div>
        
        <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed mb-4">
          {listing.description}
        </p>

        <div className="flex flex-wrap gap-2">
          {listing.features?.slice(0, 3).map((feature, i) => (
            <Badge key={i} variant="outline" className="text-xs bg-muted/50 font-normal">
              {feature}
            </Badge>
          ))}
          {(listing.features?.length || 0) > 3 && (
            <Badge variant="outline" className="text-xs bg-muted/50 font-normal">
              +{(listing.features?.length || 0) - 3} more
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0 flex items-center justify-between mt-auto border-t border-border/40 bg-muted/10">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Price</span>
          <span className="text-xl font-display font-bold text-primary">${Number(listing.price).toLocaleString()}<span className="text-sm font-sans font-normal text-muted-foreground">/mo</span></span>
        </div>
        
        <Link href={`/listings/${listing.id}`}>
          <Button size="sm" className="group/btn">
            View Details
            <Info className="w-4 h-4 ml-2 group-hover/btn:translate-x-0.5 transition-transform" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
