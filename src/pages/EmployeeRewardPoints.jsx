import { useState, useEffect } from 'react'
import api from '../instance/TokenInstance';
import Navbar from '../components/layouts/Navbar';
import DataTable from '../components/layouts/Datatable';
import Sidebar from '../components/layouts/Sidebar';
import CircularLoader from '../components/loaders/CircularLoader';
import SettingSidebar from '../components/layouts/SettingSidebar';
import { Search, Calendar, Award, TrendingUp,Star, Gift ,Trophy,Users} from 'lucide-react';

// const EmployeeRewardPoints = () => {
//   const [employees, setEmployees] = useState([]);
//   const [employeeId, setEmployeeId] = useState("");

//   const [rewardTable, setRewardTable] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);

//   /* ================= SUMMARY STATES ================= */
//   const [summary, setSummary] = useState({
//     reward_point_value: 0,
//     loan_reward_points: 0,
//     pigme_reward_points:0,
//     total_earned_amount: 0,
//     total_earned_reward: 0,
//     total_redeemed_amount: 0,
//     balance_amount: 0,
//     source_wise_amount: [],
//   });

//   /* ================= REDEEM STATES ================= */
//   const [redeemPoints, setRedeemPoints] = useState("");
//   const [redeemType, setRedeemType] = useState("Cash");
//   const [redeemAmount, setRedeemAmount] = useState(0);
//   const [redeemDesc, setRedeemDesc] = useState("");

//   /* ================= FETCH EMPLOYEES ================= */
//   useEffect(() => {
//     fetchEmployees();
//   }, []);

//   const fetchEmployees = async () => {
//     try {
//       const res = await api.get("/agent/get-employee");
//       setEmployees(res.data?.employee || []);
//     } catch {
//       console.error("Failed to fetch employees");
//     }
//   };

//   /* ================= FETCH SUMMARY ================= */
//   const fetchRewardSummary = async (empId) => {
//     try {
//       const res = await api.get(
//         `/reward-points/employee-reward-points/${empId}`
//       );

//       if (res.data?.success) {
//         setSummary(res.data);
//       }
//     } catch (err) {
//       console.error("Failed to fetch reward summary", err);
//     }
//   };

//   /* ================= FETCH REWARD LIST ================= */
//   // const fetchRewardPoints = async (empId) => {
//   //   if (!empId) return;

//   //   setIsLoading(true);
//   //   try {
//   //     const res = await api.get(`/reward-points/list/${empId}`);

//   //     const formatted = res.data?.data?.map((reward, index) => ({
//   //       _id: reward?._id,
//   //       slNo: index + 1,
//   //       userName: reward?.user_id?.full_name || "-",
//   //       userPhone: reward?.user_id?.phone_number || "-",
//   //       groupName: reward?.group_id?.group_name ||  "-",
//   //       groupValue: reward?.group_id?.group_value || "-",
//   //       ticket: reward?.ticket || "-",
//   //       sourceType: reward?.source_type || "-",
//   //       rewardPoints: reward?.reward_points || 0,
//   //       rewardAmount: reward?.rewarded_amount || 0,
//   //       status: reward?.status || "N/A",
//   //       remarks: reward?.remarks || "-",
//   //     }));

//   //     setRewardTable(formatted);
//   //   } catch (err) {
//   //     console.error("Failed to fetch reward list", err);
//   //   } finally {
//   //     setIsLoading(false);
//   //   }
//   // };
// const fetchRewardPoints = async (empId) => {
//   if (!empId) return;

//   setIsLoading(true);
//   try {
//     const res = await api.get(`/reward-points/list/${empId}`);

//     const formatted = res.data?.data?.map((reward, index) => {
//       let referenceName = "-";
//      // let referenceValue = "-";

//       // ✅ ENROLLMENT
//       if (reward?.group_id) {
//         referenceName = reward?.group_id?.group_name;
//       //  referenceValue = reward.group_id.group_value;
//       }
//       // ✅ LOAN
//       else if (reward?.loan_id) {
//         referenceName = reward.loan_id?.loan_id; // LN18
//       //  referenceValue = reward.loan_id.loan_amount;
//       }
//       // ✅ PIGMY
//       else if (reward?.pigme_id) {
//         referenceName = reward.pigme_id?.pigme_id; // PGxx
//        // referenceValue = reward.pigmy_id.monthly_amount;
//       }

//       return {
//         _id: reward?._id,
//         slNo: index + 1,
//         userName: reward?.user_id?.full_name || "-",
//         userPhone: reward?.user_id?.phone_number || "-",
//         groupName: referenceName,
//         groupValue: reward?.group_id?.group_value,
//         ticket: reward?.ticket || "-",
//         sourceType: reward?.source_type || "-",
//         rewardPoints: reward?.reward_points || 0,
//         rewardAmount: reward?.rewarded_amount || 0,
//         status: reward?.status || "N/A",
//         remarks: reward?.remarks || "-",
//       };
//     });

//     setRewardTable(formatted);
//   } catch (err) {
//     console.error("Failed to fetch reward list", err);
//   } finally {
//     setIsLoading(false);
//   }
// };

//   /* ================= CREATE REWARD ================= */
//   const createRewardPoints = async () => {
//     if (!employeeId) return alert("Select employee");

//     setIsLoading(true);
//     try {
//       await api.post("/reward-points/employee-reward-points", {
//         employee_id: employeeId,
//       });

//       await fetchRewardSummary(employeeId);
//       await fetchRewardPoints(employeeId);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   /* ================= AUTO CALCULATE AMOUNT ================= */
//   useEffect(() => {
//     if (redeemType === "Cash") {
//       setRedeemAmount(
//         Number(redeemPoints || 0) * summary.reward_point_value
//       );
//     } else {
//       setRedeemAmount(0);
//     }
//   }, [redeemPoints, redeemType, summary.reward_point_value]);

//   /* ================= REDEEM POINTS ================= */
//   const redeemRewardPoints = async () => {
//     if (!employeeId) return alert("Select employee");
//     if (!redeemPoints) return alert("Enter reward points");

//     setIsLoading(true);
//     try {
//       await api.post("/reward-points/employee-reward-points/redeem", {
//         employee_id: employeeId,
//         points_to_redeem: Number(redeemPoints),
//         redemption_type: redeemType,
//         description: redeemDesc,
//       });

//       setRedeemPoints("");
//       setRedeemDesc("");

//       await fetchRewardSummary(employeeId);
//       await fetchRewardPoints(employeeId);
//     } catch (err) {
//       alert(err.response?.data?.message || "Redeem failed");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const rewardColumns = [
//     { key: "slNo", header: "Sl No" },
//     { key: "userName", header: "Name" },
//     { key: "userPhone", header: "Phone" },
//     { key: "groupName", header: "Group / Loan / Pigmy " },
//     { key: "groupValue", header: "Group Value" },
//     { key: "ticket", header: "Ticket" },
//     { key: "sourceType", header: "Type" },
//     { key: "rewardPoints", header: "Points" },
//     { key: "rewardAmount", header: "Amount" },
//     { key: "status", header: "Status" },
//     { key: "remarks", header: "Remarks" },
//   ];

//   return (
//     <div>
//       <Navbar visibility />
//       <div className="flex mt-20">
//         <SettingSidebar />

//         <div className="flex-grow p-7">
//           <h1 className="text-2xl font-semibold mb-6">
//             Employee Reward Points
//           </h1>

//           {/* ================= SELECT EMPLOYEE ================= */}
//           <div className="flex gap-4 mb-6">
//             <select
//               className="border px-4 py-2 rounded w-64"
//               value={employeeId}
//               onChange={(e) => {
//                 const empId = e.target.value;
//                 setEmployeeId(empId);
//                 setRewardTable([]);
//                 if (empId) {
//                   fetchRewardSummary(empId);
//                   fetchRewardPoints(empId);
//                 }
//               }}
//             >
//               <option value="">Select Employee</option>
//               {employees.map((emp) => (
//                 <option key={emp._id} value={emp._id}>
//                   {emp.name}
//                 </option>
//               ))}
//             </select>

//             <button
//               onClick={createRewardPoints}
//               className="bg-blue-600 text-white px-6 py-2 rounded"
//             >
//               Create Reward Points
//             </button>
//           </div>

//           {/* ================= SUMMARY CARDS ================= */}
//           {employeeId && (
//             <div className="grid grid-cols-5 gap-4 mb-6">
//               <SummaryCard label="Earned Amount" value={`₹ ${summary.total_earned_amount}`} />
//               <SummaryCard label="Earned Points" value={summary.total_earned_reward} />
//               <SummaryCard label="Redeemed Amount" value={`₹ ${summary.total_redeemed_amount}`} />
//               {/* <SummaryCard label="Balance Amount" value={`₹ ${summary.balance_amount}`} /> */}
//               <SummaryCard label="One Chit Reward Point Value" value={`₹ ${summary.reward_point_value}`} />

//             </div>
//           )}

//           {/* ================= REDEEM SECTION ================= */}
//           {employeeId && (
//             <div className="border rounded p-4 mb-6">
//               <h2 className="font-semibold mb-4">Redeem Reward Points</h2>

//               <div className="grid grid-cols-4 gap-4">
//                 <input
//                   type="number"
//                   placeholder="Reward Points"
//                   className="border px-3 py-2 rounded"
//                   value={redeemPoints}
//                   onChange={(e) => setRedeemPoints(e.target.value)}
//                 />

//                 <select
//                   className="border px-3 py-2 rounded"
//                   value={redeemType}
//                   onChange={(e) => setRedeemType(e.target.value)}
//                 >
//                   <option value="Cash">Cash</option>
//                   <option value="Gift">Gift</option>
//                   <option value="Other">Other</option>
//                 </select>

//                 {redeemType === "Cash" && (
//                   <input
//                     disabled
//                     className="border px-3 py-2 rounded bg-gray-100"
//                     value={`₹ ${redeemAmount}`}
//                   />
//                 )}

//                 <input
//                   type="text"
//                   placeholder="Description"
//                   className="border px-3 py-2 rounded col-span-2"
//                   value={redeemDesc}
//                   onChange={(e) => setRedeemDesc(e.target.value)}
//                 />
//               </div>

//               <button
//                 onClick={redeemRewardPoints}
//                 className="mt-4 bg-green-600 text-white px-6 py-2 rounded"
//               >
//                 Redeem Points
//               </button>
//             </div>
//           )}

//           {/* ================= TABLE ================= */}
//           {rewardTable.length > 0 && !isLoading ? (
//             <DataTable columns={rewardColumns} data={rewardTable} />
//           ) : (
//             <CircularLoader
//               isLoading={isLoading}
//               data="Employee Reward"
//               failure={!isLoading && rewardTable.length === 0}
//             />
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// /* ================= SUMMARY CARD ================= */
// const SummaryCard = ({ label, value }) => (
//   <div className="border rounded p-4 bg-white shadow-sm">
//     <p className="text-gray-500 text-sm">{label}</p>
//     <p className="text-xl font-semibold mt-1">{value}</p>
//   </div>
// );


const EmployeeRewardPoints = () => {
  const [employees, setEmployees] = useState([]);
  const [empRewardsData, setEmpRewardsData] = useState([]);
  const [employeeId, setEmployeeId] = useState("");

  // ✅ NEW: Date range state
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  // const[totalEmplyees, setTotalEmployees] = useState(0);
  const [rewardState, setRewardState] = useState({
  rewards: [],
  activeRewards: [],
  totalPointsAll: 0,
  totalAmountAll: 0,
  totalEmplyees: 0,
});
  const [selectedEmployee, setSelectedEmployee] = useState('all');

  const [rewardTable, setRewardTable] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [rewards, setRewards] = useState([]);

  /* ================= SUMMARY STATES ================= */
  const [summary, setSummary] = useState({
    reward_point_value: 0,
    loan_reward_points: 0,
    pigme_reward_points: 0,
    total_earned_amount: 0,
    total_redeemed_points: 0,
    total_earned_reward: 0,
    total_redeemed_amount: 0,
    balance_amount: 0,
    source_wise_amount: [],
  });

  /* ================= REDEEM STATES ================= */
  const [redeemPoints, setRedeemPoints] = useState("");
  const [redeemType, setRedeemType] = useState("Cash");
  const [redeemAmount, setRedeemAmount] = useState(0);
  const [redeemDesc, setRedeemDesc] = useState("");

  /* ================= FETCH EMPLOYEES ================= */
  // useEffect(() => {
  //   fetchEmployees();
  // }, []);

  // const fetchEmployees = async () => {
  //   try {
  //     const res = await api.get("/agent/get-employee");
  //     setEmployees(res.data?.employee || []);
  //   } catch {
  //     console.error("Failed to fetch employees");
  //   }
  // };

  /* ================= FETCH SUMMARY ================= */
  const fetchRewardSummary = async (empId) => {
    try {
      const res = await api.get(
        `/reward-points/employee-reward-points/${empId}`
      );

      if (res.data?.success) {
        setSummary(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch reward summary", err);
    }
  };
  // useEffect(() => {
  //   // Simulate API call
  //   setTimeout(() => {
  //     setRewards([
  //       { id: 1, name: 'John Smith', department: 'Engineering', points: 450, rewards: 12, trend: 'up' },
  //       { id: 2, name: 'Sarah Johnson', department: 'Marketing', points: 380, rewards: 9, trend: 'up' },
  //       { id: 3, name: 'Michael Chen', department: 'Design', points: 320, rewards: 7, trend: 'down' },
  //       { id: 4, name: 'Emily Rodriguez', department: 'Sales', points: 290, rewards: 6, trend: 'up' },
  //       { id: 5, name: 'David Kim', department: 'Engineering', points: 270, rewards: 5, trend: 'same' },
  //     ]);
  //     setIsLoading(false);
  //   }, 1000);
  // }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [employeeRes, empRewardsRes] = await Promise.all([
          api.get("/agent/get-employee"),
          api.get("/reward-points/rewards/top-employees"),
        ]);
        console.log(empRewardsRes.data.count, "empRewardsRes");
        // setTotalEmployees(empRewardsRes.data.count || 0);
         const rewardData = empRewardsRes.data?.data || [];

      // 1️⃣ Remove zero points
      const filtered = rewardData.filter(
        (item) => item.total_points > 0
      );

      // 2️⃣ Sort descending
      const sorted = [...filtered].sort(
        (a, b) => b.total_points - a.total_points
      );

      // 3️⃣ Calculate totals (all data)
      const totalPoints = rewardData.reduce(
        (sum, item) => sum + item.total_points,
        0
      );

      const totalAmount = rewardData.reduce(
        (sum, item) => sum + item.total_amount,
        0
      );

      // 4️⃣ Update single state
      setRewardState({
        rewards: filtered,
        activeRewards: sorted,
        totalPointsAll: totalPoints,
        totalAmountAll: totalAmount,
        totalEmplyees: empRewardsRes.data?.count || 0,
      });
        setEmployees(employeeRes.data.employee || []);
        setRewards([empRewardsRes.data?.data] || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
    setIsLoading(false);
  }, []);

  const fetchRewardPoints = async (empId) => {
    if (!empId) return;

    setIsLoading(true);
    try {
      const res = await api.get(`/reward-points/list/${empId}`);

      const formatted = res.data?.data?.map((reward, index) => {
        let referenceName = "-";

        if (reward?.group_id) {
          referenceName = reward?.group_id?.group_name;
        } else if (reward?.loan_id) {
          referenceName = reward.loan_id?.loan_id;
        } else if (reward?.pigme_id) {
          referenceName = reward.pigme_id?.pigme_id;
        }

        return {
          _id: reward?._id,
          slNo: index + 1,
          userName: reward?.user_id?.full_name || "-",
          userPhone: reward?.user_id?.phone_number || "-",
          groupName: referenceName,
          groupValue: reward?.group_id?.group_value,
          ticket: reward?.ticket || "-",
          sourceType: reward?.source_type || "-",
          rewardPoints: reward?.reward_points || 0,
          rewardAmount: reward?.rewarded_amount || 0,
          status: reward?.status || "N/A",
          remarks: reward?.remarks || "-",
        };
      });

      setRewardTable(formatted);
    } catch (err) {
      console.error("Failed to fetch reward list", err);
    } finally {
      setIsLoading(false);
    }
  };

  /* ================= CREATE REWARD WITH DATE RANGE ================= */
  const createRewardPoints = async () => {
    if (!employeeId) return alert("Select employee");
    if (!fromDate || !toDate) return alert("Please select From Date and To Date");

    // Optional: Validate date logic (from <= to)
    if (new Date(fromDate) > new Date(toDate)) {
      return alert("From Date cannot be after To Date");
    }

    setIsLoading(true);
    try {
      await api.post("/reward-points/employee-reward-points", {
        employee_id: employeeId,
        from_date: fromDate,   // ✅
        to_date: toDate,       // ✅
        remarks: "",
      });

      await fetchRewardSummary(employeeId);
      await fetchRewardPoints(employeeId);

      // Optional: Clear dates after success
      // setFromDate("");
      // setToDate("");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create reward points");
    } finally {
      setIsLoading(false);
    }
  };

  /* ================= AUTO CALCULATE AMOUNT ================= */
  useEffect(() => {
    if (redeemType === "Cash") {
      setRedeemAmount(
        Number(redeemPoints || 0) * summary.reward_point_value
      );
    } else {
      setRedeemAmount(0);
    }
  }, [redeemPoints, redeemType, summary.reward_point_value]);

  /* ================= REDEEM POINTS ================= */
  const redeemRewardPoints = async () => {
    if (!employeeId) return alert("Select employee");
    if (!redeemPoints) return alert("Enter reward points");

    setIsLoading(true);
    try {
      await api.post("/reward-points/employee-reward-points/redeem", {
        employee_id: employeeId,
        points_to_redeem: Number(redeemPoints),
        redemption_type: redeemType,
        description: redeemDesc,
      });

      setRedeemPoints("");
      setRedeemDesc("");

      await fetchRewardSummary(employeeId);
      await fetchRewardPoints(employeeId);
    } catch (err) {
      alert(err.response?.data?.message || "Redeem failed");
    } finally {
      setIsLoading(false);
    }
  };

  const rewardColumns = [
    { key: "slNo", header: "Sl No" },
    { key: "userName", header: "Name" },
    { key: "userPhone", header: "Phone" },
    { key: "groupName", header: "Group / Loan / Pigmy " },
    { key: "groupValue", header: "Group Value" },
    { key: "ticket", header: "Ticket" },
    { key: "sourceType", header: "Type" },
    { key: "rewardPoints", header: "Points" },
    { key: "rewardAmount", header: "Amount" },
    { key: "status", header: "Status" },
    { key: "remarks", header: "Remarks" },
  ];

  // Filter rewards based on selected employee
  const filteredRewards =
    selectedEmployee === "all"
      ? rewards
      : rewards.filter(
        (r) => r.employee_name === selectedEmployee
      );

console.log(rewardState.activeRewards, "rewardState.activeRewards");
  return (
    <div>
      <Navbar visibility />
      <div className="flex mt-20">
        <Sidebar />

        <div className="flex-grow p-7">
          <h1 className="text-2xl font-semibold mb-4">
            Employee Reward Points
          </h1>

          {/* ================= SELECT EMPLOYEE + DATE FILTERS ================= */}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Total Employees</h3>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-gray-800">{rewardState?.totalEmplyees}</p>
              <p className="text-sm text-gray-500 mt-2">Across all department</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Total Amount / Rewards</h3>
                <Award className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-gray-800">{rewardState?.totalAmountAll}</p>
              <p className="text-sm text-gray-500 mt-2">Across all employees</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Total Points</h3>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
              <p className="text-3xl font-bold text-gray-800">{rewardState?.totalPointsAll}</p>
              <p className="text-sm text-gray-500 mt-2">Points awarded in total</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Top Performer</h3>
                <Trophy className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-xl font-bold text-gray-800">
                {rewardState?.activeRewards.length > 0 ? rewardState.activeRewards[0]?.employee_name : 'N/A'}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {rewardState?.activeRewards.length > 0 ? `${rewardState.activeRewards[0].total_points} points` : 'No data available'}
              </p>
            </div>
          </div>

          {/* Rewards Table */}
          {isLoading ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-500">Loading reward data...</p>
            </div>
          ) : rewardState?.rewards?.length > 0 ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-2 bg-gray-50 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Employee Rewards Summary</h2>
              
              <div className="overflow-x-auto mb-3">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sl no</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rewards / Ammount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                  {rewardState.activeRewards?.slice(0, 5)?.map((employee, key) => (
                      <tr key={employee.id} className="hover:bg-gray-50 ">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-medium">{key+1}</span>
                            </div>
                          </div>
                        </td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.employee_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.department || "Sales"}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900">{employee.total_points}</span>
                            <span className="ml-2 text-xs text-gray-500">pts</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.total_amount}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {employee.total_points > 2000 && (
                            <span className="flex items-center text-sm text-green-600">
                              <TrendingUp className="h-4 w-4 mr-1" />
                              Up
                            </span>
                          )}
                          {employee.total_points < 2000 && (
                            <span className="flex items-center text-sm text-red-600">
                              <TrendingUp className="h-4 w-4 mr-1 rotate-180" />
                              Down
                            </span>
                          )}
                          {employee.trend === 'same' && (
                            <span className="flex items-center text-sm text-gray-600">
                              <div className="h-4 w-4 mr-1 bg-gray-400 rounded-full"></div>
                              Same
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
</div>
              <div className="flex flex-wrap gap-4 mb-6 items-end bg-white border border-gray-200 rounded-xl shadow-sm p-6 hover:shadow-md transition duration-300">

                {/* Employee */}
                <div>
                  <label className="block text-sm font-medium mb-1">Employee</label>
                  <select
                    className="border px-4 py-2 rounded w-64"
                    value={employeeId}
                    onChange={(e) => {
                      const empId = e.target.value;
                      setEmployeeId(empId);
                      setRewardTable([]);
                      if (empId) {
                        fetchRewardSummary(empId);
                        fetchRewardPoints(empId);
                      }
                    }}
                  >
                    <option value="">Select Employee</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* From Date */}
                <div>
                  <label className="block text-sm font-medium mb-1">From Date</label>
                  <input
                    type="date"
                    className="border px-4 py-2 rounded"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </div>

                {/* To Date */}
                <div>
                  <label className="block text-sm font-medium mb-1">To Date</label>
                  <input
                    type="date"
                    className="border px-4 py-2 rounded"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>

                {/* Create Button */}
                <button
                  onClick={createRewardPoints}
                  disabled={isLoading}
                  className={`px-6 py-2 rounded ${isLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                >
                  {isLoading ? "Processing..." : "Create Reward Points"}
                </button>
              </div>
              {/* ================= SUMMARY CARDS ================= */}
              {employeeId && (
                <div className="grid grid-cols-5 gap-4 mb-6">
                  <SummaryCard label="Earned Points" value={summary.total_earned_reward} />
                  <SummaryCard label="Redeemed Points" value={summary.total_redeemed_points} />
                  <SummaryCard label="Earned Amount" value={`₹ ${summary.total_earned_amount}`} />
                  <SummaryCard label="Redeemed Amount" value={`₹ ${summary.total_redeemed_amount}`} />
                  {/* <SummaryCard label="One Chit Reward Point Value" value={`₹ ${summary.reward_point_value}`} /> */}
                </div>
              )}

              {/* ================= REDEEM SECTION ================= */}
              {employeeId && (
                <div className="border border-gray-200 rounded-lg p-6 mb-6 bg-white shadow-sm">
                  <h2 className="font-semibold text-lg text-gray-800 mb-6 flex items-center">
                    <Gift className="mr-2 h-5 w-5 text-green-600" />
                    Redeem Reward Points
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="relative">
                      <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-gray-600">
                        Reward Points
                      </label>
                      <input
                        type="number"
                        placeholder="Enter points"
                        className="border border-gray-300 px-4 py-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                        value={redeemPoints}
                        onChange={(e) => setRedeemPoints(e.target.value)}
                      />
                    </div>

                    <div className="relative">
                      <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-gray-600">
                        Redeem Type
                      </label>
                      <select
                        className="border border-gray-300 px-4 py-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 appearance-none bg-white"
                        value={redeemType}
                        onChange={(e) => setRedeemType(e.target.value)}
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: 'right 0.5rem center',
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: '1.5em 1.5em',
                          paddingRight: '2.5rem'
                        }}
                      >
                        <option value="Cash">Cash</option>
                        <option value="Gift">Gift</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {redeemType === "Cash" && (
                      <div className="relative">
                        <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-gray-600">
                          Amount (₹)
                        </label>
                        <input
                          disabled
                          className="border border-gray-200 px-4 py-3 rounded-lg w-full bg-gray-50 text-gray-700 font-medium cursor-not-allowed"
                          value={`₹ ${redeemAmount}`}
                        />
                      </div>
                    )}

                    <div className="relative lg:col-span-2">
                      <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-gray-600">
                        Description
                      </label>
                      <input
                        type="text"
                        placeholder="Enter description for redemption"
                        className="border border-gray-300 px-4 py-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                        value={redeemDesc}
                        onChange={(e) => setRedeemDesc(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={redeemRewardPoints}
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center"
                    >
                      <Gift className="mr-2 h-4 w-4" />
                      Redeem Points
                    </button>
                  </div>
                </div>
              )}

              {/* ================= TABLE ================= */}
              {rewardTable.length > 0 && !isLoading ? (
                <DataTable columns={rewardColumns} data={rewardTable} />
              ) : (
                <CircularLoader
                  isLoading={isLoading}
                  data="Employee Reward"
                  failure={!isLoading && rewardTable.length === 0}
                />
              )}
            </div>
          ) : (
            <></>
          )
          }
        </div>
      </div>
    </div>
  );
}

const SummaryCard = ({ label, value }) => (
  <div className="border rounded p-4 bg-white shadow-sm">
    <p className="text-gray-500 text-sm">{label}</p>
    <p className="text-xl font-semibold mt-1">{value}</p>
  </div>
);








export default EmployeeRewardPoints
