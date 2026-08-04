"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      toastOptions={{
        style: {
          background: "#ffffff",
          color: "#222222",
          border: "1px solid #f0ded9",
          borderRadius: "1rem",
          boxShadow: "0 20px 60px -15px rgb(183 110 121 / 0.28)",
        },
      }}
    />
  );
}