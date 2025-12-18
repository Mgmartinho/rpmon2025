import { useEffect, useState } from "react";
import { Modal, Carousel, Button } from "react-bootstrap";
import { comandantesXIX, comandantesXX, comandantesXXI } from "./galery";
import "./styles.css";

export default function EternosComandantes() {
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({});

  // Preload de todas as imagens
  useEffect(() => {
    const allImages = [
      ...comandantesXIX,
      ...comandantesXX,
      ...comandantesXXI,
    ].flatMap((c) => (Array.isArray(c.full) ? c.full : [c.full]));

    let loadedCount = 0;

    allImages.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === allImages.length) setLoading(false);
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === allImages.length) setLoading(false);
      };
    });
  }, []);

  // Função para abrir a modal
  const openModal = (item) => {
    setModalData(item);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  // Função para renderizar os cards de qualquer século
  const renderCards = (comandantes) =>
    comandantes.map(({ thumb, full, alt, title, modalId }) => (
      <div className="col-md-1 mb-4" key={modalId}>
        <button
          type="button"
          className="border-0 bg-transparent p-0"
          onClick={() => openModal({ thumb, full, alt, title })}
        >
          <img
            src={thumb}
            className="img-fluid rounded img-hover-zoom"
            alt={alt}
            title={title}
          />
        </button>
      </div>
    ));

  return (
    <div className="container ">
      <h2 className="text-dark text-center pt-4 pb-3">
        Comandantes do Século XIX
      </h2>
      <div className="row justify-content-center">
        {renderCards(comandantesXIX)}
      </div>

      <h2 className="text-dark text-center pt-2 pb-4">
        Comandantes do Século XX
      </h2>
      <div className="row justify-content-center">
        {renderCards(comandantesXX)}
      </div>

      <h2 className="text-dark text-center pt-4 pb-3">
        Comandantes do Século XXI
      </h2>
      <div className="row justify-content-center">
        {renderCards(comandantesXXI)}
      </div>

      {/* Modal global com Carousel */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="xl"
        centered
      >
        <Modal.Header closeButton>
  <Modal.Title className="d-flex align-items-center">
    {modalData.thumb && (
      <img
        src={modalData.thumb}
        alt={`${modalData.title}-thumb`}
        className="rounded-circle me-2"
        style={{ width: "40px", height: "40px", objectFit: "cover" }}
      />
    )}
    {modalData.title}
  </Modal.Title>
</Modal.Header>


        <Modal.Body>
          {modalData.full
            ? // Garantir que full é sempre um array plano
              (() => {
                const images = Array.isArray(modalData.full)
                  ? modalData.full.flat()
                  : [modalData.full];

                return images.length > 1 ? (
                  <Carousel>
                    {images.map((imgSrc, idx) => (
                      <Carousel.Item key={idx}>
                        <img
                          src={imgSrc}
                          alt={`${modalData.alt}-${idx}`}
                          className="d-block w-100"
                        />
                      </Carousel.Item>
                    ))}
                  </Carousel>
                ) : (
                  <img
                    src={images[0]}
                    alt={modalData.alt}
                    className="img-fluid"
                  />
                );
              })()
            : null}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
