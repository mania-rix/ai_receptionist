// app/auth/blvckwall/layout.tsx
import { StorageProvider } from '@/contexts/storage-context';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <StorageProvider>
      {children}
    </StorageProvider>
  );
}
