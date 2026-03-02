import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-semibold mb-4">
        Wholesale Catalog
      </h1>
      <p className="text-muted-foreground text-center mb-6 max-w-md">
        Manage your purse catalog and share personalized links with shopkeepers.
      </p>
      <Link
        href="/admin"
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90"
      >
        Go to Admin
      </Link>
    </div>
  );
}
