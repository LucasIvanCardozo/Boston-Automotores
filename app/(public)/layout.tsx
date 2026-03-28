import Header from '@/components/layout/Header/Header';
import Footer from '@/components/layout/Footer/Footer';
import HeaderHeightObserver from '@/components/layout/HeaderHeightObserver/HeaderHeightObserver';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <HeaderHeightObserver />
      <main>{children}</main>
      <Footer />
    </>
  );
}
