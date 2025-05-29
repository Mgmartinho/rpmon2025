import React from "react";
import img1Thumb from "../../Imagens/eternosComandantes/1.jpg";
import img1Full from "../../Imagens/eternosComandantes/1.1.png";
import img2Thumb from "../../Imagens/eternosComandantes/2.jpg";
import img2Full from "../../Imagens/eternosComandantes/2.1.png";
import img3Thumb from "../../Imagens/eternosComandantes/3.jpg";
import img3Full from "../../Imagens/eternosComandantes/3.1.png";
import img4Thumb from "../../Imagens/eternosComandantes/4.jpg";
import img4Full from "../../Imagens/eternosComandantes/4.1.png";

const comandantes = [
  {
    thumb: img1Thumb,
    full: img1Full,
    alt: "Imagem 1",
    title: "Ten Cel Joaquim Inácio Batista Cardoso",
    modalId: "imagemModal1",
  },
  {
    thumb: img2Thumb,
    full: img2Full,
    alt: "Imagem 2",
    title: "Ten Cel Epifânio Alves Pequeno",
    modalId: "imagemModal2",
  },
  {
    thumb: img3Thumb,
    full: img3Full,
    alt: "Imagem 3",
    title: "Ten Cel Edmundo Wright",
    modalId: "imagemModal3",
  },
  {
    thumb: img4Thumb,
    full: img4Full,
    alt: "Imagem 4",
    title: "Ten Cel José Marcondes Brito",
    modalId: "imagemModal4",
  },
];

export default function EternosComandantes() {
  return (
    <div className="container">
      <h2 className="text-dark text-center pt-4 pb-3">
        Comandantes do Século XIX
      </h2>
      <div className="row justify-content-center">
        {comandantes.map(({ thumb, full, alt, title, modalId }) => (
          <div className="col-md-1 mb-4" key={modalId}>
            <a
              href={full}
              data-bs-toggle="modal"
              data-bs-target={`#${modalId}`}
            >
              <img
                src={thumb}
                className="img-fluid rounded"
                alt={alt}
                title={title}
              />
            </a>

            {/* Modal */}
            <div
              className="modal fade"
              id={modalId}
              tabIndex="-1"
              aria-labelledby={`${modalId}Label`}
              aria-hidden="true"
            >
              <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content bg-white">
                  <div className="modal-header">
                    <h5 className="modal-title" id={`${modalId}Label`}>
                      {title}
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      data-bs-dismiss="modal"
                      aria-label="Fechar"
                    ></button>
                  </div>
                  <div className="modal-body text-center">
                    <img src={full} alt={alt} className="img-fluid" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
