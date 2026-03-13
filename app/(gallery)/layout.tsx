'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import DocentChat from '@/components/docent/DocentChat';
import { useGalleryStore } from '@/stores/gallery';

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const docentOpen = useGalleryStore((s) => s.docentOpen);
  const docentArtworkContext = useGalleryStore((s) => s.docentArtworkContext);
  const setDocentOpen = useGalleryStore((s) => s.setDocentOpen);

  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen pt-16">
        {children}
      </main>
      <Footer />
      <DocentChat
        artworkContext={docentArtworkContext}
        isOpen={docentOpen}
        onClose={() => setDocentOpen(false)}
      />
    </>
  );
}
