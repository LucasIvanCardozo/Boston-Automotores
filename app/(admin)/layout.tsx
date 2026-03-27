// Admin route group layout - no Header/Footer, just pass through
// Authentication is handled in app/(admin)/admin/layout.tsx
export default function AdminGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
