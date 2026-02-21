import { useState, useEffect } from "react";
import api from "../instance/TokenInstance";
import Navbar from "../components/layouts/Navbar";
import DataTable from "../components/layouts/Datatable";
import { Select, Button, message } from "antd";

const DateWiseRewardreport = () => {
  const [employee, setEmployee] = useState([]);
  const [employeeId, setEmployeeId] = useState(null);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [rewardtable, setRewardTable] = useState([]);
  const [loading, setLoading] = useState(false);

  const [runFetch, setRunFetch] = useState(0);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const response = await api.get("/agent/get-employee");
        setEmployee(response.data?.employee || []);
      } catch (error) {
        console.error("unable to fetch employee data", error);
      }
    };
    fetchEmployeeData();
  }, []);

  useEffect(() => {
    const fetchEmployeeRewardPoints = async () => {
      if (!employeeId || !fromDate || !toDate) {
        message.warning("Select employee and date range");
        return;
      }
      try {
        setLoading(true);
        const response = await api.post("/reward-points/datewise-list", {
          employee_id: employeeId,
          from_date: fromDate,
          to_date: toDate,
        });
        console.info(response?.data?.data, "test");

        const formattedData = response.data?.data?.map((reward, index) => {
          let referenceName = "-";

          if (reward?.group_id) {
            referenceName = reward?.group_id?.group_name;
          } else if (reward?.loan_id) {
            referenceName = reward?.loan_id?.loan_id;
          } else if (reward?.pigme_id) {
            referenceName = reward?.pigme_id?.pigme_id;
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
            createdAt: new Date(reward.createdAt).toLocaleString(),
          };
        });
        setRewardTable(formattedData);
      } catch (error) {
        console.error("unable to fetch employee reward points", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployeeRewardPoints();
  }, [runFetch]);

  const columns = [
    { header: "Sl No", key: "slNo" },
    { header: "Customer", key: "userName" },
    { header: "Phone", key: "userPhone" },
    { header: "Reference", key: "reference" },
    { header: "Group Value", key: "groupValue" },
    { header: "Ticket", key: "ticket" },
    { header: "Type", key: "sourceType" },
    { header: "Points", key: "rewardPoints" },
    { header: "Amount", key: "rewardAmount" },
    { header: "Status", key: "status" },
    { header: "Remarks", key: "remarks" },
    { header: "Reward created On", key: "createdAt" },
  ];
  return (
    <div>
      <Navbar />
      <div className="flex-1 mt-20">
        <div className="flex-grow p-7">
          <h1 className="text-2xl font-semibold mb-6">
            Date Wise Reward Points
          </h1>
          <div>
            <Select
              className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-64 mr-3"
              popupMatchSelectWidth={false}
              showSearch
              placeholder="Select Employee"
              value={employeeId || undefined}
              onChange={(value) => setEmployeeId(value)}
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children
                  .toString()
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {employee.map((emp) => (
                <Select.Option key={emp._id} value={emp._id}>
                  {emp.name} - {emp.phone_number}
                </Select.Option>
              ))}
            </Select>
            <input
              type="date"
              className="border p-4 rounded mr-3"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />

            <input
              type="date"
              className="border p-4 rounded mr-3"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />

            <Button
              type="primary"
              className="h-14 text-base px-6 mr-3 rounded-lg mb-10" 
              onClick={() => setRunFetch((v) => v + 1)}
              loading={loading}
            >
              Continue
            </Button>
          </div>
          <DataTable data={rewardtable} columns={columns} />
        </div>
      </div>
    </div>
  );
};

export default DateWiseRewardreport;
