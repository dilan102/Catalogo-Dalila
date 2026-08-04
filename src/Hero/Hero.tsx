export default function Hero() {
  return (
    <section id="inicio" className="hero">
      <div className="HeroContenido">
        <h1>
          HONRAMOS SU MEMORIA, <span id="HeroSp"> PARA SIEMPRE</span>
        </h1>
        <p>
          Descubre nuestro catálogo de objetos funerarios hechos con respeto,
          cuidado y amor eterno.
        </p>
        <a className="btn" href="#catalogo">
          VER CATÁLOGO
          <span className="material-symbols-outlined">arrow_forward</span>
        </a>
        <div className="HeroBeneficios">
          <div className="beneficio">
            <span className="material-symbols-outlined">star_shine</span>
            <h3>MATERIALES DE ALTA CALIDAD</h3>
          </div>
          <div className="beneficio">
            <span className="material-symbols-outlined">person_celebrate</span>
            <h3>DISEÑOS QUE HONRAN SU LEGADO</h3>
          </div>
          <div className="beneficio">
            <span className="material-symbols-outlined">partner_heart</span>
            <h3>ATENCIÓN HUMANA Y PERSONALIZADA</h3>
          </div>
        </div>
      </div>
    </section>
  );
}
