import Hero from "../components/Hero";
import Info from "../components/Info";
import Gallery from "../components/Gallery";
import Reserva from "../components/Reserva";
import Navbar from "../components/NavBar";
import ScrollReveal from "../components/ScrollReveal";
import Footer from "../layouts/Footer";

function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-surface text-copy">
      <Navbar />
      <Hero />
      <ScrollReveal as="div" x={-56}>
        <Info />
      </ScrollReveal>
      <div className="grid w-full grid-cols-1 items-stretch lg:gap-8 lg:px-[clamp(24px,4vw,56px)]">
        <ScrollReveal as="div" x={56}>
          <Gallery />
        </ScrollReveal>
        <ScrollReveal as="div" x={-56}>
          <Reserva />
        </ScrollReveal>
      </div>
      <Footer />
    </div>
  );
}

export default Home;
