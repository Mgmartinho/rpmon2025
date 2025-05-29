import "./styles.css"
import { comandantesXIX } from "./galery";
import { comandantesXX } from "./galery";

export default function EternosComandantes() {
  return (
    <div className="container">
      <h2 className="text-dark text-center pt-4 pb-3">
        Comandantes do Século XIX
      </h2>
      <div className="row justify-content-center">
        {comandantesXIX.map(({ thumb, full, alt, title, modalId }) => (
          <div className="col-md-1 mb-4" key={modalId}>
            <a
              href={full}
              data-bs-toggle="modal"
              data-bs-target={`#${modalId}`}
            >
              <img
                src={thumb}
                className="img-fluid rounded img-hover-zoom"
                alt={alt}
                title={title}
                img-hover-zoom
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

      <h2 className="text-dark text-center pt-2 pb-4">
        Comandantes do Século XX
      </h2>
      <div className="row justify-content-center">
        {comandantesXX.map(({ thumb, full, alt, title, modalId }) => (
          <div className="col-md-1 mb-4 transform-scale(1.3)" key={modalId}>
            <a
              href={full}
              data-bs-toggle="modal"
              data-bs-target={`#${modalId}`}
            >
              <img
                src={thumb}
                className="img-fluid rounded img-hover-zoom"
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
