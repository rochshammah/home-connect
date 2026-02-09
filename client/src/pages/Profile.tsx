import { useAuth } from "@/hooks/use-auth";
import { useUpdateProfile } from "@/hooks/use-profile";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Profile() {
  const { user } = useAuth();
  const { mutate, isPending } = useUpdateProfile();
  
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      role: user?.role || "tenant",
      bio: user?.bio || "",
      phoneNumber: user?.phoneNumber || "",
    }
  });

  const onSubmit = (data: any) => {
    mutate(data);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in-up">
      <div>
        <h1 className="font-display text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account information and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.profileImageUrl} />
              <AvatarFallback className="text-2xl">{user?.firstName?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{user?.firstName} {user?.lastName}</CardTitle>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label>Account Role</Label>
              <Select 
                defaultValue={watch("role")} 
                onValueChange={(val: any) => setValue("role", val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tenant">Tenant</SelectItem>
                  <SelectItem value="landlord">Landlord</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">This determines your dashboard features.</p>
            </div>

            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input {...register("phoneNumber")} placeholder="+1 (555) 000-0000" />
            </div>

            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea 
                {...register("bio")} 
                placeholder="Tell us a bit about yourself..." 
                className="min-h-[120px]"
              />
            </div>

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
