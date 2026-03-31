import Hero from "../components/hero";
import Info from "../components/info";
import Gallery from "../components/gallery";
import Contact from "../components/Contact";
import Navbar from "../components/NavBar";
import Footer from "../layouts/Footer";

function Home() {
  return (
    <>
          <Navbar />

        <Hero />
        <Info />
        <Gallery />
        <Contact />
        <Footer />
    </>
  );
}

export default Home;