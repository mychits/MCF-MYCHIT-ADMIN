import Navbar from "../components/layouts/Navbar";
import Sidebar from "../components/layouts/Sidebar";
import { HiCurrencyRupee } from "react-icons/hi2";
import { Banknote, Briefcase, TicketCheck, MoreHorizontal } from "lucide-react";
import { Link } from "react-router-dom";

const PayOutMenu = () => {
  const payOutMenuDivs = [
    {
      id: "#1",
      title: "Chit",
      icon: <TicketCheck size={28} className="text-blue-600" />,
      href:"/payment-in-out-menu/general-payment-out/chit"
    },
    {
      id: "#2",
      title: "Commission / Incentive",
      icon: <HiCurrencyRupee size={28} className="text-yellow-600" />,
       href:"/payment-in-out-menu/payment-out/commission"
    },
    {
      id: "#3",
      title: "Salary",
      icon: <Briefcase size={28} className="text-purple-600" />,
       href:"/payment-in-out-menu/payment-out/salary"

    },
    {
      id: "#4",
      title: "Petty Cash",
      icon: <Banknote size={28} className="text-yellow-600" />,
       href:"/payment-in-out-menu/payment-out/petty-cash"

    },
    {
      id: "#5",
      title: "Others",
      icon: <MoreHorizontal size={28} className="text-gray-600" />,
       href:"/payment-in-out-menu/payment-out/others"

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
              Pay Out
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {payOutMenuDivs.map((item, idx) => (
                <Link to={item.href } key={idx}>
                  <div className="bg-white shadow-md rounded-2xl p-5 flex items-center space-x-4 hover:shadow-xl transition">
                    <div className="p-3 bg-gray-100 rounded-full">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-700">
                        {item.title}
                      </h4>
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

export default PayOutMenu;
