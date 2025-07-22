import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function PrintsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}