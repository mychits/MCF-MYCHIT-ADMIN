import { div } from "framer-motion/client";
import { useState, useEffect } from "react";
import DataTable from "../components/layouts/Datatable"
import api from "../instance/TokenInstance";
import { Select, Table, Spin } from "antd";

const EmployeeMonthlyReport = () => {
  const [presentCount, setPresentCount] = useState(0);
  const [absentCount, setAbsentCount] = useState(0);
  const [attendanceMonthlyTableReport, setAttendanceMonthlyReport] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch employee list
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await api.get(`/agent/get-employee`);
        setEmployees(response.data.employee || []);
      } catch (error) {
        console.error("Unable to fetch employees:", error);
      }
    };
    fetchEmployees();
  }, []);

  // ✅ Fetch monthly attendance for selected employee
  useEffect(() => {
    if (!selectedEmployee) return;

    const fetchEmployeeMonthlyAttendance = async () => {
      setLoading(true);
      try {
        const response = await api.get(
          `/employee-attendance/employee/${selectedEmployee}`
        );

        const attendanceData = response.data.attendanceDataResponse || [];
        let present = 0;
        let absent = 0;

        attendanceData.forEach((record) => {
          if (record.status === "Present") present++;
          else if (record.status === "Absent") absent++;
        });

        setPresentCount(present);
        setAbsentCount(absent);

        const formattedData = [
          {
            key: 1,
            SlNo: 1,
            EmployeeName: attendanceData[0]?.employee_id?.name || "-",
            PresentDays: present,
            AbsentDays: absent,
          },
        ];

        setAttendanceMonthlyReport(formattedData);
      } catch (error) {
        console.error("Unable to fetch Employee monthly attendance:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeMonthlyAttendance();
  }, [selectedEmployee]);

  // ✅ Table columns
  const attendanceColumns = [
    { title: "Sl No", dataIndex: "SlNo", key: "SlNo" },
    { title: "Employee Name", dataIndex: "EmployeeName", key: "EmployeeName" },
    { title: "Present Days", dataIndex: "PresentDays", key: "PresentDays" },
    { title: "Absent Days", dataIndex: "AbsentDays", key: "AbsentDays" },
  ];

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Employee Monthly Report</h2>

      {/* Employee Selector */}
      <Select
        placeholder="Select Employee"
        style={{ width: 300, marginBottom: 20 }}
        onChange={(value) => setSelectedEmployee(value)}
        value={selectedEmployee}
      >
        {employees.map((emp) => (
          <Select.Option key={emp._id} value={emp._id}>
            {emp.name}
          </Select.Option>
        ))}
      </Select>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Spin size="large" />
        </div>
      ) : (
        <>
          {attendanceMonthlyTableReport.length > 0 ? (
            <>
              <div className="mb-4">
                <p>
                  <strong>Present Days:</strong> {presentCount}
                </p>
                <p>
                  <strong>Absent Days:</strong> {absentCount}
                </p>
              </div>

              <Table
                columns={attendanceColumns}
                dataSource={attendanceMonthlyTableReport}
                pagination={false}
                bordered
              />
            </>
          ) : (
            selectedEmployee && (
              <p className="text-gray-500">No attendance data found.</p>
            )
          )}
        </>
      )}
    </div>
  );
};

export default EmployeeMonthlyReport;
