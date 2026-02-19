import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Sidebar from "../layouts/Sidebar";

const PageWrapper = ({ isVisible, onClose, isNewTab, children }) => {
  const newWindowRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (isVisible && isNewTab) {
      newWindowRef.current = window.open(
        "",
        "_blank",
        "width=1200,height=800"
      );

      containerRef.current =
        newWindowRef.current.document.createElement("div");

      newWindowRef.current.document.body.appendChild(
        containerRef.current
      );

      newWindowRef.current.document.title = "Add Group";

      return () => {
        newWindowRef.current?.close();
      };
    }
  }, [isVisible, isNewTab]);

  if (!isVisible) return null;

  // ✅ Render in new tab
  if (isNewTab && containerRef.current) {
    return createPortal(children, containerRef.current);
  }

  // ✅ Render normal modal
  return (
    <div className="fixed inset-0 z-50 bg-gray-50 overflow-y-auto flex">
      <Sidebar />
      <div className="flex-1 flex justify-center">
        <div className="relative w-full max-w-3xl bg-white rounded shadow p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PageWrapper;
