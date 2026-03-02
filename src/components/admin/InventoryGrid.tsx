"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import type { Product, ProductPhoto } from "@/lib/supabase";
import { formatPrice } from "@/lib/utils";

type ProductWithPhotos = Product & { product_photos: ProductPhoto[] };

type InventoryGridProps = {
  refreshKey?: number;
};

export function InventoryGrid({ refreshKey }: InventoryGridProps) {
  const [products, setProducts] = useState<ProductWithPhotos[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    const { data: productsData, error: productsError } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (productsError) {
      console.error(productsError);
      return;
    }

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

    setProducts(
      (productsData ?? []).map((p) => ({
        ...p,
        product_photos: (photosByProduct[p.id] ?? []).sort(
          (a, b) => a.display_order - b.display_order
        ),
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [refreshKey]);

  const toggleAvailability = async (id: string, current: boolean) => {
    await supabase
      .from("products")
      .update({ is_available: !current })
      .eq("id", id);
    fetchProducts();
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await supabase.from("products").delete().eq("id", id);
    fetchProducts();
  };

  if (loading) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Master Inventory</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <div
              key={p.id}
              className="border rounded-lg overflow-hidden bg-card"
            >
              <div className="aspect-square bg-muted relative">
                {p.product_photos[0] ? (
                  <img
                    src={p.product_photos[0].photo_url}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    No photo
                  </div>
                )}
              </div>
              <div className="p-3 space-y-2">
                <p className="font-medium truncate">{p.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatPrice(p.price)}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant={p.is_available ? "outline" : "default"}
                    size="sm"
                    onClick={() => toggleAvailability(p.id, p.is_available)}
                  >
                    {p.is_available ? "Available" : "Unavailable"}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteProduct(p.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {products.length === 0 && (
          <p className="text-muted-foreground py-8 text-center">
            No products yet. Upload your first product above.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
