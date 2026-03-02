"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { Checkbox } from "@/components/ui/checkbox";

const STORAGE_BUCKET = "product-photos";

export function ProductUploadForm() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [photos, setPhotos] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setPhotos((prev) => [...prev, ...files]);
  }, []);

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const movePhoto = (index: number, direction: "up" | "down") => {
    setPhotos((prev) => {
      const next = [...prev];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const uploadPhotos = async (productId: string): Promise<string[]> => {
    const urls: string[] = [];
    for (let i = 0; i < photos.length; i++) {
      const file = photos[i];
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${productId}/${Date.now()}-${i}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(path);
      urls.push(urlData.publicUrl);
    }
    return urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (photos.length === 0) {
      setError("Please add at least one photo");
      return;
    }
    setLoading(true);
    try {
      const { data: product, error: productError } = await supabase
        .from("products")
        .insert({
          name,
          price: parseFloat(price) || 0,
          description: description || null,
          is_available: isAvailable,
        })
        .select("id")
        .single();

      if (productError) throw productError;
      if (!product) throw new Error("Failed to create product");

      const photoUrls = await uploadPhotos(product.id);

      const photoRows = photoUrls.map((url, i) => ({
        product_id: product.id,
        photo_url: url,
        display_order: i,
      }));

      const { error: photosError } = await supabase
        .from("product_photos")
        .insert(photoRows);

      if (photosError) throw photosError;

      setName("");
      setPrice("");
      setDescription("");
      setPhotos([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Product</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Product name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price (₹)</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description"
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="available"
              checked={isAvailable}
              onCheckedChange={(c) => setIsAvailable(c === true)}
            />
            <Label htmlFor="available">Available</Label>
          </div>
          <div className="space-y-2">
            <Label>Photos (multiple, reorderable)</Label>
            <div className="flex flex-wrap gap-2">
              {photos.map((file, i) => (
                <div
                  key={i}
                  className="relative group border rounded overflow-hidden w-20 h-20"
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition-opacity">
                    <button
                      type="button"
                      onClick={() => movePhoto(i, "up")}
                      disabled={i === 0}
                      className="text-white text-xs p-1 bg-white/20 rounded"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => movePhoto(i, "down")}
                      disabled={i === photos.length - 1}
                      className="text-white text-xs p-1 bg-white/20 rounded"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="text-white text-xs p-1 bg-destructive rounded"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
              <label className="w-20 h-20 border-2 border-dashed rounded flex items-center justify-center cursor-pointer hover:bg-muted/50">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
                <span className="text-2xl text-muted-foreground">+</span>
              </label>
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? "Uploading..." : "Add Product"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
