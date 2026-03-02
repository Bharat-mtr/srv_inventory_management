"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Product, ProductPhoto, Shopkeeper } from "@/lib/supabase";
import { ProductCard } from "@/components/shopkeeper/ProductCard";
import { AdminModePanel } from "@/components/shopkeeper/AdminModePanel";
import { AdminLoginModal } from "@/components/admin/AdminLoginModal";
import { isAdminAuthenticated } from "@/lib/auth";
import { Button } from "@/components/ui/button";

type ProductWithPhotos = Product & { product_photos: ProductPhoto[] };

export default function ShopkeeperPage() {
  const params = useParams();
  const code = params.code as string;
  const [shopkeeper, setShopkeeper] = useState<Shopkeeper | null>(null);
  const [visibleProducts, setVisibleProducts] = useState<ProductWithPhotos[]>(
    []
  );
  const [adminMode, setAdminMode] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const { data: sk, error: skError } = await supabase
        .from("shopkeepers")
        .select("*")
        .eq("unique_code", code)
        .single();

      if (skError || !sk) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setShopkeeper(sk);

      const { data: visData } = await supabase
        .from("product_visibility")
        .select("product_id")
        .eq("shopkeeper_id", sk.id);

      const visibleIds = (visData ?? []).map((v) => v.product_id);
      if (visibleIds.length === 0) {
        setVisibleProducts([]);
        setLoading(false);
        return;
      }

      const { data: productsData } = await supabase
        .from("products")
        .select("*")
        .in("id", visibleIds)
        .order("name");

      const { data: photosData } = await supabase
        .from("product_photos")
        .select("*")
        .order("display_order");

      const photosByProduct = (photosData ?? []).reduce(
        (acc: Record<string, ProductPhoto[]>, p) => {
          if (!acc[p.product_id]) acc[p.product_id] = [];
          acc[p.product_id].push(p);
          return acc;
        },
        {}
      );

      setVisibleProducts(
        (productsData ?? []).map((p) => ({
          ...p,
          product_photos: (photosByProduct[p.id] ?? []).sort(
            (a, b) => a.display_order - b.display_order
          ),
        }))
      );
      setLoading(false);
    }
    fetchData();
  }, [code]);

  const handleAdminClick = () => {
    if (isAdminAuthenticated()) {
      setAdminMode(true);
    } else {
      setShowLoginModal(true);
    }
  };

  const handleLoginSuccess = () => {
    setAdminMode(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (notFound || !shopkeeper) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Catalog not found</p>
      </div>
    );
  }

  if (adminMode) {
    return (
      <div className="min-h-screen bg-muted/30">
        <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
          <div className="container mx-auto flex h-14 items-center justify-between px-4">
            <h1 className="text-lg font-semibold">
              Admin — {shopkeeper.name}
            </h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAdminMode(false)}
            >
              View as Shopkeeper
            </Button>
          </div>
        </header>
        <main className="container mx-auto px-4 py-6">
          <AdminModePanel
            shopkeeper={shopkeeper}
            onBack={() => setAdminMode(false)}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-xl font-semibold">{shopkeeper.name}</h1>
          {shopkeeper.address && (
            <p className="text-sm text-muted-foreground mt-1">
              {shopkeeper.address}
            </p>
          )}
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {visibleProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        {visibleProducts.length === 0 && (
          <p className="text-muted-foreground py-12 text-center">
            No products visible yet. Check back later.
          </p>
        )}
      </main>
      <button
        onClick={handleAdminClick}
        className="fixed bottom-4 right-4 text-xs text-muted-foreground bg-muted hover:bg-muted/80 px-3 py-2 rounded shadow"
      >
        Admin
      </button>
      <AdminLoginModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
}
