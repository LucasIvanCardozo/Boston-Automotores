import Header from '@/components/layout/Header/Header';
import Footer from '@/components/layout/Footer/Footer';
import Toaster from '@/components/ui/Toaster/Toaster';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <Toaster position="bottom-right" />
    </>
  );
}
