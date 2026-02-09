import { useAuth } from "@/hooks/use-auth";
import { useMyApplications, useListingApplications, useUpdateApplicationStatus } from "@/hooks/use-applications";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { useListings } from "@/hooks/use-listings";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export default function Applications() {
  const { user } = useAuth();
  
  if (user?.role === "landlord") {
    return <LandlordApplications />;
  }
  return <TenantApplications />;
}

function TenantApplications() {
  const { data: applications, isLoading } = useMyApplications();

  return (
    <div className="space-y-8 animate-in-up">
      <div>
        <h1 className="font-display text-3xl font-bold">My Applications</h1>
        <p className="text-muted-foreground mt-1">Track the status of your rental applications</p>
      </div>

      {isLoading ? (
         <div className="space-y-4">
           <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
         </div>
      ) : applications?.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">You haven't applied to any properties yet.</div>
      ) : (
        <div className="space-y-4">
          {applications?.map(app => (
            <Card key={app.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center">
                <div className="h-32 md:h-full md:w-48 bg-muted shrink-0">
                  <img 
                    src={app.listing.images[0] || "https://placehold.co/200x200"} 
                    alt={app.listing.title}
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="p-6 flex-grow space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{app.listing.title}</h3>
                      <p className="text-sm text-muted-foreground">{app.listing.address}</p>
                    </div>
                    <Badge variant={
                      app.status === 'accepted' ? 'default' : 
                      app.status === 'rejected' ? 'destructive' : 'secondary'
                    } className="capitalize">
                      {app.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                     <span className="text-sm text-muted-foreground">Applied on {format(new Date(app.createdAt!), 'MMM d, yyyy')}</span>
                     <span className="font-bold text-primary">${app.listing.price}/mo</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function LandlordApplications() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const initialListingId = searchParams.get("listingId");
  
  const { user } = useAuth();
  // Fetch landlord's listings to populate select
  const { data: listings } = useListings(); 
  const myListings = listings?.filter(l => l.landlordId === user?.id) || [];
  
  const [selectedListingId, setSelectedListingId] = useState<string>(initialListingId || "");
  
  const { data: applications, isLoading } = useListingApplications(Number(selectedListingId));
  const { mutate: updateStatus } = useUpdateApplicationStatus();

  return (
    <div className="space-y-8 animate-in-up">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Applications Received</h1>
          <p className="text-muted-foreground mt-1">Review and manage tenant applications</p>
        </div>
        
        <div className="w-full md:w-[300px]">
          <Select value={selectedListingId} onValueChange={setSelectedListingId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a property" />
            </SelectTrigger>
            <SelectContent>
              {myListings.map(l => (
                <SelectItem key={l.id} value={l.id.toString()}>{l.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!selectedListingId ? (
        <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
          Please select a property to view applications.
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin" /></div>
      ) : applications?.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">No applications found for this property.</div>
      ) : (
        <div className="grid gap-6">
          {applications?.map(app => (
            <Card key={app.id}>
              <CardHeader className="flex flex-row items-center gap-4 bg-muted/10 pb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={app.tenant.profileImageUrl || undefined} />
                  <AvatarFallback>{app.tenant.firstName?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{app.tenant.firstName} {app.tenant.lastName}</CardTitle>
                  <p className="text-sm text-muted-foreground">{app.tenant.email}</p>
                </div>
                <div className="ml-auto">
                   <Badge variant={
                      app.status === 'accepted' ? 'default' : 
                      app.status === 'rejected' ? 'destructive' : 'secondary'
                    } className="capitalize">
                      {app.status}
                    </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="bg-muted/30 p-4 rounded-lg text-sm italic">
                  "{app.message || "No message provided."}"
                </div>
                
                {app.status === 'pending' && (
                  <div className="flex gap-3 justify-end pt-2">
                    <Button 
                      variant="outline" 
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => updateStatus({ id: app.id, status: 'rejected' })}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    <Button 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => updateStatus({ id: app.id, status: 'accepted' })}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Accept
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
