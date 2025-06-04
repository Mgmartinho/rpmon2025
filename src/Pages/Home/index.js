import MidiasSociais from "../../Imagens/carroussel/sociais.jpeg";
import Poster1 from "../../Imagens/carroussel/cav024.jpg";
import Poster2 from "../../Imagens/carroussel/cav052.jpg";
//import Estandarte from "../../Imagens/home/estandarteSVG.png";
//import Ocorrencia from "../../Imagens/home/abordagem2esqd.jfif";
//import LogoRpmon from "../../Imagens/home/LOGORPMON.png";
//import Policial from "../../Imagens/home/Drumond.png";
//import Mapa from "../../Imagens/home/São Paulo RegAdmin.png";
import MapaTeste from "../../Imagens/home/SP_RG_Imediatas_2024.svg";

import { Row, Col, Container } from "react-bootstrap";

import "./styles.css";

export default function Home() {
  

  return (
    <>
      <section className="bg-dark d-flex justify-content-center align-items-center w-100 h-100">
        <div className="w-100 px-0">
          <div className="row">
            <div className="col-12 px-0">
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
                          height: "720px",
                          objectFit: "cover",
                          objectPosition: "center",
                        }}
                      />
                    </div>
                  </div>
                  <div className="carousel-item">
                    <img
                      src={Poster2}
                      className="d-block w-100"
                      alt="Carrossel 1"
                      style={{
                        height: "720px",
                        objectFit: "cover",
                        objectPosition: "center",
                      }}
                    />
                  </div>
                  <div className="carousel-item">
                    <img
                      src={MidiasSociais}
                      className="d-block w-100"
                      alt="Carrossel 1"
                      style={{
                        height: "720px",
                        height: "800px",
                        objectFit: "cover",
                        objectPosition: "center",
                      }}
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
              <div className="timeline-year">1892</div>
              <div className="timeline-content">
                <p>Denominação Regimento de Policia Montada "9 de Julho"</p>
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
              <div className="timeline-year">2025</div>
              <div className="timeline-content">
                <p>Dias atuais</p>
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
      <section className="d-flex bg-white py-5">
        <Container>
          <h2 className="text-center mb-4">Area de atuação</h2>
          <Row className="g-3">
            <Col
              xs={12}
              md={4}
              lg={4}
              sm={6}
              className="text-center p-4 shadow-sm rounded-2 bg-light"
            >
              {/* <h2 className="mb-4 text-primary">Informações Demográficas</h2> */}

              <div className="mb-3">
                <h5 className="mb-1 fw-bold">População</h5>
                <p className="mb-0 fs-5 text-dark">45.973.194 habitantes</p>
              </div>

              <div className="mb-3">
                <h5 className="mb-1 fw-bold">Densidade Demográfica</h5>
                <p className="mb-0 fs-5 text-dark">178,92 hab/km²</p>
              </div>

              <div className="mb-3">
                <h5 className="mb-1 fw-bold">Área Territorial</h5>
                <p className="mb-0 fs-5 text-dark">248.219,5 km²</p>
              </div>

              <div className="mb-3">
                <h5 className="mb-1 fw-bold">Total de Veículos</h5>
                <p className="mb-0 fs-5 text-dark">33.264.096</p>
              </div>

              <div className="mb-3">
                <h5 className="mb-1 fw-bold">Frota por Habitante</h5>
                <p className="mb-0 fs-5 text-dark">
                  1 veículo para cada 1,4 habitante
                </p>
              </div>

              <div className="mb-3">
                <h5 className="mb-1 fw-bold">PIB</h5>
                <p className="mb-0 fs-5 text-dark">R$ 2,5 trilhões (2022)</p>
              </div>

              <div>
                <h6 className="text-muted mt-4">Fonte: IBGE e Detran</h6>
              </div>
            </Col>

            <Col xs={12} md={8} lg={8} sm={6}>
              <img src={MapaTeste} alt="Mapa" className="img-fluid rounded " />
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
                  <h5 className="card-title">Projeto Cavalo Amigo</h5>
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
