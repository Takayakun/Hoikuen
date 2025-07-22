import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}