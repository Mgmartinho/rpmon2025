import React from 'react';
import './style.css';

const SobreNos = () => {
  return (
    <main className="about-container">
      <section className="about-section">
        <div className="container">
          <h2 className="text-center mb-5">"Os 130 de 31"</h2>
          <div className="image-wrapper mb-4">
            <a href="/img/historia2.jpg" target="_blank" rel="noreferrer">
              <img src="/img/historia2.jpg" alt="Quartel RPMON" className="img-fluid rounded-3" />
            </a>
          </div>
          <div className="text-content">
            <p>
              TRAÇADO HISTÓRICO DO REGIMENTO DE CAVALARIA “9 DE JULHO”: Em 1831, logo após a abdicação de D. Pedro I em
              favor de seu filho D.Pedro II, de apenas 5 anos, iniciou-se o período denominado Regencial.
            </p>
            <a
              className="btn btn-dark"
              data-bs-toggle="collapse"
              href="#collapseExample"
              role="button"
              aria-expanded="false"
              aria-controls="collapseExample"
            >
              Continuação..."130 de 31"
            </a>
            <div className="collapse mt-3" id="collapseExample">
              <div className="card card-body">
                <p>
                  [...] O então Ministro da Justiça, Padre Diogo Antônio Feijó, preocupado com a situação,
                  encaminhou à Assembleia Geral o projeto de lei que criava a Guarda Municipal Permanente na cidade do
                  Rio de Janeiro, capital do Império [...]
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default SobreNos;
