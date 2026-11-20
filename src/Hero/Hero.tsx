export default function Hero() {
  return (
    <section id="inicio" className="hero">
      <div className="HeroContenido hero-copy">
        <p className="eyebrow hero-eyebrow">Acompañamiento con respeto</p>
        <h1>Un homenaje que <span id="HeroSp">permanece.</span></h1>
        <p>Diseños conmemorativos elaborados con cuidado para honrar una historia que merece ser recordada.</p>
        <div className="hero-actions">
          <a className="btn" href="#catalogo">Ver catálogo <span aria-hidden="true">→</span></a>
          <a className="hero-link" href="#contacto">Recibir orientación</a>
        </div>
        <div className="HeroBeneficios" aria-label="Nuestros compromisos">
          <div className="beneficio"><span aria-hidden="true">01</span><h3>Diseños personalizados</h3></div>
          <div className="beneficio"><span aria-hidden="true">02</span><h3>Materiales duraderos</h3></div>
          <div className="beneficio"><span aria-hidden="true">03</span><h3>Atención cercana</h3></div>
        </div>
      </div>
    </section>
  );
}
