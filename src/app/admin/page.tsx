"use client";

import { useEffect, useState } from "react";
import { isAdminAuthenticated, setAdminAuthenticated } from "@/lib/auth";
import { verifyAdminCredentials } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandHeader } from "@/components/ui/brand-header";
import {
  ProductUploadForm,
  InventoryGrid,
  ShopkeeperManager,
  BulkVisibilityPanel,
} from "@/components/admin";

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [inventoryRefreshKey, setInventoryRefreshKey] = useState(0);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setAuthenticated(isAdminAuthenticated());
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (verifyAdminCredentials(username, password)) {
      setAdminAuthenticated(true);
      setAuthenticated(true);
    } else {
      setError("Invalid username or password");
    }
  };

  const handleLogout = () => {
    setAdminAuthenticated(false);
    setAuthenticated(false);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <div className="w-full max-w-sm space-y-8 bg-card p-8 rounded-xl shadow-sm border">
          <div className="flex justify-center">
            <BrandHeader className="flex-col !gap-4 text-center" />
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <BrandHeader subtitle="Admin Portal" />
          <Button variant="outline" size="sm" onClick={handleLogout} className="border-primary/20 hover:bg-primary/5">
            Logout
          </Button>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 space-y-12">
        <ProductUploadForm onProductAdded={() => setInventoryRefreshKey((k) => k + 1)} />
        <InventoryGrid refreshKey={inventoryRefreshKey} />
        <ShopkeeperManager />
        <BulkVisibilityPanel />
      </main>
    </div>
  );
}
