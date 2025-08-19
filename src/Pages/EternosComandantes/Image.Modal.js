import React from "react";
import { Modal, Carousel, Button } from "react-bootstrap";

function ImageModal({ show, handleClose, full, alt, title }) {
  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="lg"
      centered
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        {Array.isArray(full) && full.length > 1 ? (
          <Carousel variant="dark">
            {full.map((imgSrc, idx) => (
              <Carousel.Item key={idx}>
                <img
                  src={imgSrc}
                  alt={`${alt}-${idx}`}
                  className="d-block w-100"
                />
              </Carousel.Item>
            ))}
          </Carousel>
        ) : (
          <img
            src={Array.isArray(full) ? full[0] : full}
            alt={alt}
            className="img-fluid"
          />
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ImageModal;