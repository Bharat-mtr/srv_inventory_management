"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/lib/supabase";
import type { Product, ProductPhoto, Shopkeeper } from "@/lib/supabase";
import { formatPrice } from "@/lib/utils";

type ProductWithPhotos = Product & { product_photos: ProductPhoto[] };

export function BulkVisibilityPanel() {
  const [products, setProducts] = useState<ProductWithPhotos[]>([]);
  const [shopkeepers, setShopkeepers] = useState<Shopkeeper[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set()
  );
  const [selectedShopkeepers, setSelectedShopkeepers] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    const { data: productsData } = await supabase
      .from("products")
      .select("*")
      .order("name");
    const { data: photosData } = await supabase
      .from("product_photos")
      .select("*")
      .order("display_order");
    const { data: shopkeepersData } = await supabase
      .from("shopkeepers")
      .select("*")
      .order("name");

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
    setShopkeepers(shopkeepersData ?? []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleProduct = (id: string) => {
    setSelectedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleShopkeeper = (id: string) => {
    setSelectedShopkeepers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllProducts = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map((p) => p.id)));
    }
  };

  const selectAllShopkeepers = () => {
    if (selectedShopkeepers.size === shopkeepers.length) {
      setSelectedShopkeepers(new Set());
    } else {
      setSelectedShopkeepers(new Set(shopkeepers.map((s) => s.id)));
    }
  };

  const makeVisible = async () => {
    if (selectedProducts.size === 0 || selectedShopkeepers.size === 0) return;
    setLoading(true);
    const rows: { product_id: string; shopkeeper_id: string }[] = [];
    for (const pid of selectedProducts) {
      for (const sid of selectedShopkeepers) {
        rows.push({ product_id: pid, shopkeeper_id: sid });
      }
    }
    await supabase.from("product_visibility").upsert(rows, {
      onConflict: "product_id,shopkeeper_id",
    });
    setLoading(false);
    setSelectedProducts(new Set());
    setSelectedShopkeepers(new Set());
  };

  const makeHidden = async () => {
    if (selectedProducts.size === 0 || selectedShopkeepers.size === 0) return;
    setLoading(true);
    for (const pid of selectedProducts) {
      await supabase
        .from("product_visibility")
        .delete()
        .eq("product_id", pid)
        .in("shopkeeper_id", Array.from(selectedShopkeepers));
    }
    setLoading(false);
    setSelectedProducts(new Set());
    setSelectedShopkeepers(new Set());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Visibility</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Products</span>
              <Button variant="ghost" size="sm" onClick={selectAllProducts}>
                {selectedProducts.size === products.length
                  ? "Deselect all"
                  : "Select all"}
              </Button>
            </div>
            <div className="max-h-48 overflow-y-auto border rounded-lg p-2 space-y-1">
              {products.map((p) => (
                <label
                  key={p.id}
                  className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded p-1"
                >
                  <Checkbox
                    checked={selectedProducts.has(p.id)}
                    onCheckedChange={() => toggleProduct(p.id)}
                  />
                  <span className="truncate flex-1">{p.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatPrice(p.price)}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Shopkeepers</span>
              <Button variant="ghost" size="sm" onClick={selectAllShopkeepers}>
                {selectedShopkeepers.size === shopkeepers.length
                  ? "Deselect all"
                  : "Select all"}
              </Button>
            </div>
            <div className="max-h-48 overflow-y-auto border rounded-lg p-2 space-y-1">
              {shopkeepers.map((s) => (
                <label
                  key={s.id}
                  className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded p-1"
                >
                  <Checkbox
                    checked={selectedShopkeepers.has(s.id)}
                    onCheckedChange={() => toggleShopkeeper(s.id)}
                  />
                  <span className="truncate">{s.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={makeVisible}
            disabled={
              loading ||
              selectedProducts.size === 0 ||
              selectedShopkeepers.size === 0
            }
          >
            Make Visible
          </Button>
          <Button
            variant="destructive"
            onClick={makeHidden}
            disabled={
              loading ||
              selectedProducts.size === 0 ||
              selectedShopkeepers.size === 0
            }
          >
            Make Hidden
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
