import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function CalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}