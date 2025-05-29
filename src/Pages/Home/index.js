import React from "react";
import MidiasSociais from "../../Imagens/sociais.jpeg";

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
                  href="#"
                  style={{
                    textDecoration: "none",
                    textShadow: "5px 5px 20px turquoise",
                  }}
                  target="_blank"
                  rel="noreferrer"
                  data-bs-toggle="modal"
                  data-bs-target="#homeModal1"
                >
                  Heraldica
                </a>
              </h3>
              <a
                href="img/LOGORPMON.png"
                target="_blank"
                rel="noreferrer"
                data-bs-toggle="modal"
                data-bs-target="#homeModal1"
              >
                <img
                  src="img/LOGORPMON.png"
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
                  href="img/pm dO mES_JAN.jpg"
                  style={{
                    textDecoration: "none",
                    textShadow: "5px 5px 20px turquoise",
                  }}
                  target="_blank"
                  rel="noreferrer"
                  data-bs-toggle="modal"
                  data-bs-target="#homeModal2"
                >
                  Policial do Mês
                </a>
              </h3>
              <a
                href="img/pm dO mES_JAN.jpg"
                target="_blank"
                rel="noreferrer"
                data-bs-toggle="modal"
                data-bs-target="#homeModal2"
              >
                <img
                  src="img/pm dO mES_JAN.jpg"
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
                  <img
                    src={MidiasSociais}
                    className="d-block rounded-3 img-cover w-100"
                    alt="Carrossel 1"
                    style={{
                      height: "800px",
                      objectFit: "cover",
                      objectPosition: "center",
                    }}
                  />
                </div>
                <div className="carousel-item">
                  <img
                    src="img/cav024.jpg"
                    className="d-block w-100 rounded-3"
                    alt="Carrossel 2"
                    height="800"
                  />
                </div>
                <div className="carousel-item">
                  <img
                    src="img/sociais.jpeg"
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
                  href="img/Estandarte.jpeg"
                  style={{
                    textDecoration: "none",
                    textShadow: "5px 5px 20px turquoise",
                  }}
                  target="_blank"
                  rel="noreferrer"
                  data-bs-toggle="modal"
                  data-bs-target="#homeModal3"
                >
                  Estandarte
                </a>
              </h3>
              <a
                href="#"
                target="_blank"
                rel="noreferrer"
                data-bs-toggle="modal"
                data-bs-target="#homeModal3"
              >
                <img
                  src="img/Estandarte.jpeg"
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
                  href="#"
                  style={{
                    textDecoration: "none",
                    textShadow: "5px 5px 20px turquoise",
                  }}
                  target="_blank"
                  rel="noreferrer"
                  data-bs-toggle="modal"
                  data-bs-target="#homeModal4"
                >
                  Ocorrência Do Mês
                </a>
              </h3>
              <a
                href="img/abordagem2esqd.jfif"
                target="_blank"
                rel="noreferrer"
                data-bs-toggle="modal"
                data-bs-target="#homeModal4"
              >
                <img
                  src="img/abordagem2esqd.jfif"
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

      {/* Modais */}
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
            <div className="modal-body">
              <img
                src="img/Heraldica.jpg"
                alt="Heraldica"
                className="h-50 w-75"
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
                Policia Do Mês
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <p className="h-75">teste</p>
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
              <h5 className="modal-title" id="exampleModalLabel3">
                Estandarte
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <img
                src="img/Estandarte.bmp"
                alt="Estandarte"
                className="h-50 w-50"
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
              <h5 className="modal-title" id="exampleModalLabel4">
                Ocorrência Do Mês
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <img
                src="img/abordagem2esqd.jfif"
                alt="Ocorrência Do Mês"
                className="h-75 w-75"
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
