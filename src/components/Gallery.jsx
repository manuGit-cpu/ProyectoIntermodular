import "../css/App.css";

function Gallery() {
  return (
    <section className="gallery" id="gallery">
      <h2>Galería</h2>

      <div className="images">
        <img src="/img1.jpg" alt="casa rural" />
        <img src="/img2.jpg" alt="interior casa" />
        <img src="/img3.jpg" alt="piscina" />
      </div>
    </section>
  );
}

export default Gallery;