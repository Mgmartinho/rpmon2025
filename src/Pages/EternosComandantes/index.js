import { useEffect,useState } from "react";
import "./styles.css";
import { comandantesXIX, comandantesXX, comandantesXXI } from "./galery";


export default function EternosComandantes() {
  useEffect(() => {
    // Exemplo: foco no input de modal, caso exista algum com id 'myModal' e 'myInput'
    const myModal = document.getElementById("myModal");
    const myInput = document.getElementById("myInput");

    if (myModal && myInput) {
      myModal.addEventListener("shown.bs.modal", () => {
        myInput.focus();
      });
    }

    // Cleanup para evitar vazamento
    return () => {
      if (myModal && myInput) {
        myModal.removeEventListener("shown.bs.modal", () => {
          myInput.focus();
        });
      }
    };
  }, []);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Pega todas as imagens que precisam ser carregadas
    const allImages = [
      ...comandantesXIX,
      ...comandantesXX,
      ...comandantesXXI
    ].map((c) => c.full);

    let loadedCount = 0;

    allImages.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === allImages.length) {
          setLoading(false); // termina o loading quando todas carregarem
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === allImages.length) {
          setLoading(false);
        }
      };
    });
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h2 className="text-dark text-center pt-4 pb-3">
        Comandantes do Século XIX
      </h2>
      <div className="row justify-content-center">
        {comandantesXIX.map(({ thumb, full, alt, title, modalId }) => (
          <div className="col-md-1 mb-4" key={modalId}>
            <button
              type="button"
              className="border-0 bg-transparent p-0"
              data-bs-toggle="modal"
              data-bs-target={`#${modalId}`}
            >
              <img
                src={thumb}
                className="img-fluid rounded img-hover-zoom"
                alt={alt}
                title={title}
              />
            </button>

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

      <h2 className="text-dark text-center pt-2 pb-4">
        Comandantes do Século XX
      </h2>
      <div className="row justify-content-center">
        {comandantesXX.map(({ thumb, full, alt, title, modalId }) => (
          <div className="col-md-1 mb-4" key={modalId}>
            <button
              type="button"
              className="border-0 bg-transparent p-0"
              data-bs-toggle="modal"
              data-bs-target={`#${modalId}`}
            >
              <img
                src={thumb}
                className="img-fluid rounded img-hover-zoom"
                alt={alt}
                title={title}
              />
            </button>

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

      <h2 className="text-dark text-center pt-4 pb-3">
        Comandantes do Século XXI
      </h2>
      <div className="row justify-content-center">
        {comandantesXXI.map(({ thumb, full, alt, title, modalId }) => (
          <div className="col-md-1 mb-4" key={modalId}>
            <button
              type="button"
              className="border-0 bg-transparent p-0"
              data-bs-toggle="modal"
              data-bs-target={`#${modalId}`}
            >
              <img
                src={thumb}
                className="img-fluid rounded img-hover-zoom"
                alt={alt}
                title={title}
                modalId
              />
            </button>

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
