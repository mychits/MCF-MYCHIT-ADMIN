import { IoMdClose } from "react-icons/io";

const formatLabel = (key) => {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};


const ReConfirmModal = ({
  isOpen,
  title = "Confirm Details",
  data,
  onCancel,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Edit",
}) => {
  if (!isOpen) return null; // ✅ exit early if modal is closed
console.log('data',data);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-lg p-6 relative">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-600 hover:bg-gray-100 p-2 rounded-full"
        >
          <IoMdClose />
        </button>

        <h2 className="text-xl font-bold mb-4">{title}</h2>

     <div className="space-y-3 max-h-96 overflow-y-auto">
  {Object.entries(data)
    // Remove track_source and any original field that has a "_select" counterpart
    .filter(([key]) => key !== "track_source")
    .filter(([key]) => {
      // If this key ends with "_select", keep it
      if (key.endsWith("_select")) return true;
      // Otherwise, only keep keys that do NOT have a "_select" version in data
      return !data[`${key}_select`];
    })
    .map(([key, value]) => {
      // Remove "_select" suffix from label if present
      const label = formatLabel(key.replace(/_select$/, ""));
      return (
        <div key={key} className="flex justify-between border-b pb-2 text-sm">
          <span className="font-medium">{label}</span>
          <span className="mr-2">{value}</span>
        </div>
      );
    })}
</div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReConfirmModal;

