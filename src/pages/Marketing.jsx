// import { NavLink, Outlet } from "react-router-dom";
import { useState, Fragment, useRef,useEffect } from "react";
import Sidebar from "../components/layouts/Sidebar";
// import { FaWhatsapp } from "react-icons/fa";
// import { RiMoneyRupeeCircleLine } from "react-icons/ri";
import { FaFacebookSquare } from "react-icons/fa";
// import { MdEmail } from "react-icons/md";
import { AiOutlinePlus, AiOutlineMinus } from "react-icons/ai";
import { LiaSmsSolid } from "react-icons/lia";
import { NavLink, Outlet, useLocation } from "react-router-dom";


// const mainMenus = [
//   {
//     key: "#main-1",
//     title: "Whatsapp Marketing",
//     icon: <FaWhatsapp size={20} />,
//     subMenus: [
//       {
//         key: "#1",
//         title: "Login",
//         link: "https://app.interakt.ai/login",
//         icon: <FaWhatsapp size={20} />,
//         newTab: true,
//       },

//       {
//         key: "#main-4",
//         title: "Due Message",
//         icon: <FaWhatsapp size={20} />,
//         subMenus: [
//           {
//             key: "#4",
//             title: "Due",
//             link: "/marketing/due-message",
//             icon: <RiMoneyRupeeCircleLine size={20} />,
//           },
//           {
//             key: "#6",
//             title: "Over Due",
//             link: "/marketing/over-due-message",
//             icon: <RiMoneyRupeeCircleLine size={28} />,
//           },
//         ],
//       },
//       {
//         key: "#main-6",
//         title: "Auction Message",
//         icon: <FaWhatsapp size={20} />,
//         subMenus: [
//           {
//         key: "#5",
//         title: "Auction Intimation Message",
//         link: "/marketing/auction-intimation-message",
//         icon: <RiMoneyRupeeCircleLine size={28} />,
//       },

//       {
//         key: "#12",
//         title: "Bid Winner",
//         link: "/marketing/bid-winner",
//         icon: <RiMoneyRupeeCircleLine size={28} />,
//       },
//         ],
//       },
//       {
//         key: "#main-5",
//         title: "Promo",
//         icon: <FaWhatsapp size={20} />,
//         subMenus: [
//           {
//         key: "#11",
//         title: "Promo",
//         link: "/marketing/what-promo",
//         icon: <FaWhatsapp size={20} />,
//       },
//           {
//         key: "#11",
//         title: "Customer promo",
//         link: "/marketing/what-customer-promo",
//         icon: <FaWhatsapp size={20} />,
//       },
//         ],
//       },
//     ],
//   },
//   {
//     key: "#main-2",
//     title: "Email Marketing",
//     icon: <MdEmail size={20} />,
//     subMenus: [
//       {
//         key: "#7",
//         title: " Due Email ",
//         link: "/marketing/due-email",
//         icon: <RiMoneyRupeeCircleLine size={20} />,
//       },
//       {
//         key: "#8",
//         title: "Over Due Email",
//         link: "/marketing/over-due-email",
//         icon: <RiMoneyRupeeCircleLine size={20} />,
//       },
//     ],
//   },
//   {
//     key: "#main-3",
//     title: "SMS Marketing",
//     icon: <LiaSmsSolid size={20} />,
//     subMenus: [
//       {
//         key: "#9",
//         title: " Due SMS Message ",
//         link: "/marketing/due-sms",
//         icon: <RiMoneyRupeeCircleLine size={20} />,
//       },
//       {
//         key: "#10",
//         title: "Over Due SMS Message",
//         link: "/marketing/over-due-sms",
//         icon: <RiMoneyRupeeCircleLine size={28} />,
//       },
//     ],
//   },
// ];

// const Marketing = () => {
//   const [openMenuIndex, setOpenMenuIndex] = useState(null);

//   const toggleMenu = (index) => {
//     setOpenMenuIndex((prevIndex) => (prevIndex === index ? null : index));
//   };

//   return (
//     <div className="w-screen flex mt-20">
//       <Sidebar />
//       <div className="flex min-h-screen">
//         <div className="w-[300px] bg-gray-50 min-h-screen p-4 space-y-4">
//           {mainMenus.map((menu, index) => {
//             const isOpen = openMenuIndex === index;
//             return (
//               <Fragment key={menu.key}>
//                 <div
//                   onClick={() => toggleMenu(index)}
//                   className="flex items-center gap-3 text-lg font-semibold text-blue-900 px-2 py-2 cursor-pointer hover:opacity-80 rounded-md transition"
//                 >
//                   {menu.icon}
//                   {menu.title}
//                   {menu.subMenus && (
//                     <span className="ml-auto">
//                       {isOpen ? (
//                         <AiOutlineMinus className="text-sm" />
//                       ) : (
//                         <AiOutlinePlus className="text-sm" />
//                       )}
//                     </span>
//                   )}
//                 </div>

//                 {/* Submenus */}
//                 {isOpen && menu.subMenus && (
//                   <ul className="ml-5 mt-2 space-y-1">
//                     {menu.subMenus.map((submenu) => (
//                       <li key={submenu.key}>
//                         <NavLink
//                           to={submenu.link}
//                           target={submenu.newTab ? "_blank" : "_self"}
//                           className={({ isActive }) =>
//                             `flex items-center gap-3 p-2 rounded-md transition font-medium ${
//                               submenu.red ? "text-red-700" : "text-blue-950"
//                             } ${
//                               isActive
//                                 ? "bg-blue-100 border-l-4 border-blue-400"
//                                 : "hover:bg-gray-200"
//                             }`
//                           }
//                         >
//                           {submenu.icon}
//                           {submenu.title}
//                         </NavLink>
//                       </li>
//                     ))}
//                   </ul>
//                 )}
//               </Fragment>
//             );
//           })}
//         </div>

//         <div className="flex-1 bg-white p-6">
//           <Outlet />
//         </div>
//       </div>
//     </div>
//   );
// };
// const mainMenus = [
//   {
//     key: "#main-1",
//     title: "Whatsapp Marketing",
//     icon: <FaWhatsapp size={20} />,
//     subMenus: [
//       {
//         key: "#1",
//         title: "Login",
//         link: "https://app.interakt.ai/login",
//         icon: <FaWhatsapp size={20} />,
//         newTab: true,
//       },
//       {
//         key: "#main-4",
//         title: "Due Message",
//         icon: <FaWhatsapp size={20} />,
//         subMenus: [
//           {
//             key: "#4",
//             title: "Due",
//             link: "/marketing/due-message",
//             icon: <RiMoneyRupeeCircleLine size={22} />,
//           },
//           {
//             key: "#6",
//             title: "Overdue",
//             link: "/marketing/over-due-message",
//             icon: <RiMoneyRupeeCircleLine size={22} />,
//           },
//           ,
         
          
//         ],
//       },
//        {
//         key: "#main-7",
//         title: "Lead Whatsapp Message",
//         icon: <FaWhatsapp size={20} />,
//         subMenus: [
//           {
//             key: "#20",
//             title: "Welcome Message",
//             link: "/marketing/lead-welcome-message",
//             icon: <RiMoneyRupeeCircleLine size={22} />,
//           },
//           {
//             key: "#21",
//             title: "ReferredBy Message",
//             link: "/marketing/lead-referredby-message",
//             icon: <RiMoneyRupeeCircleLine size={22} />,
//           },
//           ,
         
          
//         ],
//       },
//        {
//         key: "#main-8",
//         title: "Customer Whatsapp Message",
//         icon: <FaWhatsapp size={20} />,
//         subMenus: [
//           {
//             key: "#20",
//             title: "Welcome Message",
//             link: "/marketing/customer-welcome-message",
//             icon: <RiMoneyRupeeCircleLine size={22} />,
//           },
//           {
//             key: "#21",
//             title: "ChitPlan Message",
//             link: "/marketing/customer-chitplan-message",
//             icon: <RiMoneyRupeeCircleLine size={22} />,
//           },
//           ,
         
          
//         ],
//       },
//       {
//         key: "#main-6",
//         title: "Auction Message",
//         icon: <FaWhatsapp size={20} />,
//         subMenus: [
//           {
//             key: "#5",
//             title: "Auction Intimation Message",
//             link: "/marketing/auction-intimation-message",
//             icon: <RiMoneyRupeeCircleLine size={22} />,
//           },
//           {
//             key: "#12",
//             title: "Bid Winner",
//             link: "/marketing/bid-winner",
//             icon: <RiMoneyRupeeCircleLine size={22} />,
//           },
//           {
//             key: "#18",
//             title: "Auction Bid status",
//             link: "/marketing/bid-status",
//             icon: <RiMoneyRupeeCircleLine size={22} />,
//           },
//           {
//             key: "#19",
//             title: "Bid Winner Document List",
//             link: "/marketing/winner-document",
//             icon: <RiMoneyRupeeCircleLine size={22} />,
//           },
//           {
//             key: "#20",
//             title: "Auction information",
//             link: "/marketing/auction-info",
//             icon: <RiMoneyRupeeCircleLine size={22} />,
//           },
//           {
//             key: "#21",
//             title: "Auction Terms and Condition",
//             link: "/marketing/auction-terms-condition",
//             icon: <RiMoneyRupeeCircleLine size={22} />,
//           },

//         ],
//       },
//       {
//         key: "#main-5",
//         title: "Promotion",
//         icon: <FaWhatsapp size={20} />,
//         subMenus: [
//           {
//             key: "#11",
//             title: "Promo",
//             link: "/marketing/what-promo",
//             icon: <FaWhatsapp size={20} />,
//           },
//           // {
//           //   key: "#11",
//           //   title: "Customer Promo",
//           //   link: "/marketing/what-customer-promo",
//           //   icon: <FaWhatsapp size={20} />,
//           //   Example of sub-submenu
//           //   subMenus: [
//           //     {
//           //       key: "#11-1",
//           //       title: "Special Promo",
//           //       link: "/marketing/special-promo",
//           //       icon: <FaWhatsapp size={18} />,
//           //     },
//           //     {
//           //       key: "#11-2",
//           //       title: "Festival Promo",
//           //       link: "/marketing/festival-promo",
//           //       icon: <FaWhatsapp size={18} />,
//           //     },
//           //   ],
//           // },
//         ],
//       },
//     ],
//   },
//   {
//     key: "#main-2",
//     title: "Email Marketing",
//     icon: <MdEmail size={20} />,
//     subMenus: [
//       {
//         key: "#main-10",
//         title: "Due Email",
//         icon: <MdEmail size={20} />,
//         subMenus: [
//           {
//             key: "#15",
//             title: "Due",
//             link: "/marketing/due-email",
//             icon: <RiMoneyRupeeCircleLine size={22} />,
//           },
//           {
//             key: "#16",
//             title: "Overdue",
//             link: "/marketing/over-due-email",
//             icon: <RiMoneyRupeeCircleLine size={22} />,
//           },
//         ],
//       },
      
//     ],
//   },
  
//   {
//     key: "#main-3",
//     title: "Payment Links",
//     icon: <RiMoneyRupeeCircleLine size={20} />,
//     subMenus: [
//        {
//             key: "#7",
//             title: "Payment Link",
//             link: "/marketing/payment-link",
//             icon: <RiMoneyRupeeCircleLine size={22} />,
//           },
      
//     ],
//   },
// ];

// const Marketing = () => {
//   const [openMenu, setOpenMenu] = useState({});

//   const toggleMenu = (menuKey) => {
//     setOpenMenu((prev) => ({
//       ...prev,
//       [menuKey]: !prev[menuKey],
//     }));
//   };

//   // ✅ Recursive menu rendering function
//   const renderMenu = (menus, level = 0) => {
//     return (
//       <ul className={level > 0 ? "ml-5 mt-2 space-y-1" : ""}>
//         {menus.map((menu) => {
//           const hasSubMenu = menu.subMenus && menu.subMenus.length > 0;
//           const isOpen = openMenu[menu.key];

//           return (
//             <Fragment key={menu.key}>
//               <li>
//                 {menu.link ? (
//                   <NavLink
//                     to={menu.link}
//                     target={menu.newTab ? "_blank" : "_self"}
//                     className={({ isActive }) =>
//                       `flex items-center gap-3 p-2 rounded-md transition font-medium cursor-pointer 
//                       ${isActive ? "bg-blue-500 text-white" : "hover:bg-gray-200 text-blue-950"}`
//                     }
//                   >
//                     {menu.icon}
//                     <span>{menu.title}</span>
//                   </NavLink>
//                 ) : (
//                   <div
//                     onClick={() => hasSubMenu && toggleMenu(menu.key)}
//                     className={`flex items-center gap-3 p-2 rounded-md transition font-medium cursor-pointer 
//                     ${isOpen ? "bg-gray-100 text-blue-950" : "hover:bg-gray-200 text-blue-950"}`}
//                   >
//                     {menu.icon}
//                     <span>{menu.title}</span>
//                     {hasSubMenu && (
//                       <span className="ml-auto">
//                         {isOpen ? <AiOutlineMinus /> : <AiOutlinePlus />}
//                       </span>
//                     )}
//                   </div>
//                 )}

//                 {hasSubMenu && isOpen && renderMenu(menu.subMenus, level + 1)}
//               </li>
//             </Fragment>
//           );
//         })}
//       </ul>
//     );
//   };

//   return (
//     <div className="w-screen flex mt-20">
//       <Sidebar />
//       <div className="flex min-h-screen">
//         <div className="w-[300px] bg-gray-50 min-h-screen p-4 space-y-4">
//           {renderMenu(mainMenus)}
//         </div>

//         <div className="flex-1 bg-white p-6">
//           <Outlet />
//         </div>
//       </div>
//     </div>
//   );
// };



// import React, { useState, useEffect } from "react";
// import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  FaWhatsapp,
  FaChevronDown,
  FaChevronRight,
  FaExternalLinkAlt,
  FaSpinner
} from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { RiMoneyRupeeCircleLine } from "react-icons/ri";
// import Sidebar from "./Sidebar";

const mainMenus = [
  {
    key: "whatsapp",
    title: "Whatsapp Marketing",
    icon: <FaWhatsapp size={20} />,
    color: "#25D366",
    subMenus: [
      {
        title: "Login",
        link: "https://app.interakt.ai/login",
        newTab: true,
        description: "Access your Interakt dashboard"
      },
      {
        title: "Due Message",
        subMenus: [
          { 
            title: "Due", 
            link: "/marketing/due-message",
            description: "Send due payment reminders"
          },
          { 
            title: "Overdue", 
            link: "/marketing/over-due-message",
            description: "Notify about overdue payments"
          },
        ],
      },
      {
        title: "Lead Whatsapp Message",
        subMenus: [
          { 
            title: "Welcome Message", 
            link: "/marketing/lead-welcome-message",
            description: "Send welcome messages to new leads"
          },
          { 
            title: "ReferredBy Message", 
            link: "/marketing/lead-referredby-message",
            description: "Notify leads about referrals"
          },
        ],
      },
      {
        title: "Customer Whatsapp Message",
        subMenus: [
          { 
            title: "Welcome Message", 
            link: "/marketing/customer-welcome-message",
            description: "Welcome new customers"
          },
          { 
            title: "ChitPlan Message", 
            link: "/marketing/customer-chitplan-message",
            description: "Send chit plan information"
          },
        ],
      },
      {
        title: "Auction Message",
        subMenus: [
          { 
            title: "Auction Intimation", 
            link: "/marketing/auction-intimation-message",
            description: "Notify about upcoming auctions"
          },
          { 
            title: "Bid Winner", 
            link: "/marketing/bid-winner",
            description: "Notify auction winners"
          },
          { 
            title: "Bid Status", 
            link: "/marketing/bid-status",
            description: "Update bid status"
          },
          { 
            title: "Winner Documents", 
            link: "/marketing/winner-document",
            description: "Request documents from winners"
          },
          { 
            title: "Auction Info", 
            link: "/marketing/auction-info",
            description: "Provide auction details"
          },
          { 
            title: "Terms & Conditions", 
            link: "/marketing/auction-terms-condition",
            description: "Share auction terms"
          },
        ],
      },
      {
        title: "Promotion",
        subMenus: [
          { 
            title: "Promo", 
            link: "/marketing/what-promo",
            description: "Send promotional messages"
          },
        ],
      },
    ],
  },
  {
    key: "email",
    title: "Email Marketing",
    icon: <MdEmail size={20} />,
    color: "#EA4335",
    subMenus: [
      {
        title: "Due Email",
        subMenus: [
          { 
            title: "Due", 
            link: "/marketing/due-email",
            description: "Send due payment emails"
          },
          { 
            title: "Overdue", 
            link: "/marketing/over-due-email",
            description: "Send overdue payment emails"
          },
        ],
      },
    ],
  },
  {
    key: "payment",
    title: "Payment Links",
    icon: <RiMoneyRupeeCircleLine size={20} />,
    color: "#00C853",
    subMenus: [
      { 
        title: "Payment Link", 
        link: "/marketing/payment-link",
        description: "Generate payment links"
      },
    ],
  },
];

const Marketing = () => {
  const [activeMenu, setActiveMenu] = useState(mainMenus[0]);
  const [openSection, setOpenSection] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  // Set initial active menu based on current path
  useEffect(() => {
    const currentPath = location.pathname;
    const matchedMenu = mainMenus.find(menu => {
      return menu.subMenus.some(section => {
        if (section.link === currentPath) return true;
        if (section.subMenus) {
          return section.subMenus.some(subItem => subItem.link === currentPath);
        }
        return false;
      });
    });
    
    if (matchedMenu) {
      setActiveMenu(matchedMenu);
    }
  }, [location.pathname]);

  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
    setOpenSection(null);
    setIsLoading(true);
    // Simulate loading
    setTimeout(() => setIsLoading(false), 300);
  };

  const handleSectionToggle = (index) => {
    setOpenSection(openSection === index ? null : index);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex flex-1 flex-col md:flex-row">
        {/* LEFT – MAIN MENU */}
        <div className="w-full md:w-64 bg-white border-r border-gray-200 shadow-sm p-4 mt-16 ">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 mr-10 mt-10">Marketing Tools</h2>
          <nav className="space-y-1">
            {mainMenus.map((menu) => (
              <div
                key={menu.key}
                onClick={() => handleMenuClick(menu)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  activeMenu.key === menu.key
                    ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm border-l-4 border-blue-500"
                    : "hover:bg-gray-50 text-gray-700 hover:text-gray-900"
                }`}
                style={{
                  borderLeftColor: activeMenu.key === menu.key ? menu.color : undefined
                }}
              >
                <div 
                  className={`p-2 rounded-md ${
                    activeMenu.key === menu.key ? "bg-white shadow-sm" : "bg-gray-100"
                  }`}
                  style={{ color: activeMenu.key === menu.key ? menu.color : undefined }}
                >
                  {menu.icon}
                </div>
                <span className="font-medium">{menu.title}</span>
              </div>
            ))}
          </nav>
        </div>

        {/* RIGHT – SUB MENU */}
        <div className="flex-1 p-4 md:p-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-center justify-between mb-6 mt-16">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <div 
                  className="p-2 rounded-lg "
                  style={{ backgroundColor: `${activeMenu.color}20`, color: activeMenu.color }}
                >
                  {activeMenu.icon}
                </div>
                {activeMenu.title}
              </h2>
              {isLoading && <FaSpinner className="animate-spin text-blue-500" />}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeMenu.subMenus.map((section, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md"
                >
                  <div
                    onClick={() => section.subMenus && handleSectionToggle(index)}
                    className={`p-4 bg-gradient-to-r from-gray-50 to-white cursor-pointer ${
                      section.subMenus ? "hover:from-gray-100 hover:to-gray-50" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-800">{section.title}</h3>
                      {section.subMenus && (
                        <span className="text-gray-500 transition-transform duration-200">
                          {openSection === index ? <FaChevronDown /> : <FaChevronRight />}
                        </span>
                      )}
                    </div>
                    {section.description && (
                      <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                    )}
                  </div>

                  {/* 3RD LEVEL */}
                  {openSection === index && section.subMenus && (
                    <div className="p-2 bg-gray-50 border-t border-gray-200">
                      <ul className="space-y-1">
                        {section.subMenus.map((item, idx) => (
                          <li key={idx}>
                            <NavLink
                              to={item.link}
                              target={item.newTab ? "_blank" : "_self"}
                              className={({ isActive }) => 
                                `flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                                  isActive 
                                    ? "bg-blue-50 text-blue-700 font-medium" 
                                    : "hover:bg-white text-gray-700"
                                }`
                              }
                            >
                              <span>{item.title}</span>
                              {item.newTab && <FaExternalLinkAlt className="text-xs text-gray-400" />}
                            </NavLink>
                            {item.description && (
                              <p className="text-xs text-gray-500 px-3 pb-2">{item.description}</p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Direct Link */}
                  {section.link && (
                    <div className="p-2 bg-gray-50 border-t border-gray-200">
                      <NavLink
                        to={section.link}
                        target={section.newTab ? "_blank" : "_self"}
                        className={({ isActive }) => 
                          `flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                            isActive 
                              ? "bg-blue-50 text-blue-700 font-medium" 
                              : "hover:bg-white text-gray-700"
                          }`
                        }
                      >
                        <span>Open</span>
                        {section.newTab && <FaExternalLinkAlt className="text-xs text-gray-400" />}
                      </NavLink>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};






export default Marketing;
