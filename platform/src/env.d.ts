/// <reference path="../.astro/types.d.ts" />

// Minimal ambient types for the Cloudflare KV binding used by the API routes,
// so we don't need the full @cloudflare/workers-types package.
interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
  list(opts?: { prefix?: string }): Promise<{ keys: { name: string }[] }>;
}

declare namespace App {
  interface Locals {
    runtime?: {
      env?: {
        BLOG_KV?: KVNamespace;
      };
    };
  }
}
