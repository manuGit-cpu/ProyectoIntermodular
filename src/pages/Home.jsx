import Hero from "../components/Hero";
import Info from "../components/Info";
import Gallery from "../components/Gallery";
import Reserva from "../components/Reserva";
import Navbar from "../components/NavBar";
import Footer from "../layouts/Footer";

function Home() {
  return (
    <div className="min-h-screen bg-surface text-copy">
      <Navbar />
      <Hero />
      <Info />
      <div className="grid w-full grid-cols-1 items-stretch lg:gap-8 lg:px-[clamp(24px,4vw,56px)]">
        <Gallery />
        <Reserva />
      </div>
      <Footer />
    </div>
  );
}

export default Home;
