/* eslint-disable react/prop-types */
import { Fragment, useLayoutEffect } from "react";
import { IoMdClose } from "react-icons/io";
import Sidebar from "../layouts/Sidebar";

const PageWrapper = ({ isVisible, onClose, children }) => {
  useLayoutEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
<div className="fixed inset-0 z-50 bg-gray-50 overflow-y-auto flex">
  <Sidebar />

  <div className="flex-1 flex justify-center">
    <div className="relative w-full max-w-3xl bg-white rounded shadow p-6">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-xl text-gray-700
                 hover:bg-gray-100 rounded-full"
      >
        <IoMdClose />
      </button>

      {children}
    </div>
  </div>
</div>

  );
};

export default PageWrapper;
