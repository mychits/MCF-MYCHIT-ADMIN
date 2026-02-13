import { IoMdClose } from "react-icons/io";

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
          <div className="flex justify-between border-b pb-2 text-sm">
            <span className="font-medium text-gray-600">Full Name</span>
            <span className="text-gray-900">{data?.full_name}</span>
          </div>

          <div className="flex justify-between border-b pb-2 text-sm">
            <span className="font-medium text-gray-600">Email</span>
            <span className="text-gray-900">{data?.email}</span>
          </div>

          <div className="flex justify-between border-b pb-2 text-sm">
            <span className="font-medium text-gray-600">Phone Number</span>
            <span className="text-gray-900">{data?.phone_number}</span>
          </div>
                 <div className="flex justify-between border-b pb-2 text-sm">
            <span className="font-medium text-gray-600">Password</span>
            <span className="text-gray-900">{data?.password}</span>
          </div>
          
          <div className="flex justify-between border-b pb-2 text-sm">
            <span className="font-medium text-gray-600">Pincode</span>
            <span className="text-gray-900">{data?.pincode}</span>
          </div>

          <div className="flex justify-between border-b pb-2 text-sm">
            <span className="font-medium text-gray-600">Adhaar Number</span>
            <span className="text-gray-900">{data?.adhaar_no}</span>
          </div>

   <div className="flex justify-between border-b pb-2 text-sm">
            <span className="font-medium text-gray-600">Pan Number</span>
            <span className="text-gray-900">{data?.pan_no}</span>
          </div>

         <div className="flex justify-between border-b pb-2 text-sm">
  <span className="font-medium text-gray-600 w-32 shrink-0">
    Address
  </span>
  <span className="text-gray-900 break-words">
    {data?.address}
  </span>
</div>

          {/* Add other fields similarly */}
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

