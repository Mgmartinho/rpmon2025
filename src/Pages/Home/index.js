
import MidiasSociais from "../../Imagens/carroussel/sociais.jpeg";
import Poster1 from "../../Imagens/carroussel/cav024.jpg";
import Poster2 from "../../Imagens/carroussel/cav052.jpg";
import Estandarte from "../../Imagens/home/estandarteSVG.png";
import Ocorrencia from "../../Imagens/home/abordagem2esqd.jfif";
import LogoRpmon from "../../Imagens/home/LOGORPMON.png";
import Policial from "../../Imagens/home/Drumond.png";

import "./styles.css";

export default function Home() {
  return (
    <section className="bg-dark d-flex justify-content-center align-items-center w-100 h-100">
      <div className="container mt-5 mb-5">
        <div className="row">
          {/* Coluna 1 */}
          <div className="col-md-3">
            <div className="text-center">
              <h3 className="text-white mb-0">
                <a
                  style={{
                    textDecoration: "none",
                    textShadow: "5px 5px 20px turquoise",
                    cursor: "pointer",
                  }}
                  data-bs-toggle="modal"
                  data-bs-target="#homeModal1"
                >
                  Heraldica
                </a>
              </h3>
              <a
                target="_blank"
                rel="noreferrer"
                data-bs-toggle="modal"
                data-bs-target="#homeModal1"
              >
                <img
                  src={LogoRpmon}
                  alt="Heraldica"
                  className="pt-1 w-100 rounded-3"
                  height="350"
                  width="300"
                />
              </a>
            </div>
            <br />
            <br />
            <div className="text-center">
              <h3 className="text-white mb-0">
                <a
                  style={{
                    textDecoration: "none",
                    textShadow: "5px 5px 20px turquoise",
                    cursor:"pointer",
                  }}
                  rel="noreferrer"
                  data-bs-toggle="modal"
                  data-bs-target="#homeModal2"
                >
                  Policial do Mês
                </a>
              </h3>
              <a
                rel="noreferrer"
                data-bs-toggle="modal"
                data-bs-target="#homeModal2"
              >
                <img
                  src={Policial}
                  alt="Policial do Mês"
                  className="pt-1 w-100 rounded-3"
                  height="350"
                  width="300"
                />
              </a>
            </div>
          </div>

          {/* Coluna 2 */}

          <div className="col-md-6">
            <div
              id="carouselExampleIndicators"
              className="carousel slide"
              data-bs-ride="carousel"
            >
              <div className="carousel-inner">
                <div className="carousel-item active">
                  <div className="shadow-carousel-wrapper rounded-3 overflow-hidden">
                    <img
                      src={Poster1}
                      className="d-block w-100"
                      alt="Carrossel 1"
                      style={{
                        height: "auto",
                        objectFit: "cover",
                        objectPosition: "center",
                      }}
                    />
                  </div>
                </div>
                <div className="carousel-item">
                  <img
                    src={Poster2}
                    className="d-block w-100 rounded-3"
                    alt="Carrossel 2"
                    height="800"
                  />
                </div>
                <div className="carousel-item">
                  <img
                    src={MidiasSociais}
                    className="d-block w-100 rounded-3"
                    alt="Carrossel 3"
                    height="800"
                  />
                </div>
              </div>
              <button
                className="carousel-control-prev"
                type="button"
                data-bs-target="#carouselExampleIndicators"
                data-bs-slide="prev"
              >
                <span
                  className="carousel-control-prev-icon"
                  aria-hidden="true"
                ></span>
                <span className="visually-hidden">Previous</span>
              </button>
              <button
                className="carousel-control-next"
                type="button"
                data-bs-target="#carouselExampleIndicators"
                data-bs-slide="next"
              >
                <span
                  className="carousel-control-next-icon"
                  aria-hidden="true"
                ></span>
                <span className="visually-hidden">Next</span>
              </button>
            </div>
          </div>

          {/* Coluna 3 */}
          <div className="col-md-3">
            <div className="text-center">
              <h3 className="text-white mb-0">
                <a
                  style={{
                    textDecoration: "none",
                    textShadow: "5px 5px 20px turquoise",
                    cursor:"pointer",
                  }}
                  rel="noreferrer"
                  data-bs-toggle="modal"
                  data-bs-target="#homeModal3"
                >
                  Estandarte
                </a>
              </h3>
              <a
                rel="noreferrer"
                data-bs-toggle="modal"
                data-bs-target="#homeModal3"
              >
                <img
                  src={Estandarte}
                  alt="Estandarte"
                  className="pt-1 w-100 rounded-3"
                  height="350"
                  width="300"
                />
              </a>
            </div>
            <br />
            <br />

            <div className="text-center">
              <h3 className="text-white mb-0">
                <a
                  style={{
                    textDecoration: "none",
                    textShadow: "5px 5px 20px turquoise",
                    cursor:"pointer",
                  }}
                  rel="noreferrer"
                  data-bs-toggle="modal"
                  data-bs-target="#homeModal4"
                >
                  Ocorrência Do Mês
                </a>
              </h3>
              <a
                rel="noreferrer"
                data-bs-toggle="modal"
                data-bs-target="#homeModal4"
              >
                <img
                  src={Ocorrencia}
                  alt="Ocorrência Do Mês"
                  className="pt-1 w-100 rounded-3"
                  height="350"
                  width="300"
                />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Modal 1 */}
      <div
        className="modal fade"
        id="homeModal1"
        tabIndex="-1"
        aria-labelledby="exampleHomeLabel1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleHomeLabel1">
                Heraldica
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body d-flex justify-content-center">
              <img src={LogoRpmon} alt="Heraldica" className="img-fluid" />
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal 2 */}
      <div
        className="modal fade"
        id="homeModal2"
        tabIndex="-1"
        aria-labelledby="exampleHomeLabel2"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleHomeLabel2">
                Policial do Mês
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body d-flex justify-content-center">
              <img src={Policial} alt="Policial do Mês" className="img-fluid" />
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal 3 */}
      <div
        className="modal fade"
        id="homeModal3"
        tabIndex="-1"
        aria-labelledby="exampleHomeLabel3"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleHomeLabel3">
                Estandarte
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body d-flex justify-content-center">
              <img src={Estandarte} alt="Estandarte" className="img-fluid" />
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal 4 */}
      <div
        className="modal fade"
        id="homeModal4"
        tabIndex="-1"
        aria-labelledby="exampleHomeLabel4"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleHomeLabel4">
                Ocorrência do Mês
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body d-flex justify-content-center">
              <img
                src={Ocorrencia}
                alt="Ocorrência do Mês"
                className="img-fluid"
              />
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
