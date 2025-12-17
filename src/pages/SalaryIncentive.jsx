/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import Sidebar from "../components/layouts/Sidebar";
import Navbar from "../components/layouts/Navbar";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import CircularLoader from "../components/loaders/CircularLoader";
import CustomAlertDialog from "../components/alerts/CustomAlertDialog";
import filterOption from "../helpers/filterOption";
import { Drawer, Form, Input, Button, Select, InputNumber } from "antd";

const AllEmployeeIncentives = () => {
  const [tableData, setTableData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [reload, setReload] = useState(0);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [form] = Form.useForm();

  const [alertConfig, setAlertConfig] = useState({
    visibility: false,
    message: "",
    type: "info",
  });

  const onGlobalSearchChangeHandler = (e) => {
    setSearchText(e.target.value);
  };

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    const fetchAllIncentives = async () => {
      try {
        setIsLoading(true);

        const response = await api.get(
          "/employee/incentives/all-time"
        );

        const apiData = response.data.data || [];
        let rows = [];
        let index = 1;

        apiData.forEach((emp) => {
          emp.records.forEach((record) => {
            rows.push({
              _id: record.salary_id, // IMPORTANT
              id: index++,
              employee_name: emp.employee.name,
              employee_code: emp.employee.employee_code,
              salary_month: record.period.month,
              salary_year: record.period.year,
              target_amount: record.target.target_amount,
              actual_closed: record.target.actual_closed,
              incentive_earned: record.incentive.earned,
              incentive_paid: record.incentive.paid,
              incentive_remaining: record.incentive.remaining,
              incentive_status: record.incentive.status,
              target_status: record.target.is_achieved
                ? "Achieved"
                : "Not Achieved",
              action: (
                <Button
                  type="primary"
                  size="small"
                  disabled={record.incentive.remaining <= 0}
                  onClick={() =>
                    openDrawer({
                      salary_id: record.salary_id,
                      employee_name: emp.employee.name,
                      employee_code: emp.employee.employee_code,
                      month: record.period.month,
                      year: record.period.year,
                      remaining: record.incentive.remaining,
                    })
                  }
                >
                  Pay Incentive
                </Button>
              ),
            });
          });
        });

        setTableData(rows);
      } catch (error) {
        console.error(error);
        setAlertConfig({
          visibility: true,
          message: "Failed to fetch incentive data",
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllIncentives();
  }, [reload]);

  /* ---------------- DRAWER ---------------- */
  const openDrawer = (data) => {
    setSelectedRow(data);
    form.setFieldsValue({
      incentive_paid_amount: data.remaining,
      incentive_payment_method: "",
    });
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedRow(null);
    form.resetFields();
  };

  /* ---------------- PAY INCENTIVE ---------------- */
  const handlePayIncentive = async (values) => {
    try {
      await api.put(
        `/employee/salaries/${selectedRow.salary_id}/pay-incentive`,
        values
      );

      setAlertConfig({
        visibility: true,
        message: "Incentive paid successfully",
        type: "success",
      });

      closeDrawer();
      setReload((p) => p + 1);
    } catch (err) {
      setAlertConfig({
        visibility: true,
        message:
          err.response?.data?.message || "Failed to pay incentive",
        type: "error",
      });
    }
  };

  /* ---------------- TABLE ---------------- */
  const columns = [
    { key: "id", header: "SL. NO" },
    { key: "employee_name", header: "Employee Name" },
 
    { key: "salary_month", header: "Month" },
    { key: "salary_year", header: "Year" },
    { key: "target_amount", header: "Target (₹)" },
    { key: "actual_closed", header: "Business Closed (₹)" },
    { key: "target_status", header: "Target Status" },
    { key: "incentive_earned", header: "Incentive Earned (₹)" },
    { key: "incentive_paid", header: "Paid (₹)" },
    { key: "incentive_remaining", header: "Remaining (₹)" },
    { key: "incentive_status", header: "Incentive Status" },
    { key: "action", header: "Action" },
  ];

  return (
    <>
      <Navbar
        visibility={true}
        onGlobalSearchChangeHandler={onGlobalSearchChangeHandler}
      />

      <CustomAlertDialog
        type={alertConfig.type}
        isVisible={alertConfig.visibility}
        message={alertConfig.message}
        onClose={() =>
          setAlertConfig((prev) => ({ ...prev, visibility: false }))
        }
      />

      <div className="flex mt-20">
        <Sidebar />

        <div className="flex-grow p-7">
          <div className="mt-6 mb-8">
            <h1 className="text-2xl font-semibold">
              All Employees – Incentive & Target Report
            </h1>
          </div>

          {!isLoading ? (
            <DataTable
              catcher="_id"
              data={filterOption(tableData, searchText)}
              columns={columns}
              exportedPdfName="All Employee Incentives"
              exportedFileName="All_Employee_Incentives.csv"
            />
          ) : (
            <CircularLoader isLoading={true} />
          )}
        </div>
      </div>

      {/* ---------------- PAY DRAWER ---------------- */}
      <Drawer
        title="Pay Incentive"
        placement="right"
        width={420}
        open={drawerOpen}
        onClose={closeDrawer}
      >
        {selectedRow && (
          <Form
            layout="vertical"
            form={form}
            onFinish={handlePayIncentive}
          >
            <Form.Item label="Employee">
              <Input
                disabled
                value={`${selectedRow.employee_name} (${selectedRow.employee_code})`}
              />
            </Form.Item>

            <Form.Item label="Period">
              <Input
                disabled
                value={`${selectedRow.month} ${selectedRow.year}`}
              />
            </Form.Item>

            <Form.Item label="Remaining Incentive">
              <Input disabled value={`₹ ${selectedRow.remaining}`} />
            </Form.Item>

            <Form.Item
              label="Pay Amount"
              name="incentive_paid_amount"
              rules={[
                { required: true },
                {
                  validator: (_, value) =>
                    value > selectedRow.remaining
                      ? Promise.reject(
                          new Error("Amount exceeds remaining incentive")
                        )
                      : Promise.resolve(),
                },
              ]}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              label="Payment Method"
              name="incentive_payment_method"
              rules={[{ required: true }]}
            >
              <Select placeholder="Select payment method">
                <Select.Option value="Cash">Cash</Select.Option>
                <Select.Option value="UPI">UPI</Select.Option>
                <Select.Option value="NEFT">NEFT</Select.Option>
                <Select.Option value="IMPS">IMPS</Select.Option>
                <Select.Option value="RTGS">RTGS</Select.Option>
                <Select.Option value="Cheque">Cheque</Select.Option>
              </Select>
            </Form.Item>

            <Button type="primary" htmlType="submit" block>
              Pay Incentive
            </Button>
          </Form>
        )}
      </Drawer>
    </>
  );
};

export default AllEmployeeIncentives;
