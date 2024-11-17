import DashboardLayout from '../../components/Layout/DashboardLayout';

type Props = {
  children: React.ReactNode;
};

export default function DashboardRootLayout({ children }: Props) {
  return <DashboardLayout>{children}</DashboardLayout>;
}