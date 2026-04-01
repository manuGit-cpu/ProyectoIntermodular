import Hero from "../components/hero";
import Info from "../components/Info";
import Gallery from "../components/gallery";
import Reserva from "../components/Reserva";
import Navbar from "../components/NavBar";
import Footer from "../layouts/Footer";

function Home() {
  return (
    <>
          <Navbar />

        <Hero />
        <Info />
        <div className="gallery-contact-section">
          <Gallery />
          <Reserva />
        </div>
        <Footer />
    </>
  );
}

export default Home;