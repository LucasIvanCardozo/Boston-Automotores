import Header from '@/components/layout/Header/Header';
import Footer from '@/components/layout/Footer/Footer';
import Toaster from '@/components/ui/Toaster/Toaster';
import Link from 'next/link';
import Image from 'next/image';
import styles from './layout.module.css';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const phoneNumber = '+5492236329761';
const whatsappMessage = encodeURIComponent(`Hola! Quiero realizar una consulta!`);
  return (
    <>
      <Header />
      <Link  href={`https://wa.me/${phoneNumber}?text=${whatsappMessage}`} target='_blank' className={styles.logowsp}>
        <label  className={styles.logowspText}>Whatsapp</label>
        <Image src="/assets/whatsapp.webp" alt="Whatsapp - Boston Automotores" width={50} height={50}/>
      </Link>
      <main>{children}</main>
      <Footer />
      <Toaster position="bottom-right" />
    </>
  );
}
