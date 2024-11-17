import MainLayout from '@/components/Layout/MainLayout';

type Props = {
  children: React.ReactNode;
};

export default function DashboardRootLayout({ children }: Props) {
  return <MainLayout>{children}</MainLayout>;
}