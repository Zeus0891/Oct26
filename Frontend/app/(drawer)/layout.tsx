'use client';

import { DashboardLayout } from '@/components/layouts/DashboardLayout';

export default function DrawerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
