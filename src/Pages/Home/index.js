import Poster1 from "../../Imagens/carroussel/cav024.jpg";
import Poster2 from "../../Imagens/carroussel/calararia3esqd.png";
import Poster3 from "../../Imagens/carroussel/cavalaria01.jpeg";
import Poster4 from "../../Imagens/carroussel/carroussel2.jpg";
import Poster5 from "../../Imagens/carroussel/cavalariaComboio.JPG";
import Poster6 from "../../Imagens/carroussel/operacao.JPG";
import Poster7 from "../../Imagens/carroussel/guarda.JPG";
import Poster8 from "../../Imagens/carroussel/cavalaria06.jpeg";
import Poster9 from "../../Imagens/carroussel/desfile.JPG";
import Poster10 from "../../Imagens/carroussel/cavalaria08.jpeg";
import Poster11 from "../../Imagens/carroussel/cavalaria09.jpeg";
import Poster12 from "../../Imagens/carroussel/cavalaria10.jpeg";
import Poster13 from "../../Imagens/carroussel/equoterapia.jfif";
import MapaSP from "../../Imagens/home/mapaSP.png"

import { Container, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";

export default function Home() {

  return (
    <>
      <section
        className="bg-dark w-100"
        style={{
          minHeight: "500px",
          height: "100vh"
        }}
      >
        <div className="w-100 h-100 px-0">
          <div className="row g-0 h-100">
            <div className="col-12 px-0 h-100">
              <div
                id="carouselExampleIndicators"
                className="carousel slide carousel-fade h-100"
                data-bs-ride="carousel"
                data-bs-interval="5000"
                data-bs-pause="hover"
              >
                {/* Indicadores (dots) */}
                <div className="carousel-indicators">
                  <button
                    type="button"
                    data-bs-target="#carouselExampleIndicators"
                    data-bs-slide-to="0"
                    className="active"
                    aria-current="true"
                    aria-label="Slide 1"
                  ></button>
                  <button
                    type="button"
                    data-bs-target="#carouselExampleIndicators"
                    data-bs-slide-to="1"
                    aria-label="Slide 2"
                  ></button>
                  <button
                    type="button"
                    data-bs-target="#carouselExampleIndicators"
                    data-bs-slide-to="2"
                    aria-label="Slide 3"
                  ></button>
                  <button
                    type="button"
                    data-bs-target="#carouselExampleIndicators"
                    data-bs-slide-to="3"
                    aria-label="Slide 4"
                  ></button>
                  <button
                    type="button"
                    data-bs-target="#carouselExampleIndicators"
                    data-bs-slide-to="4"
                    aria-label="Slide 5"
                  ></button>
                  <button
                    type="button"
                    data-bs-target="#carouselExampleIndicators"
                    data-bs-slide-to="5"
                    aria-label="Slide 6"
                  ></button>
                  <button
                    type="button"
                    data-bs-target="#carouselExampleIndicators"
                    data-bs-slide-to="6"
                    aria-label="Slide 7"
                  ></button>
                  <button
                    type="button"
                    data-bs-target="#carouselExampleIndicators"
                    data-bs-slide-to="7"
                    aria-label="Slide 8"
                  ></button>
                  <button
                    type="button"
                    data-bs-target="#carouselExampleIndicators"
                    data-bs-slide-to="8"
                    aria-label="Slide 9"
                  ></button>
                  <button
                    type="button"
                    data-bs-target="#carouselExampleIndicators"
                    data-bs-slide-to="9"
                    aria-label="Slide 10"
                  ></button>
                  <button
                    type="button"
                    data-bs-target="#carouselExampleIndicators"
                    data-bs-slide-to="10"
                    aria-label="Slide 11"
                  ></button>
                  <button
                    type="button"
                    data-bs-target="#carouselExampleIndicators"
                    data-bs-slide-to="11"
                    aria-label="Slide 12"
                  ></button>
                  <button
                    type="button"
                    data-bs-target="#carouselExampleIndicators"
                    data-bs-slide-to="12"
                    aria-label="Slide 13"
                  ></button>
                </div>

                <div className="carousel-inner h-100">
                  <div className="carousel-item active h-100">
                    <img
                      src={Poster1}
                      className="d-block w-100 h-100"
                      alt="Cavalaria - Imagem 1"
                      style={{
                        objectFit: "cover",
                        objectPosition: "center",
                      }}
                    />
                    <div className="carousel-caption d-none d-md-block bg-dark bg-opacity-50 rounded p-3">
                      <h5>Regimento de Polícia Montada 9 de Julho</h5>
                      <p>Tradição e Excelência na Segurança Pública</p>
                    </div>
                  </div>
                  <div className="carousel-item h-100">
                    <img
                      src={Poster2}
                      className="d-block w-100 h-100"
                      alt="Cavalaria - Imagem 2"
                      style={{
                        objectFit: "cover",
                        objectPosition: "center",
                      }}
                    />
                  </div>
                  <div className="carousel-item h-100">
                    <img
                      src={Poster3}
                      className="d-block w-100 h-100"
                      alt="Cavalaria - Imagem 3"
                      style={{
                        objectFit: "cover",
                        objectPosition: "center",
                      }}
                    />
                  </div>
                  <div className="carousel-item h-100">
                    <img
                      src={Poster4}
                      className="d-block w-100 h-100"
                      alt="Cavalaria - Imagem 4"
                      style={{
                        objectFit: "cover",
                        objectPosition: "center",
                      }}
                    />
                  </div>
                  <div className="carousel-item h-100">
                    <img
                      src={Poster5}
                      className="d-block w-100 h-100"
                      alt="Cavalaria - Imagem 5"
                      style={{
                        objectFit: "cover",
                        objectPosition: "center",
                      }}
                    />
                  </div>
                  <div className="carousel-item h-100">
                    <img
                      src={Poster6}
                      className="d-block w-100 h-100"
                      alt="Cavalaria - Imagem 6"
                      style={{
                        objectFit: "cover",
                        objectPosition: "center",
                      }}
                    />
                  </div>
                  <div className="carousel-item h-100">
                    <img
                      src={Poster7}
                      className="d-block w-100 h-100"
                      alt="Cavalaria - Imagem 7"
                      style={{
                        objectFit: "cover",
                        objectPosition: "center",
                      }}
                    />
                  </div>
                  <div className="carousel-item h-100">
                    <img
                      src={Poster8}
                      className="d-block w-100 h-100"
                      alt="Cavalaria - Imagem 8"
                      style={{
                        objectFit: "cover",
                        objectPosition: "center",
                      }}
                    />
                  </div>
                  <div className="carousel-item h-100">
                    <img
                      src={Poster9}
                      className="d-block w-100 h-100"
                      alt="Cavalaria - Imagem 9"
                      style={{
                        objectFit: "cover",
                        objectPosition: "center",
                      }}
                    />
                  </div>
                  <div className="carousel-item h-100">
                    <img
                      src={Poster10}
                      className="d-block w-100 h-100"
                      alt="Cavalaria - Imagem 10"
                      style={{
                        objectFit: "cover",
                        objectPosition: "center",
                      }}
                    />
                  </div>
                  <div className="carousel-item h-100">
                    <img
                      src={Poster11}
                      className="d-block w-100 h-100"
                      alt="Cavalaria - Imagem 11"
                      style={{
                        objectFit: "cover",
                        objectPosition: "center",
                      }}
                    />
                  </div>
                  <div className="carousel-item h-100">
                    <img
                      src={Poster12}
                      className="d-block w-100 h-100"
                      alt="Cavalaria - Imagem 12"
                      style={{
                        objectFit: "cover",
                        objectPosition: "center",
                      }}
                    />
                  </div>
                  <div className="carousel-item h-100">
                    <img
                      src={Poster13}
                      className="d-block w-100 h-100"
                      alt="Projetos Sociais"
                      style={{
                        objectFit: "cover",
                        objectPosition: "center top", // ou "50% 20%" por exemplo
                      }}
                    />
                  </div>

                </div>

                {/* Controles de navegação estilizados */}
                <button
                  className="carousel-control-prev"
                  type="button"
                  data-bs-target="#carouselExampleIndicators"
                  data-bs-slide="prev"
                  style={{ width: "10%" }}
                >
                  <span
                    className="carousel-control-prev-icon"
                    aria-hidden="true"
                    style={{
                      width: "3rem",
                      height: "3rem",
                      backgroundColor: "rgba(0, 0, 0, 0.5)",
                      borderRadius: "50%",
                      padding: "0.5rem"
                    }}
                  ></span>
                  <span className="visually-hidden">Anterior</span>
                </button>
                <button
                  className="carousel-control-next"
                  type="button"
                  data-bs-target="#carouselExampleIndicators"
                  data-bs-slide="next"
                  style={{ width: "10%" }}
                >
                  <span
                    className="carousel-control-next-icon"
                    aria-hidden="true"
                    style={{
                      width: "3rem",
                      height: "3rem",
                      backgroundColor: "rgba(0, 0, 0, 0.5)",
                      borderRadius: "50%",
                      padding: "0.5rem"
                    }}
                  ></span>
                  <span className="visually-hidden">Próximo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-light w-100">
        <Container fluid className="py-5 px-5">
          <Row className="g-4 justify-content-center">
            <Col xs={12} md={6} lg={3}>
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Missão</h5>
                  <p className="card-text">
                    Servir com honra, proteger com coragem e atuar com
                    excelência na segurança pública montada.
                  </p>
                </div>
              </div>
            </Col>

            <Col xs={12} md={6} lg={3}>
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Visão</h5>
                  <p className="card-text">
                    Ser referência nacional em policiamento montado, com foco na
                    disciplina, inovação e proximidade com a comunidade.
                  </p>
                </div>
              </div>
            </Col>

            <Col xs={12} md={6} lg={3}>
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Valores</h5>
                  <p className="card-text">
                    Ética, lealdade, respeito, comprometimento, coragem e
                    espírito de corpo no cumprimento do dever.
                  </p>
                </div>
              </div>
            </Col>

            <Col xs={12} md={6} lg={3}>
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">História</h5>
                  <p className="card-text">
                    Fundado há décadas, o Regimento 9 de Julho carrega uma rica
                    tradição na proteção do povo paulista.
                  </p>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="bg-white py-4">
        <Container>
          <h2 className="text-center mb-4">Nossa Linha do Tempo</h2>
          <div className="timeline-horizontal">
            <div className="timeline-item">
              <div className="timeline-year">1831</div>
              <div className="timeline-content">
                <p>Criação do corpo de Cavalaria.</p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-year">1906</div>
              <div className="timeline-content">
                <p>1º Missão Francesa</p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-year">1914</div>
              <div className="timeline-content">
                <p>2º Missão Francesa</p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-year">1932</div>
              <div className="timeline-content">
                <p>Revolução Constitucionalista</p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-year">1934</div>
              <div className="timeline-content">
                <p>Constituição de 1934</p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-year">2024</div>
              <div className="timeline-content">
                <p>Patrimonio historico e cultaral</p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-year">2025</div>
              <div className="timeline-content">
                <p>Banda de Clarins declarada Patrimônio Historico e cultural</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-light py-5">
        <Container>
          <h2 className="text-center mb-4">Nossa Estrutura</h2>
          <Row className="text-center">
            <Col xs={12} md={4}>
              <div className="mb-3">
                <i className="bi bi-shield-lock fs-1 text-primary"></i>
              </div>
              <h5>4 Esquadrões</h5>
              <p>
                Unidades de patrulha especializadas em policiamento montado.
              </p>
            </Col>
            <Col xs={12} md={4}>
              <div className="mb-3">
                <i className="bi bi-horse fs-1 text-primary"></i>
              </div>
              <h5>502 Cavalos</h5>
              <p>
                Animais treinados com disciplina e cuidado para operações
                urbanas e rurais.
              </p>
            </Col>
            <Col xs={12} md={4}>
              <div className="mb-3">
                <i className="bi bi-hospital fs-1 text-primary"></i>
              </div>
              <h5>Centro de Equoterapia</h5>
              <p>
                Projeto social de reabilitação e inclusão com uso terapêutico de
                cavalos.
              </p>
            </Col>
          </Row>
        </Container>
      </section>
      {/* mapa regional */}
      {/* Área de atuação - Mapa regional */}

      <section className="d-flex bg-white py-5">
        <Container>
          <h2 className="text-center mb-4">Área de atuação</h2>
          <Row className="g-3">
            <Col
              xs={12}
              md={4}
              lg={4}
              sm={6}
              className="text-center p-4 shadow-sm rounded-2 bg-light"
            >
              <div className="mb-3">
                <h5 className="mb-1 fw-bold">Região</h5>
                <p className="mb-0 fs-5 text-dark">
                  São Paulo
                </p>
              </div>
              <div className="mb-3">
                <h5 className="mb-1 fw-bold">Destacamento</h5>
                <p className="mb-0 fs-5 text-dark">
                  14
                </p>
              </div>
              <div className="mb-3">
                <h5 className="mb-1 fw-bold">Centro de Equoterapia</h5>
                <p className="mb-0 fs-5 text-dark">
                  10
                </p>
              </div>
              <div className="mb-3">
                <h5 className="mb-1 fw-bold">Atendimentos médio semanal</h5>
                <p className="mb-0 fs-5 text-dark">
                  220 Pessoas
                </p>
              </div>
              <div className="mb-3">
                <h5 className="mb-1 fw-bold">Total de solípedes</h5>
                <p className="mb-0 fs-5 text-dark">
                  502
                </p>
              </div>
            </Col>
            <Col xs={12} md={8} lg={8} sm={6} className="mapa-wrapper">
              <img src={MapaSP} alt="Mapa de São Paulo" className="img-fluid" />
            </Col>
          </Row>
        </Container>
      </section>


      <section className="bg-light py-5">
        <Container>
          <h2 className="text-center mb-4">Conheça Nossos Projetos</h2>
          <Row className="g-4">
            <Col xs={12} md={4}>
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Projeto Gira Mundo</h5>
                  <p className="card-text">
                    Visitas a escolas e comunidades, promovendo interação com os
                    cavalos e conscientização sobre segurança.
                  </p>
                </div>
              </div>
            </Col>
            <Col xs={12} md={4}>
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Equoterapia Social</h5>
                  <p className="card-text">
                    Atendimentos gratuitos voltados a crianças com deficiência,
                    com apoio profissional.
                  </p>
                </div>
              </div>
            </Col>
            <Col xs={12} md={4}>
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Campanhas Solidárias</h5>
                  <p className="card-text">
                    Arrecadações de roupas e alimentos organizadas por policiais
                    e parceiros comunitários.
                  </p>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
}
