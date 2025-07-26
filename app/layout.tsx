import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "Inventory Management System - FIFO Costing",
  description: "Modern inventory management system with FIFO costing and real-time Kafka integration",
  keywords: ["inventory", "management", "FIFO", "costing", "kafka", "real-time"],
  authors: [{ name: "Inventory Management Team" }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
