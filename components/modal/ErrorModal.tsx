import React from "react";

interface Props {
  show: boolean;
  closeModal: () => void;
  text: string;
  title: string;
}

const ErrorModal = ({ show, closeModal, text, title }: Props) => {
  return (
    <>
      <div
        className="fixed top-0 left-0 w-screen h-screen grid place-content-center bg-gray-500/50"
        onClick={closeModal}
      />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white w-72 xs:w-96 h-52 rounded-2xl z-50 flex flex-col justify-between pb-2">
        <div className="flex justify-between px-2 text-2xl rounded-t-2xl bg-[#2d3148]">
          <span className="text-white">{title}</span>
          <span
            className="select-none cursor-pointer text-white mr-2"
            onClick={closeModal}
          >
            x
          </span>
        </div>
        <div className="px-2 grow mt-3">{text}</div>
      </div>
    </>
  );
};

export default ErrorModal;
