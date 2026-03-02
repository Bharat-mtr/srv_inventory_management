import Link from "next/link";
import { BrandHeader } from "@/components/ui/brand-header";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="max-w-md w-full flex flex-col items-center text-center space-y-6">
        <BrandHeader 
          className="flex-col !gap-6 text-center" 
          title="Shri Radha Vallabh Enterprises"
        />
        <p className="text-muted-foreground">
          Manage your purse catalog and share personalized links with shopkeepers.
        </p>
        <Link
          href="/admin"
          className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-md hover:opacity-90 transition-opacity"
        >
          Go to Admin Portal
        </Link>
      </div>
    </div>
  );
}
