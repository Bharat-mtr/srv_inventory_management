"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import type { Product, ProductPhoto, Shopkeeper } from "@/lib/supabase";
import { formatPrice } from "@/lib/utils";

type ProductWithPhotos = Product & { product_photos: ProductPhoto[] };

type AdminModePanelProps = {
  shopkeeper: Shopkeeper;
  onBack: () => void;
};

export function AdminModePanel({ shopkeeper, onBack }: AdminModePanelProps) {
  const [visibleProducts, setVisibleProducts] = useState<ProductWithPhotos[]>(
    []
  );
  const [hiddenProducts, setHiddenProducts] = useState<ProductWithPhotos[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const { data: visData } = await supabase
      .from("product_visibility")
      .select("product_id")
      .eq("shopkeeper_id", shopkeeper.id);

    const visibleIds = new Set((visData ?? []).map((v) => v.product_id));

    const { data: productsData } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

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

    const withPhotos = (productsData ?? []).map((p) => ({
      ...p,
      product_photos: (photosByProduct[p.id] ?? []).sort(
        (a, b) => a.display_order - b.display_order
      ),
    }));

    const visible = withPhotos.filter((p) => visibleIds.has(p.id));
    const hidden = withPhotos.filter((p) => !visibleIds.has(p.id));

    setVisibleProducts(visible);
    setHiddenProducts(hidden);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [shopkeeper.id]);

  const makeVisible = async (productId: string) => {
    await supabase.from("product_visibility").insert({
      product_id: productId,
      shopkeeper_id: shopkeeper.id,
    });
    fetchData();
  };

  const makeHidden = async (productId: string) => {
    await supabase
      .from("product_visibility")
      .delete()
      .eq("product_id", productId)
      .eq("shopkeeper_id", shopkeeper.id);
    fetchData();
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <h2 className="text-lg font-semibold mb-3">
          Visible to {shopkeeper.name}
        </h2>
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {visibleProducts.map((p) => (
            <ProductAdminCard
              key={p.id}
              product={p}
              action="hide"
              onAction={() => makeHidden(p.id)}
            />
          ))}
          {visibleProducts.length === 0 && (
            <p className="text-muted-foreground text-sm">
              No items visible. Add from the hidden list.
            </p>
          )}
        </div>
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-3">
          Hidden from {shopkeeper.name}
        </h2>
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {hiddenProducts
            .sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            )
            .map((p) => {
              const isRecent =
                Date.now() - new Date(p.created_at).getTime() <
                7 * 24 * 60 * 60 * 1000;
              return (
                <ProductAdminCard
                  key={p.id}
                  product={p}
                  action="show"
                  onAction={() => makeVisible(p.id)}
                  isRecent={isRecent}
                />
              );
            })}
          {hiddenProducts.length === 0 && (
            <p className="text-muted-foreground text-sm">
              All products are visible.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductAdminCard({
  product,
  action,
  onAction,
  isRecent = false,
}: {
  product: ProductWithPhotos;
  action: "show" | "hide";
  onAction: () => void;
  isRecent?: boolean;
}) {
  const photo = product.product_photos[0];

  return (
    <Card className={isRecent ? "border-primary/50" : ""}>
      <CardContent className="p-3 flex gap-3 items-center">
        <div className="w-14 h-14 shrink-0 rounded overflow-hidden bg-muted">
          {photo ? (
            <img
              src={photo.photo_url}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
              —
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{product.name}</p>
          <p className="text-sm text-muted-foreground">
            {formatPrice(product.price)}
            {isRecent && (
              <span className="ml-2 text-primary text-xs">New</span>
            )}
          </p>
        </div>
        <Button size="sm" variant={action === "show" ? "default" : "outline"} onClick={onAction}>
          {action === "show" ? "Show" : "Hide"}
        </Button>
      </CardContent>
    </Card>
  );
}
