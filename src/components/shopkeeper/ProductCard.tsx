"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import type { Product, ProductPhoto } from "@/lib/supabase";

type ProductWithPhotos = Product & { product_photos: ProductPhoto[] };

type ProductCardProps = {
  product: ProductWithPhotos;
};

export function ProductCard({ product }: ProductCardProps) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const photos = product.product_photos ?? [];
  const currentPhoto = photos[photoIndex];

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="aspect-square bg-muted relative shrink-0">
        {currentPhoto ? (
          <img
            src={currentPhoto.photo_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No photo
          </div>
        )}
        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={() =>
                setPhotoIndex((i) => (i === 0 ? photos.length - 1 : i - 1))
              }
              className="absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center text-sm"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() =>
                setPhotoIndex((i) => (i === photos.length - 1 ? 0 : i + 1))
              }
              className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center text-sm"
            >
              ›
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {photos.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPhotoIndex(i)}
                  className={`w-2 h-2 rounded-full ${
                    i === photoIndex ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <CardContent className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <p className="font-medium truncate">{product.name}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {formatPrice(product.price)}
          </p>
        </div>
        {!product.is_available && (
          <span className="inline-block mt-1 text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded">
            Out of Stock
          </span>
        )}
      </CardContent>
    </Card>
  );
}
