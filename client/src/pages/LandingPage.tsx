import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Search, FileText, Home, Lock } from "lucide-react";
import { LoginDialog } from "@/components/LoginDialog";

export default function LandingPage() {
  const [loginOpen, setLoginOpen] = useState(false);

  const handleLoginSuccess = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-background font-body">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Home className="w-6 h-6 text-primary" />
              <span className="font-display font-bold text-xl tracking-tight">RentConnect</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => setLoginOpen(true)}>Log In</Button>
              <Button onClick={() => setLoginOpen(true)}>Get Started</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-in-up">
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-foreground">
              Find your place <br/>
              <span className="text-primary">to call home.</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
              Connect directly with landlords, apply securely, and manage your rental journey all in one place. No hidden fees.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="text-lg h-14 px-8 shadow-lg shadow-primary/25" onClick={() => setLoginOpen(true)}>
                Start Browsing
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg h-14 px-8" onClick={() => setLoginOpen(true)}>
                List a Property
              </Button>
            </div>
            
            <div className="flex gap-6 text-sm font-medium text-muted-foreground pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Verified Landlords
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Secure Applications
              </div>
            </div>
          </div>
          
          <div className="relative lg:h-[600px] w-full rounded-2xl overflow-hidden shadow-2xl animate-in-up" style={{ animationDelay: '0.2s' }}>
            {/* Unsplash image of a modern living room */}
            <img 
              src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1600&auto=format&fit=crop" 
              alt="Modern apartment interior" 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="bg-muted/30 py-24 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Everything you need</h2>
            <p className="text-muted-foreground text-lg">Whether you're renting out your property or looking for your next home.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-2xl border border-border/50 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Smart Search</h3>
              <p className="text-muted-foreground leading-relaxed">
                Filter by location, price, and amenities to find exactly what fits your lifestyle and budget.
              </p>
            </div>
            
            <div className="bg-card p-8 rounded-2xl border border-border/50 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Easy Applications</h3>
              <p className="text-muted-foreground leading-relaxed">
                Apply to multiple properties with a single profile. Track your application status in real-time.
              </p>
            </div>
            
            <div className="bg-card p-8 rounded-2xl border border-border/50 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Direct Connection</h3>
              <p className="text-muted-foreground leading-relaxed">
                Chat directly with landlords. Schedule viewings and negotiate terms without the middleman.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-background py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 RentConnect. All rights reserved.</p>
        </div>
      </footer>

      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} onLoginSuccess={handleLoginSuccess} />
    </div>
  );
}

function FileText(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  );
}
