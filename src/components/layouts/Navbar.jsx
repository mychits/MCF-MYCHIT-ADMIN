import { IoIosLogOut } from "react-icons/io";
import { MdMenu, MdVerifiedUser } from "react-icons/md";
import { IoIosNotifications } from "react-icons/io";
import { Link } from "react-router-dom";
import { useEffect, useState, useRef, useCallback } from "react";
import { NavbarMenu } from "../../data/menu";
import ResponsiveMenu from "./ResponsiveMenu";
import Modal from "../modals/Modal";
import { AiTwotoneGold } from "react-icons/ai";
import { NavLink } from "react-router-dom";
import GlobalSearchBar from "../search/GlobalSearchBar";
import { CgProfile } from "react-icons/cg";
import { Button, Input } from "antd";
import { RiSettings3Line } from "react-icons/ri";
import { FiUser } from "react-icons/fi";
import { CheckCircle } from "lucide-react";
import API from "../../instance/TokenInstance";
// Icons added for the Notification redesign
import { FiUsers, FiSmartphone, FiCreditCard, FiArrowRight } from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";
import { GiReceiveMoney } from "react-icons/gi";

const Navbar = ({
  onGlobalSearchChangeHandler = () => { },
  visibility = false,
}) => {
  const [adminName, setAdminName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [onload, setOnload] = useState(true);
  const [showProfileCard, setShowProfileCard] = useState(false);

  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  // --- AUTO LOGOUT STATE ---
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [countdown, setCountdown] = useState(10);

  const [pendingApprovals, setPendingApprovals] = useState();

  useEffect(() => {
    const fetchPendingApprovals = async () => {
      try {
        const response = await API.get("/approvals/count");
        setPendingApprovals(response?.data);
      } catch (error) {
        console.error("Error fetching pending approvals", error);
      }
    };

    fetchPendingApprovals();
  }, []);

  console.log("pending approvals", pendingApprovals?.data);

  const getPendingCount = (categoryId) => {
    if (!pendingApprovals?.data) return 0;

    switch (categoryId) {
      case 1:
        return pendingApprovals.data.unapproved_users;
      case 2:
        return pendingApprovals.data.unapproved_enrollments;
      case 3:
        return pendingApprovals.data.unapproved_loans;
      default:
        return 0;
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setOnload(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const usr = localStorage.getItem("user");
        if (usr) {
          const admin = JSON.parse(usr);
          setAdminName(admin?.admin_name || "Super Admin");

          if (admin.admin_access_right_id && typeof admin.admin_access_right_id === 'object') {
            setRoleTitle(admin.admin_access_right_id.title);
          }
          else if (admin._id) {
            try {
              const response = await API.get("/admin/me");
              const fullUserData = response.data?.data || response.data;

              if (fullUserData?.admin_access_right_id?.title) {
                setRoleTitle(fullUserData.admin_access_right_id.title);
              } else {
                setRoleTitle("Admin");
              }
            } catch (apiError) {
              console.error("Failed to fetch role details:", apiError);
              setRoleTitle("Admin");
            }
          } else {
            setRoleTitle("Admin");
          }
        }
      } catch (e) {
        console.error("Failed to parse user from localStorage:", e);
        setRoleTitle("Admin");
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileCard(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileRef, notificationRef]);

  const [open, setOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  // --- ROBUST AUTO LOGOUT LOGIC (FIXED) ---
  useEffect(() => {
    const AUTO_LOGOUT_TIME = 2 * 60 * 1000;  // 1 hour
    const WARNING_TIME = 1 * 60 * 1000;      // 10 minutes
    const WARNING_START_TIME = AUTO_LOGOUT_TIME - WARNING_TIME; // 50 min

    let inactivityTimer = null;
    let countdownInterval = null;

    const performLogout = () => {
      clearTimeout(inactivityTimer);
      clearInterval(countdownInterval);
      localStorage.clear();
      window.location.href = "/";
    };

    const startCountdown = () => {
      setShowWarningModal(true);
      setCountdown(Math.floor(WARNING_TIME / 1000));

      countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            performLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    const startInactivityTimer = () => {
      inactivityTimer = setTimeout(() => {
        startCountdown();
      }, WARNING_START_TIME);
    };

    const resetTimers = () => {
      // ❗ Don't reset while popup is open
      if (showWarningModal) return;

      clearTimeout(inactivityTimer);
      startInactivityTimer();
    };

    // Continue Session handler
    const continueSession = () => {
      clearInterval(countdownInterval);
      setShowWarningModal(false);
      startInactivityTimer(); // restart 1 hour
    };

    // Attach to window so button can access
    window.continueSession = continueSession;

    const events = ["mousemove", "keydown", "scroll"];
    events.forEach((event) =>
      window.addEventListener(event, resetTimers)
    );

    startInactivityTimer();

    return () => {
      clearTimeout(inactivityTimer);
      clearInterval(countdownInterval);
      events.forEach((event) =>
        window.removeEventListener(event, resetTimers)
      );
    };
  }, []); // Empty Dependency Array ensures this runs ONLY ONCE

  // --- END AUTO LOGOUT LOGIC ---

  const quickApprovals = [
    {
      title: "Payment Link Transactions",
      href: "/payment-link-transactions",
      color: "text-green-600",
      icon: <FiCreditCard className="text-lg" />,
    },
    {
      title: "Unverified Customers",
      href: "/approval-menu/un-approved-customer",
      color: "text-blue-600",
      count: getPendingCount(1),
      icon: <FiUsers className="text-lg" />,
    },
    {
      title: "Mobile Enrollments",
      href: "/approval-menu/mobile-app-enroll",
      color: "text-amber-600",
      count: getPendingCount(2),
      icon: <FiSmartphone className="text-lg" />,
    },
    {
      title: "Unapproved Loans",
      href: "/approval-menu/un-approved-loans",
      color: "text-red-600",
      count: getPendingCount(3),
      icon: <GiReceiveMoney className="text-lg" />,
    },
  ];

  const [taskCount, setTaskCount] = useState(0);
  useEffect(() => {
    const fetchMyTaskCount = async () => {
      try {
        const userStr = localStorage.getItem("user");
        if (!userStr) return;
        const user = JSON.parse(userStr);
        const myId = user._id;

        const res = await API.get("/complaints/all");
        const complaints = res.data?.data || [];

        const myPendingTickets = complaints.filter((item) => {
          if (!item.assignedTo) return false;

          let assignedId = null;
          if (typeof item.assignedTo === "object" && item.assignedTo._id) {
            assignedId = item.assignedTo._id;
          } else if (typeof item.assignedTo === "string") {
            assignedId = item.assignedTo;
          }

          const isAssignedToMe = String(assignedId) === String(myId);
          const isPending = item.status !== "Closed";

          return isAssignedToMe && isPending;
        });

        setTaskCount(myPendingTickets.length);
      } catch (error) {
        console.error("Error fetching task count", error);
      }
    };

    fetchMyTaskCount();
  }, []);

  return (
    <>
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-down {
          animation: slideDown 0.2s ease-out;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>

      <nav className="w-full fixed top-0 left-0 z-50 bg-white shadow-md">
        <div
          className={`
    flex justify-between items-center py-2 px-10
    transition-all duration-700 ease-out transform
    ${onload ? "opacity-0 -translate-y-5" : "opacity-100 translate-y-0"}
  `}
        >
          <div className="text-2xl flex items-center gap-2 font-bold py-4 uppercase">
            <AiTwotoneGold />
            <p>MyChits</p>
            <p className="text-primary">Chit</p>
          </div>
          <div>
            <GlobalSearchBar
              onGlobalSearchChangeHandler={onGlobalSearchChangeHandler}
              visibility={visibility}
            />
          </div>

          <NavLink
            className={({ isActive }) =>
              isActive ? "text-white font-bold " : "text-white font-medium "
            }
            to={"/reports/group-report"}
          >
            {({ isActive }) => (
              <Button
                className={` pl-5  pr-4 py-2  w-30 h-12 rounded-full  focus:rounded-full px-4  border ${isActive
                  ? "bg-blue-200 text-blue-900 font-bold"
                  : "font-semibold"
                  }  `}
              >
                Group Report
              </Button>
            )}
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              isActive ? "text-white font-bold" : "text-white font-medium "
            }
            to={"/reports/daybook"}
          >
            {({ isActive }) => (
              <Button
                className={` pl-5  pr-4 py-2  w-30 h-12 rounded-full  focus:rounded-full px-4  border ${isActive
                  ? "bg-blue-200 text-blue-900 font-bold"
                  : "font-semibold"
                  }  `}
              >
                Day Book
              </Button>
            )}
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              isActive ? "text-white font-bold " : "text-white font-medium "
            }
            to={"/reports"}
          >
            {({ isActive }) => (
              <Button
                className={` pl-5  pr-4 py-2  w-30 h-12 rounded-full  focus:rounded-full px-4  border ${isActive
                  ? "bg-blue-200 text-blue-900 font-bold"
                  : "font-semibold"
                  }  `}
              >
                Reports
              </Button>
            )}
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              isActive ? "text-white font-bold" : "text-white font-medium "
            }
            to={"/reports/receipt"}
          >
            {({ isActive }) => (
              <Button
                className={` pl-5  pr-4 py-2  w-30 h-12 rounded-full  focus:rounded-full px-4  border ${isActive
                  ? "bg-blue-200 text-blue-900 font-bold"
                  : "font-semibold"
                  }  `}
              >
                Receipt Report
              </Button>
            )}
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              isActive ? "text-white font-bold" : "text-white font-medium"
            }
            to={"/reports/user-report"}
          >
            {({ isActive }) => (
              <Button
                className={` pl-5  pr-4 py-2  w-30 h-12 rounded-full  focus:rounded-full px-4  border ${isActive
                  ? "bg-blue-200 text-blue-900 font-bold"
                  : "font-semibold"
                  }  `}
              >
                Customer Report
              </Button>
            )}
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              isActive ? "text-white font-bold" : "text-white font-medium"
            }
            to={"/reports/employee-report"}
          >
            {({ isActive }) => (
              <Button
                className={` pl-5  pr-4 py-2  w-30 h-12 rounded-full  focus:rounded-full px-4 border ${isActive
                  ? "bg-blue-200 text-blue-900 font-bold"
                  : "font-semibold"
                  }  `}
              >
                Employee Report
              </Button>
            )}
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              isActive ? "text-white font-bold" : "text-white font-medium"
            }
            to={"/reports/lead-report"}
          >
            {({ isActive }) => (
              <Button
                className={` pl-5  pr-4 py-2  w-30 h-12 rounded-full  focus:rounded-full px-4 border ${isActive
                  ? "bg-blue-200 text-blue-900 font-bold"
                  : "font-semibold"
                  }  `}
              >
                Lead Report
              </Button>
            )}
          </NavLink>

          <NavLink to={"/my-tasks"}>
            {({ isActive }) => (
              <Button
                className={`pl-5  pr-4 py-2  w-30 h-12 rounded-full  focus:rounded-full px-4 border ${isActive
                  ? "bg-blue-200 text-blue-900 font-bold"
                  : "font-semibold"
                  }`}
              >
                My Tickets
                {taskCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white shadow-sm">
                    {taskCount > 9 ? "9+" : taskCount}
                  </span>
                )}
              </Button>
            )}
          </NavLink>

          <div className="flex items-center gap-4">

            {/* --- REDESIGNED NOTIFICATION BLOCK ONLY --- */}
            <div className="relative" ref={notificationRef}>
              {/* Bell Trigger */}
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${showNotifications
                  ? "bg-slate-100 text-blue-600"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
              >
                <IoIosNotifications className="text-2xl" />

                {/* Professional Floating Badge */}
                {(getPendingCount(1) + getPendingCount(2) + getPendingCount(3)) > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] px-1.5 items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full border-[2.5px] border-white shadow-sm ring-1 ring-black/5">
                    {getPendingCount(1) + getPendingCount(2) + getPendingCount(3)}
                  </span>
                )}
              </button>

              {/* Dropdown Panel */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.12)] border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">

                  {/* Header */}
                  <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Pending Actions</h3>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {getPendingCount(1) + getPendingCount(2) + getPendingCount(3)} TOTAL
                    </span>
                  </div>

                  {/* Body List */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                    {quickApprovals.map((item, index) => (
                      <Link
                        key={index}
                        to={item.href}
                        onClick={() => setShowNotifications(false)}
                        className="group flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors"
                      >
                        {/* Minimal Icon Container */}
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg bg-slate-50 group-hover:bg-white border border-transparent group-hover:border-slate-200 transition-all ${item.color}`}>
                          {item.icon}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 truncate transition-colors">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium">
                            {item.count > 0 ? `${item.count} items to review` : "No pending items"}
                          </p>
                        </div>

                        {/* Subtle Action Arrow */}
                        <div className="text-slate-300 group-hover:text-blue-500 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </Link>
                    ))}
                  </div>


                </div>
              )}
            </div>
            {/* --- END REDESIGNED NOTIFICATION BLOCK --- */}


            {/* PROFILE BLOCK (UNCHANGED) */}
            <div className="relative" ref={profileRef}>
              {/* Trigger Button */}
              <button
                onClick={() => setShowProfileCard(!showProfileCard)}
                className={`group relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 focus:outline-none ${showProfileCard ? "ring-4 ring-blue-700/20 rotate-12 scale-110" : "hover:ring-4 hover:ring-blue-50 hover:scale-105"
                  }`}
              >
                <div className={`absolute inset-0 rounded-full transition-all duration-500 ${showProfileCard ? "bg-blue-700 shadow-lg shadow-blue-200" : "bg-white border border-gray-200 shadow-sm"
                  }`} />
                <CgProfile className={`relative z-10 text-2xl transition-colors duration-300 ${showProfileCard ? "text-white" : "text-blue-700"}`} />
              </button>

              {showProfileCard && (
                <div className="absolute right-0 mt-6 w-[320px] bg-white rounded-[24px] shadow-[0_20px_50px_rgba(29,78,216,0.15)] border border-blue-50 overflow-hidden z-50 animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-300 origin-top-right">
                  <div className="h-24 bg-gradient-to-br from-blue-700 to-blue-500 opacity-10 absolute w-full"></div>

                  <div className="relative flex flex-col items-center pt-10 pb-6 px-6">
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-blue-700 rounded-full blur opacity-20"></div>
                      <div className="relative w-24 h-24 rounded-full bg-white p-1.5 shadow-xl">
                        <div className="w-full h-full rounded-full bg-blue-50 flex items-center justify-center overflow-hidden border border-blue-100">
                          <CgProfile className="text-5xl text-blue-700" />
                        </div>
                      </div>

                      {/* --- Instagram Verified Badge --- */}
                      <div className="absolute bottom-1 right-1 drop-shadow-md">
                        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-blue-500 animate-in zoom-in duration-500 delay-200">
                          <path d="M22.5 12.5c0-1.58-.8-2.47-1.3-3.07a3 3 0 0 1-.82-2.31c0-1.61-.43-2.5-1.09-3.11s-1.5-.92-3.11-.92a3 3 0 0 1-2.31-.82c-.6-.5-1.49-1.3-3.07-1.3s-2.47.8-3.07 1.3a3 3 0 0 1-2.31.82c-1.61 0-2.5.43-3.11 1.09S1.4 5.78 1.4 7.39a3 3 0 0 1-.82 2.31c-.5.6-1.3 1.49-1.3 3.07s.8 2.47 1.3 3.07a3 3 0 0 1 .82 2.31c0 1.61.43 2.5 1.09 3.11s1.5.92 3.11.92a3 3 0 0 1 2.31.82c.6.5 1.49 1.3 3.07 1.3s2.47-.8 3.07-1.3a3 3 0 0 1 2.31-.82c1.61 0 2.5-.43 3.11-1.09s.92-1.5.92-3.11a3 3 0 0 1 .82-2.31c.5-.6 1.3-1.49 1.3-3.07z" />
                          <path fill="white" d="M10.7 16l-3.3-3.3 1.4-1.4 1.9 1.9 5.3-5.3 1.4 1.4z" />
                        </svg>
                      </div>
                    </div>

                    <div className="mt-5 text-center">
                      <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center justify-center gap-1">
                        {adminName}
                      </h3>
                      <p className="text-sm font-bold text-blue-700/70 mt-1 uppercase tracking-widest">{roleTitle}</p>
                    </div>
                  </div>

                  <div className="px-8 py-4 space-y-1">
                    <div className="group flex items-center justify-between py-4 border-b border-blue-50 hover:bg-blue-50/30 transition-colors rounded-xl px-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status</span>
                      <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-600">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Online
                      </span>
                    </div>
                  </div>

                  <div className="p-6 pt-2">
                    <button onClick={handleLogout} className="group w-full flex items-center justify-center gap-3 py-4 bg-blue-700 hover:bg-blue-800 text-white rounded-2xl transition-all duration-300 shadow-xl shadow-blue-100 active:scale-95">
                      <IoIosLogOut className="text-xl transition-transform duration-300 group-hover:-translate-x-1" />
                      <span className="text-sm font-black uppercase tracking-widest">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="md:hidden" onClick={() => setOpen(!open)}>
            <MdMenu className="text-4xl" />
          </div>
        </div>
      </nav>
      <ResponsiveMenu open={open} menu={NavbarMenu} />

      {/* --- AUTO LOGOUT WARNING POPUP --- */}
      {showWarningModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all animate-in zoom-in-95 duration-200 border border-blue-50 text-center">

            {/* Warning Icon */}
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4 mx-auto animate-bounce">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>

            <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Session Expiring</h2>
            <p className="text-slate-500 mb-6">
              You have been inactive for a while. You will be logged out in
              <span className="font-bold text-amber-600 mx-1 text-xl">{countdown}</span> seconds.
            </p>

            <div className="flex gap-4 w-full">
              <button
                onClick={handleLogout}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
              >
                Logout Now
              </button>
              {/* 
                 Note: We don't need an explicit onClick handler here to reset the timer.
                 The 'click' event listener attached to 'window' inside the useEffect 
                 will automatically catch this click and reset the timer.
              */}
              <button
                onClick={() => window.continueSession()}
                className="flex-1 py-3 px-4 rounded-xl bg-blue-700 text-white font-bold shadow-lg shadow-blue-200 hover:bg-blue-800 transition-all hover:scale-105 active:scale-95"
              >
                Continue Session
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;