import { useState } from "react";
import { useCreateListing } from "@/hooks/use-listings";
import { InsertListing, insertListingSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Schema refinement for client-side form (handling strings for numbers)
const formSchema = insertListingSchema.extend({
  price: z.coerce.number().min(1, "Price must be positive"),
  featuresString: z.string().optional(), // Temporary field for comma-separated input
  imageUrl: z.string().url().optional().or(z.literal("")), // Temp for adding images
});

type FormValues = z.infer<typeof formSchema>;

export function CreateListingDialog() {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useCreateListing();
  const [images, setImages] = useState<string[]>([]);
  const [currentImage, setCurrentImage] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const [currentFeature, setCurrentFeature] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      address: "",
      location: "",
      price: 0,
      images: [],
      features: [],
      status: "available",
      coordinates: { lat: 0, lng: 0 }, // Placeholder
    },
  });

  const addImage = () => {
    if (currentImage && !images.includes(currentImage)) {
      setImages([...images, currentImage]);
      setCurrentImage("");
      form.setValue("images", [...images, currentImage]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    form.setValue("images", newImages);
  };

  const addFeature = () => {
    if (currentFeature && !features.includes(currentFeature)) {
      setFeatures([...features, currentFeature]);
      setCurrentFeature("");
      form.setValue("features", [...features, currentFeature]);
    }
  };

  const removeFeature = (index: number) => {
    const newFeatures = features.filter((_, i) => i !== index);
    setFeatures(newFeatures);
    form.setValue("features", newFeatures);
  };

  const onSubmit = (data: FormValues) => {
    // Ensure images and features are synced
    const finalData = {
      ...data,
      price: data.price.toString(), // Convert back to string for decimal type if needed by schema, but schema says number usually handled by drizzle-zod as number or string depending
      images: images,
      features: features,
    };
    
    // @ts-ignore - drizzle-zod decimal types can be tricky
    mutate(finalData, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
        setImages([]);
        setFeatures([]);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4 mr-2" />
          Create Listing
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Create New Listing</DialogTitle>
          <DialogDescription>
            Fill in the details for your property. Be descriptive to attract tenants.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Modern Apartment in Downtown" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City / Area</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. New York, NY" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (Monthly)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="2500" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Full Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St, Apt 4B" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe your property..." className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Features Input */}
              <div className="col-span-2 space-y-3">
                <FormLabel>Features</FormLabel>
                <div className="flex gap-2">
                  <Input 
                    value={currentFeature}
                    onChange={(e) => setCurrentFeature(e.target.value)}
                    placeholder="e.g. Wifi, Parking, Gym"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFeature(); } }}
                  />
                  <Button type="button" onClick={addFeature} variant="secondary">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-2 bg-muted/30 rounded-md border border-dashed">
                  {features.length === 0 && <span className="text-sm text-muted-foreground self-center">No features added</span>}
                  {features.map((feature, idx) => (
                    <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                      {feature}
                      <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => removeFeature(idx)} />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Image URL Input */}
              <div className="col-span-2 space-y-3">
                <FormLabel>Images (URLs)</FormLabel>
                <div className="flex gap-2">
                  <Input 
                    value={currentImage}
                    onChange={(e) => setCurrentImage(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addImage(); } }}
                  />
                  <Button type="button" onClick={addImage} variant="secondary">Add</Button>
                </div>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {images.map((url, idx) => (
                    <div key={idx} className="relative aspect-video rounded-md overflow-hidden group border">
                      <img src={url} alt="preview" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {images.length === 0 && <div className="col-span-4 text-center py-4 text-sm text-muted-foreground border border-dashed rounded-md">No images added</div>}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Listing
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
