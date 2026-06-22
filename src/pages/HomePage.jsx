import React, { useState } from 'react'
import TopBar from '../components/TopBar';
import Header from '../components/Header';
import MobileMenu from '../components/MobileMenu';
import Hero from '../components/Hero';
import Welcome from '../components/Welcome';
import Services from '../components/Services';
import Congregations from '../components/Congregations';
import Calendario from '../components/secciones/Calendario';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

export const HomePage = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="font-sans text-slate-600 antialiased bg-slate-50">
      <TopBar />
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main>
        <Hero />
        <Welcome />
        <Services />
        <Congregations />
        <Calendario />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
