import Navbar from "../components/layouts/Navbar";
import Sidebar from "../components/layouts/Sidebar";

import { MdAddLink } from "react-icons/md";
import { Link } from "react-router-dom";
import { PiLinkSimpleBreakFill } from "react-icons/pi";
const PaymentLinkMenu = () => {
  const payInMenuDivs = [
    {
      id: "#1",
      title: "Chit Payment Link",
      subtitle: "Individual Mode",
      icon: <MdAddLink size={28} className="text-green-600" />,
      href: "/pay-in-menu/payment-link-menu/chit-payment",
    },
    {
      id: "#2",
      title: "Bulk Chit Payment Link",
      subtitle: "Bulk Mode",
      icon: <PiLinkSimpleBreakFill size={28} className="text-green-600" />,
      href: "/pay-in-menu/payment-link-menu/chit-bulk-payment",
    },
  ];

  return (
    <div className="flex mt-20">
      <div className="flex min-h-screen w-full bg-gray-100">
        <Sidebar />
        <div className="flex-1">
          <Navbar visibility={true} />
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Payment Link
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {payInMenuDivs.map((item, idx) => (
                <Link to={item.href} key={idx}>
                  <div className="bg-white shadow-md rounded-2xl p-5 flex items-center space-x-4 hover:shadow-xl transition">
                    <div className="p-3 bg-gray-100 rounded-full">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-700">
                        {item.title}
                      </h4>
                      <h6 className="text-sm m-2 text-gray-700">
                        {item.subtitle}
                      </h6>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentLinkMenu;
