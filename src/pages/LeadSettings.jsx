import { useEffect, useState } from "react";
import { Card } from "antd";
import { useNavigate } from "react-router-dom";
import { BsPersonCheck } from "react-icons/bs";
import { IoPeopleOutline } from "react-icons/io5";
import { RiAdminLine } from "react-icons/ri";
import { MdAppSettingsAlt } from "react-icons/md";
import { GoGraph } from "react-icons/go";
import { GrConfigure } from "react-icons/gr";

const data = [
  {
    title: "Designation",
    color: "bg-blue-200",
    path: "/designation",
    icon: <IoPeopleOutline size={35} />,
    iconColor: "bg-blue-700",
  },
  {
    title: "Administrative Privileges",
    color: "bg-red-200",
    path: "/administrative-privileges",
    icon: <RiAdminLine size={35} />,
    iconColor: "bg-red-700",
  },
  {
    title: "Admin Access Rights",
    color: "bg-purple-200",
    path: "/admin-access-rights",
    icon: <BsPersonCheck size={35} />,
    iconColor: "bg-purple-700",
  },
  {
    title: "Mobile Access",
    color: "bg-green-200",
    path: "app-settings/groups/mobile-access",
    icon: <MdAppSettingsAlt size={25} />,
    iconColor: "bg-green-700",
  },

    {
    title: "Penalty Settings",
    color: "bg-orange-200",
    path: "/penalty-settings",
    icon: <GrConfigure size={25} />,
    iconColor: "bg-orange-700",
  },
  // {
  //   title: "Agent Targets",
  //   color: "bg-orange-200",
  //   path: "/target",
  //   icon: <GoGraph size={35} />,
  //   iconColor: "bg-orange-700",
  // },
];

const LeadSettings = () => {
  const navigate = useNavigate();
  const [onload, setOnload] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOnload(false);
    }, 200);

    return () => {
      clearTimeout(timer);
    };
  }, []);
  const [clickedIndex, setClickedIndex] = useState(null);
  const handleCardClick = (index, path) => {
    setClickedIndex(index);
    setTimeout(() => {
      navigate(path);
    }, 200);
  };
  return (
    <div className="flex-grow p-7">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {data.map((item, index) => (
          <div
            key={index}
            onClick={() => handleCardClick(index, item.path)}
            className={`
          relative cursor-pointer  rounded-3xl text-white
          transform transition-all duration-500 ease-in-out
          ${onload ? "-translate-y-56 opacity-0" : "translate-y-0 opacity-100"}
          ${item.color}
          ${
            clickedIndex === index
              ? "scale-95 brightness-110"
              : "hover:scale-105"
          }
        `}
            style={{
              transitionDelay: `${index * 100}ms`,
            }}
          >
            <div className="bg-transparent w-full h-full shadow-none">
              <div className="flex items-center justify-start p-4">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center ${item.iconColor} text-white mr-4`}
                >
                  {item.icon}
                </div>
                <p className="text-lg font-semibold text-black">{item.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeadSettings;
