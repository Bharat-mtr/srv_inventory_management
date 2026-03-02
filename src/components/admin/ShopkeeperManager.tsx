"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import type { Shopkeeper } from "@/lib/supabase";
import { generateUniqueCode } from "@/lib/utils";

export function ShopkeeperManager() {
  const [shopkeepers, setShopkeepers] = useState<Shopkeeper[]>([]);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchShopkeepers = async () => {
    const { data, error } = await supabase
      .from("shopkeepers")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setShopkeepers(data ?? []);
  };

  useEffect(() => {
    fetchShopkeepers();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    const code = generateUniqueCode(8);
    const { error } = await supabase.from("shopkeepers").insert({
      name: name.trim(),
      address: address.trim() || null,
      unique_code: code,
    });
    if (!error) {
      setName("");
      setAddress("");
      fetchShopkeepers();
    }
    setLoading(false);
  };

  const deleteShopkeeper = async (id: string) => {
    if (!confirm("Delete this shopkeeper? Their catalog link will stop working."))
      return;
    await supabase.from("shopkeepers").delete().eq("id", id);
    fetchShopkeepers();
  };

  const getCatalogUrl = (code: string) => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/c/${code}`;
  };

  const copyUrl = (code: string) => {
    navigator.clipboard.writeText(getCatalogUrl(code));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shopkeepers</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleAdd} className="flex flex-wrap gap-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="sk-name">Name</Label>
            <Input
              id="sk-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Shopkeeper name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sk-address">Address</Label>
            <Input
              id="sk-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Address (optional)"
            />
          </div>
          <Button type="submit" disabled={loading}>
            Add Shopkeeper
          </Button>
        </form>
        <div className="space-y-2">
          {shopkeepers.map((s) => (
            <div
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-2 p-3 border rounded-lg"
            >
              <div>
                <p className="font-medium">{s.name}</p>
                {s.address && (
                  <p className="text-sm text-muted-foreground">{s.address}</p>
                )}
                <p className="text-xs text-muted-foreground font-mono">
                  /c/{s.unique_code}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyUrl(s.unique_code)}
                >
                  Copy Link
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteShopkeeper(s.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
        {shopkeepers.length === 0 && (
          <p className="text-muted-foreground py-4 text-center">
            No shopkeepers yet. Add one above.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
