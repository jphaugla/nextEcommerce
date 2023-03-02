import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import ErrorModal from "./ErrorModal";

interface Props {
  show: boolean;
  closeModal: () => void;
  text: string;
  title: string;
}

const ErrorModalContainer: React.FunctionComponent<Props> = ({
  show,
  closeModal,
  text,
  title,
}) => {
  const [isBrowser, setIsBrowser] = useState(false);
  const [modalRootDiv, setModalRootDiv] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let targetDiv = document.getElementById("modal-root");

    setIsBrowser(true);
    if (targetDiv !== null) {
      setModalRootDiv(targetDiv);
    }
  }, []);

  if (isBrowser && modalRootDiv !== null) {
    return ReactDOM.createPortal(
      <ErrorModal
        show={show}
        closeModal={closeModal}
        text={text}
        title={title}
      />,
      modalRootDiv
    );
  } else {
    return null;
  }
};

export default ErrorModalContainer;
