/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Select } from "antd";
import api from "../instance/TokenInstance";
import ReConfirmModal from "../components/modals/ReConfirmModal";
import CustomAlert from "../components/alerts/CustomAlert";



const AddGroupForm = ({
    mode = "add",
    initialData = null,
    fieldSize = { height: "h-12" },
}) => {
    const [formData, setFormData] = useState({
        group_name: "",
        group_type: "",
        group_value: "",
        group_install: "",
        group_members: "",
        group_duration: "",
        start_date: "",
        end_date: "",
        minimum_bid: "",
        maximum_bid: "",
        commission: "1",
        group_commission: "5",
        incentives: "1",
        reg_fee: "",
        monthly_installment: "",
        weekly_installment: "",
        daily_installment: "",
        relationship_manager: "",
        app_display_vacany_seat: "",
    });
    const [updateFormData, setUpdateFormData] = useState({
        group_name: "",
        group_type: "",
        group_value: "",
        group_install: "",
        group_members: "",
        group_duration: "",
        start_date: "",
        end_date: "",
        minimum_bid: "",
        maximum_bid: "",
        commission: "",
        group_commission: "",
        incentives: "",
        reg_fee: "",
        monthly_installment: "",
        weekly_installment: "",
        daily_installment: "",
        relationship_manager: "",
        app_display_vacany_seat: "",
    });
      const [alertConfig, setAlertConfig] = useState({
        visibility: false,
        message: "Something went wrong!",
        type: "info",
      });
    const [errors, setErrors] = useState({});
    const [employees, setEmployees] = useState([]);
    const [reloadTrigger, setReloadTrigger] = useState(0);
     const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    

      const handleChange = (e) => {
    const { name, value } = e.target;
    // apply validation here
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    setErrors((prevData) => ({
      ...prevData,
      [name]: "",
    }));
  };

    const handleAntDSelect = (field, value,option) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
      ...(field === "relationship_manager" ? { relationship_manager_select: option } : {}),
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: "",
    }));
  };
    const handleReconfirmation = (e) => {
        e.preventDefault();

        const isValid = validateForm("addGroup");
        if (!isValid) return;

        // ✅ Just open reconfirm modal
        setShowConfirm(true);
    };

    // ✅ Populate data when edit mode
    // useEffect(() => {
    //     if (mode === "edit" && initialData) {
    //         setFormData({ ...defaultForm, ...initialData });
    //     }
    // }, [mode, initialData]);

    // const handleChange = (e) => {
    //     const { name, value } = e.target;
    //     setFormData((prev) => ({ ...prev, [name]: value }));
    // };

    // const handleAntDSelect = (name, value) => {
    //     setFormData((prev) => ({ ...prev, [name]: value }));
    // };

    useEffect(() => {
        async function getEmployees() {
            try {
                const response = await api.get("/employee");
                const responseData = response.data?.employee;
                setEmployees(responseData ? responseData : []);
            } catch (error) {
                setEmployees([]);
                console.log("Error Fetching Employees");
            }
        }
        getEmployees();
    }, []);

    const validateForm = (type) => {
        const newErrors = {};

     const data = type === "addGroup" ? formData : updateFormData;

        if (!data.group_name?.trim()) {
            newErrors.group_name = "Group Name is required";
        }

        if (!data.group_type) {
            newErrors.group_type = "Group Type is required";
        }
        if (!data.group_value) {
            newErrors.group_value = "Group Value is required";
        } else if (isNaN(data.group_value) || data.group_value <= 0) {
            newErrors.group_value = "Group Value must be greater than zero (no";
        }

        if (!data.group_install) {
            newErrors.group_install = "Group Installment Amount is required";
        } else if (
            !data.group_install ||
            isNaN(data.group_install) ||
            data.group_install <= 0
        ) {
            newErrors.group_install =
                "Group Installment Amount must be greater than zero (no symbols).";
        }

        if (!data.group_members) {
            newErrors.group_members = "Group Members is required";
        } else if (
            !data.group_members ||
            isNaN(data.group_members) ||
            data.group_members <= 0
        ) {
            newErrors.group_members =
                "Group Members must be greater than zero (no symbols).";
        }
        if (!data.relationship_manager) {
            newErrors.relationship_manager = "Relationship Manager is required";
        }
        if (!data.monthly_installment) {
            newErrors.monthly_installment = "Monthly Installment is required";
        }
        if (!data.weekly_installment) {
            newErrors.weekly_installment = "Weekly Installment is required";
        }
        if (!data.daily_installment) {
            newErrors.daily_installment = "Daily Installment is required";
        }
        if (!data.group_duration) {
            newErrors.group_duration = "Group Duration is required";
        } else if (
            !data.group_duration ||
            isNaN(data.group_duration) ||
            data.group_duration <= 0
        ) {
            newErrors.group_duration =
                "Group Duration must be greater than zero (no symbols).";
        }

        if (!data.reg_fee) {
            newErrors.reg_fee = "Registration Fee is required";
        } else if (!data.reg_fee || isNaN(data.reg_fee) || data.reg_fee < 0) {
            newErrors.reg_fee =
                "Registration Fee must be a zero or greater than zero (no symbols).";
        }

        if (!data.start_date) {
            newErrors.start_date = "Start Date is required";
        }
        if (!data.app_display_vacany_seat) {
            newErrors.app_display_vacany_seat = "Please Enter Display Vacant Seat"
        }

        if (formData.end_date && !data.end_date) {
            newErrors.end_date = "End Date is required";
        } else if (
            formData.end_date &&
            new Date(data.end_date) < new Date(data.start_date)
        ) {
            newErrors.end_date = "End Date cannot be earlier than Start Date";
        }

        if (!data.minimum_bid) {
            newErrors.minimum_bid = "Minimum Bid is required";
        } else if (
            !data.minimum_bid ||
            isNaN(data.minimum_bid) ||
            data.minimum_bid <= 0
        ) {
            newErrors.minimum_bid =
                "Minimum Bid must be greater than zero (no symbols).";
        }

        if (!data.maximum_bid) {
            newErrors.maximum_bid = "Maximum Bid is required";
        } else if (
            !data.maximum_bid ||
            isNaN(data.maximum_bid) ||
            data.maximum_bid <= 0
        ) {
            newErrors.maximum_bid =
                "Maximum Bid must be greater than zero (no symbols).";
        } else if (parseFloat(data.maximum_bid) < parseFloat(data.minimum_bid)) {
            newErrors.maximum_bid =
                "Maximum Bid must be greater than or equal to Minimum Bid";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

const handleSubmit = async () => {
  try {
    setLoading(true);

    await api.post("/group/add-group", formData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    setShowConfirm(false);
    setReloadTrigger((prev) => prev + 1);

    setAlertConfig({
      visibility: true,
      message: "Group Added Successfully",
      type: "success",
    });

    // Reset form
    setFormData({
      group_name: "",
      group_type: "",
      group_value: "",
      group_install: "",
      group_members: "",
      group_duration: "",
      group_commission: "5",
      start_date: "",
      end_date: "",
      minimum_bid: "",
      maximum_bid: "",
      commission: "",
      incentives: "",
      relationship_manager: "",
      monthly_installment: "",
      weekly_installment: "",
      daily_installment: "",
      reg_fee: "",
      app_display_vacany_seat: "",
    });
   // Delay closing so alert can show
    setTimeout(() => {
      window.close();
    }, 2000); // 2 seconds


  } catch (error) {
    console.error("Error adding group:", error);
  } finally {
    setLoading(false);
  }
};


    return (
        <div className="flex-1 flex justify-center p-5">
            <CustomAlert
                type={alertConfig.type}
                isVisible={alertConfig.visibility}
                message={alertConfig.message}
            />
            <form className="relative w-full max-w-3xl bg-white rounded shadow p-6"  onSubmit={handleReconfirmation} noValidate>
                <h3 className="mb-4 text-xl font-bold text-gray-900 text-center drop-shadow-lg">Add Group</h3>
                <div className="p-4">
                    <label
                        className="block mb-2 text-sm font-medium text-gray-900"
                        htmlFor="email"
                    >
                        Group Name <span className="text-red-500 ">*</span>
                    </label>
                    <input
                        type="text"
                        name="group_name"
                        value={formData?.group_name}
                        onChange={handleChange}
                        id="name"
                        placeholder="Enter the Group Name"
                        required
                        className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                    />
                    {errors.group_name && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors?.group_name}
                        </p>
                    )}
                </div>
                <div className="w-full p-4">
                    <label
                        className="block mb-2 text-sm font-medium text-gray-900"
                        htmlFor="category"
                    >
                        Group Type <span className="text-red-500 ">*</span>
                    </label>
                    <Select
                        className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                        placeholder="Select or Search Group Type"
                        popupMatchSelectWidth={false}
                        showSearch
                        name="group_type"
                        filterOption={(input, option) =>
                            option.children.toLowerCase().includes(input.toLowerCase())
                        }
                        value={formData?.group_type || undefined}
                        onChange={(value) => handleAntDSelect("group_type", value)}
                    >
                        {["Divident", "Double"].map((gType) => (
                            <Select.Option key={gType} value={gType.toLowerCase()}>
                                {gType}
                            </Select.Option>
                        ))}
                    </Select>
                    {errors.group_type && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.group_type}
                        </p>
                    )}
                </div>
                <div className="flex flex-row justify-between space-x-4 p-4">
                    <div className="w-1/2">
                        <label
                            className="block mb-2 text-sm font-medium text-gray-900"
                            htmlFor="category"
                        >
                            Relationship Manager <span className="text-red-500 ">*</span>
                        </label>
                        <Select
                            className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                            placeholder="Select or Search Relationship Manager"
                            popupMatchSelectWidth={false}
                            showSearch
                            name="relationship_manager"
                            filterOption={(input, option) => {
                                const text = `${option.children}`; // Coerce children to string
                                return text.toLowerCase().includes(input.toLowerCase());
                            }}
                            value={formData?.relationship_manager || undefined}
                            onChange={(value,option) =>
                                handleAntDSelect("relationship_manager", value,option.children[0])
                            }
                        >
                            {(Array.isArray(employees) ? employees : []).map(
                                (employee) => (
                                    <Select.Option key={employee?._id} value={employee?._id}>
                                        {employee?.name} | {employee?.phone_number}
                                    </Select.Option>
                                )
                            )}
                        </Select>
                        {errors.relationship_manager && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.relationship_manager}
                            </p>
                        )}
                    </div>
                    <div className="w-1/2">
                        <label
                            className="block mb-2 text-sm font-medium text-gray-900"
                            htmlFor="date"
                        >
                            App Display Vacany Seat <span className="text-red-500 ">*</span>
                        </label>
                        <input
                            type="number"
                            name="app_display_vacany_seat"
                            value={formData?.app_display_vacany_seat}
                            onChange={handleChange}
                            id="text"
                            placeholder="Enter App Display Vacany Seat"
                            required
                            className={`no-spinner bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                        />
                        {errors.app_display_vacany_seat && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors?.app_display_vacany_seat}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex flex-row justify-between space-x-4 p-4">
                    <div className="w-1/2">
                        <label
                            className="block mb-2 text-sm font-medium text-gray-900"
                            htmlFor="date"
                        >
                            Group Value <span className="text-red-500 ">*</span>
                        </label>
                        <input
                            type="number"
                            name="group_value"
                            value={formData?.group_value}
                            onChange={handleChange}
                            id="text"
                            placeholder="Enter Group Value"
                            required
                            className={`no-spinner bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                        />
                        {errors.group_value && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors?.group_value}
                            </p>
                        )}
                    </div>
                    <div className="w-1/2">
                        <label
                            className="block mb-2 text-sm font-medium text-gray-900"
                            htmlFor="date"
                        >
                            Group Installment Amount{" "}
                            <span className="text-red-500 ">*</span>
                        </label>
                        <input
                            type="number"
                            name="group_install"
                            value={formData?.group_install}
                            onChange={handleChange}
                            id="text"
                            placeholder="Enter Group Installment Amount"
                            required
                            className={`no-spinner bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                        />
                        {errors?.group_install && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors?.group_install}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex flex-row justify-between space-x-4 p-4">
                    <div className="w-1/2">
                        <label
                            className="block mb-2 text-sm font-medium text-gray-900"
                            htmlFor="date"
                        >
                            Group Members <span className="text-red-500 ">*</span>
                        </label>
                        <input
                            type="number"
                            name="group_members"
                            value={formData?.group_members}
                            onChange={handleChange}
                            id="text"
                            placeholder="Enter Group Members"
                            required
                            className={`no-spinner bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                        />
                        {errors.group_members && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors?.group_members}
                            </p>
                        )}
                    </div>
                    <div className="w-1/2">
                        <label
                            className="block mb-2 text-sm font-medium text-gray-900"
                            htmlFor="date"
                        >
                            Group Duration <span className="text-red-500 ">*</span>
                        </label>
                        <input
                            type="number"
                            name="group_duration"
                            value={formData?.group_duration}
                            onChange={handleChange}
                            id="text"
                            placeholder="Enter Group Duration"
                            required
                            className={` no-spinner bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                        />
                        {errors.group_duration && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.group_duration}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex flex-row justify-between space-x-4 p-4">
                    <div className="w-1/2">
                        <label
                            className="block mb-2 text-sm font-medium text-gray-900"
                            htmlFor="date"
                        >
                            Daily Installment <span className="text-red-500 ">*</span>
                        </label>
                        <input
                            type="number"
                            name="daily_installment"
                            value={formData?.daily_installment}
                            onChange={handleChange}
                            id="text"
                            placeholder="Enter Daily Installment"
                            required
                            className={`no-spinner bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                        />
                        {errors.daily_installment && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.daily_installment}
                            </p>
                        )}
                    </div>
                    <div className="w-1/2">
                        <label
                            className="block mb-2 text-sm font-medium text-gray-900"
                            htmlFor="date"
                        >
                            Weekly Installment <span className="text-red-500 ">*</span>
                        </label>
                        <input
                            type="number"
                            name="weekly_installment"
                            value={formData?.weekly_installment}
                            onChange={handleChange}
                            id="text"
                            placeholder="Enter Weekly Installment"
                            required
                            className={`no-spinner bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                        />
                        {errors.weekly_installment && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.weekly_installment}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex flex-row justify-between space-x-4 p-4">
                    <div className="w-1/2">
                        <label
                            className="block mb-2 text-sm font-medium text-gray-900"
                            htmlFor="monthly_install"
                        >
                            Monthly Installment <span className="text-red-500 ">*</span>
                        </label>
                        <input
                            type="text"
                            name="monthly_installment"
                            value={formData?.monthly_installment}
                            onChange={handleChange}
                            id="monthly_install"
                            placeholder="Enter Monthly Installment"
                            required
                            className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                        />
                        {errors.monthly_installment && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.monthly_installment}
                            </p>
                        )}
                    </div>
                    <div className="w-1/2">
                        <label
                            className="block mb-2 text-sm font-medium text-gray-900"
                            htmlFor="date"
                        >
                            Registration Fee <span className="text-red-500 ">*</span>
                        </label>
                        <input
                            type="number"
                            name="reg_fee"
                            value={formData?.reg_fee}
                            onChange={handleChange}
                            id="text"
                            placeholder="Enter Registration Fee"
                            required
                            className={`no-spinner bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                        />
                        {errors.reg_fee && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.reg_fee}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex flex-row justify-between space-x-4 p-4">
                    <div className="w-1/2">
                        <label
                            className="block mb-2 text-sm font-medium text-gray-900"
                            htmlFor="date"
                        >
                            Start Date <span className="text-red-500 ">*</span>
                        </label>
                        <input
                            type="date"
                            name="start_date"
                            value={formData?.start_date}
                            onChange={handleChange}
                            id="date"
                            placeholder="Enter the Date"
                            required
                            className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                        />
                        {errors.start_date && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.start_date}
                            </p>
                        )}
                    </div>
                    <div className="w-1/2">
                        <label
                            className="block mb-2 text-sm font-medium text-gray-900"
                            htmlFor="date"
                        >
                            End Date
                        </label>
                        <input
                            type="date"
                            name="end_date"
                            value={formData?.end_date}
                            onChange={handleChange}
                            id="date"
                            placeholder="Enter the Date"
                            required
                            className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                        />
                        {errors.end_date && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.end_date}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex flex-row justify-between space-x-4 p-4">
                    <div className="w-1/2">
                        <label
                            className="block mb-2 text-sm font-medium text-gray-900"
                            htmlFor="date"
                        >
                            Minimum Bid <span className="text-red-500 ">*</span>
                        </label>
                        <input
                            type="number"
                            name="minimum_bid"
                            value={formData?.minimum_bid}
                            onChange={handleChange}
                            id="text"
                            placeholder="Enter Minimum Bid"
                            required
                            className={`no-spinner bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                        />
                        {errors.minimum_bid && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.minimum_bid}
                            </p>
                        )}
                    </div>
                    <div className="w-1/2">
                        <label
                            className="block mb-2 text-sm font-medium text-gray-900"
                            htmlFor="date"
                        >
                            Maximum Bid <span className="text-red-500 ">*</span>
                        </label>
                        <input
                            type="number"
                            name="maximum_bid"
                            value={formData?.maximum_bid}
                            onChange={handleChange}
                            id="text"
                            placeholder="Enter Maximum Bid"
                            required
                            className={`no-spinner bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                        />
                        {errors.maximum_bid && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.maximum_bid}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex flex-row justify-between space-x-4 p-4">
                    <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                            Agent Commission %
                        </label>
                        <input
                            type="number"
                            name="commission"
                            value={formData?.commission}
                            onChange={handleChange}
                            placeholder="Enter Commission"
                            className={`no-spinner bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                        />
                    </div>

                    <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                            Company Commission %
                        </label>
                        <input
                            type="number"
                            name="group_commission"
                            value={formData?.group_commission}
                            onChange={handleChange}
                            placeholder="Enter Group Commission"
                            className={`no-spinner bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                        />
                    </div>

                    <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                            Employee Incentives %
                        </label>
                        <input
                            type="text"
                            name="incentives"
                            value={formData?.incentives}
                            onChange={handleChange}
                            placeholder="Enter Incentives"
                            className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                        />
                    </div>
                </div>

                <div className="w-full flex justify-center p-2">
                    <button
                        type="submit"
                        className="w-1/4 text-white bg-blue-700 hover:bg-blue-800
              focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center border-2 border-black"
                    >
                        Save Group
                    </button>
                </div>
            </form>

            {showConfirm && (
                <ReConfirmModal
                    isOpen={showConfirm}
                    title="Confirm Details"
                    data={formData}
                    onCancel={() => setShowConfirm(false)}
                    onConfirm={handleSubmit}

                />
            )}

        </div>


    );
};

export default AddGroupForm;
