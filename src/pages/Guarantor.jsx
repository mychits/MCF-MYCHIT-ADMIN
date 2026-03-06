import { useEffect, useState } from "react";
import Sidebar from "../components/layouts/Sidebar";
import Modal from "../components/modals/Modal";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import { Input, Select, Dropdown } from "antd";
import { IoMdMore } from "react-icons/io";
import Navbar from "../components/layouts/Navbar";
import filterOption from "../helpers/filterOption";
import CircularLoader from "../components/loaders/CircularLoader";
import handleGuarantorPrint from "../components/printFormats/GuarantorPrint";
import CustomAlertDialog from "../components/alerts/CustomAlertDialog";
import { Link } from "react-router-dom";
import { fieldSize } from "../data/fieldSize";
import { IoMdClose } from "react-icons/io";

const Guarantor = () => {
  const [users, setUsers] = useState([]);
  const [guarantor, setGuarantor] = useState([]);
  const [TableGuarantor, setTableGuarantor] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [showModalUpdate, setShowModalUpdate] = useState(false);
  const [currentGuarantor, setCurrentGuarantor] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUpdateGuarantor, setCurrentUpdateGuarantor] = useState(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [enrollment, setEnrollment] = useState([]);
  const [alertConfig, setAlertConfig] = useState({
    visibility: false,
    message: "Something went wrong!",
    type: "info",
  });
  const [customRelationship, setCustomRelationship] = useState("");
  const [errors, setErrors] = useState({});
  const [filteredEnrollments, setFilteredEnrollments] = useState([]);

  const [formData, setFormData] = useState({
    user_id: "",
    guarantor_name: "",
    guarantor_email: "",
    user_guarantor: "",
    guarantor_phone_number: "",
    guarantor_address: "",
    guarantor_pincode: "",
    guarantor_adhaar_no: "",
    guarantor_pan_no: "",
    guarantor_gender: "",
    guarantor_marital_status: "",
    guarantor_dateofbirth: "",
    guarantor_nationality: "",
    guarantor_village: "",
    guarantor_taluk: "",
    guarantor_father_name: "",
    guarantor_district: "",
    guarantor_state: "",
    guarantor_description: "",
    enrollment_ids: [],
    guarantor_alternate_number: "",
    guarantor_referred_type: "",
    guarantor_document_name: "",
    guarantor_document: "",
    guarantor_photo: "",
    guarantor_pan_document: "",
    guarantor_aadhar_document: "",
    guarantor_relationship_type: "",
    guarantor_occupation: "",
    guarantor_sector_name: "",
    guarantor_income_document: "",
    guarantor_consent_document: "",
    guarantor_bank_name: "",
    guarantor_bank_account_number: "",
    guarantor_bank_branch: "",
    guarantor_bank_ifsc_code: "",
    guarantor_bank_passbook: "",
    guarantor_bank_passbook_photo: "",
    guarantor_bussiness_type: "",
    guarantor_bussiness_name: "",
    guarantor_bussiness_address: "",
    guarantor_profession_type: "",
    guarantor_agri_rtc_no: "",
    guarantor_land_holdings: "",
    guarantor_occupation_sub: "",
    guarantor_all_document_name: "",
    guarantor_all_document: "",
  });

  const [updateFormData, setUpdateFormData] = useState({
    user_id: "",
    guarantor_name: "",
    guarantor_email: "",
    user_guarantor: "",
    guarantor_phone_number: "",
    guarantor_address: "",
    guarantor_pincode: "",
    guarantor_adhaar_no: "",
    guarantor_pan_no: "",
    guarantor_gender: "",
    guarantor_marital_status: "",
    guarantor_dateofbirth: "",
    guarantor_nationality: "",
    guarantor_village: "",
    guarantor_taluk: "",
    guarantor_father_name: "",
    guarantor_district: "",
    guarantor_state: "",
    guarantor_description: "",
    guarantor_alternate_number: "",
    enrollment_ids: [],
    guarantor_referred_type: "",
    guarantor_document: "",
    guarantor_document_name: "",
    guarantor_photo: "",
    guarantor_pan_document: "",
    guarantor_aadhar_document: "",
    guarantor_relationship_type: "",
    guarantor_occupation: "",
    guarantor_sector_name: "",
    guarantor_income_document: "",
    guarantor_consent_document: "",
    guarantor_bank_name: "",
    guarantor_bank_account_number: "",
    guarantor_bank_branch: "",
    guarantor_bank_ifsc_code: "",
    guarantor_bank_passbook: "",
    guarantor_bank_passbook_photo: "",
    guarantor_bussiness_type: "",
    guarantor_bussiness_name: "",
    guarantor_bussiness_address: "",
    guarantor_profession_type: "",
    guarantor_agri_rtc_no: "",
    guarantor_land_holdings: "",
    guarantor_occupation_sub: "",
    guarantor_all_document_name: "",
    guarantor_all_document: "",
  });

  const [searchText, setSearchText] = useState("");
  const GlobalSearchChangeHandler = (e) => {
    const { value } = e.target;
    setSearchText(value);
  };
  const [extraDocs, setExtraDocs] = useState(
    formData.guarantor_all_document || [
      { document_name: "", file: null, preview: "" },
    ]
  );
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/user/get-user");

        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUsers();
  }, []);

  // const handleExtraDocNameChange = (index, e) => {
  //   const updated = [...extraDocs];
  //   updated[index].document_name = e.target.value;
  //   setExtraDocs(updated);
  //   setFormData({ ...formData, guarantor_all_document: updated });
  // };

  // //  Extra docs - handle file upload
  // const handleExtraDocFileChange = (index, e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     const updated = [...extraDocs];
  //     updated[index].file = file;
  //     updated[index].preview = URL.createObjectURL(file);
  //     setExtraDocs(updated);
  //     setFormData({ ...formData, guarantor_all_document: updated });
  //   }
  // };

  const handleExtraDocNameChange = (index, e) => {
    const updated = [...extraDocs];
    updated[index].document_name = e.target.value;
    setExtraDocs(updated);
  };

  const handleExtraDocFileChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const updated = [...extraDocs];
      updated[index].file = file;
      updated[index].preview = URL.createObjectURL(file);
      setExtraDocs(updated);
    }
  };

  //  Add/remove extra docs
  const addNewDocField = () => {
    setExtraDocs([
      ...extraDocs,
      { document_name: "", file: null, preview: "" },
    ]);
  };

  const removeDocField = (index) => {
    const updated = extraDocs.filter((_, i) => i !== index);
    setExtraDocs(updated);
    setFormData({ ...formData, guarantor_all_document: updated });
  };

  useEffect(() => {
    const fetchEnrollmentData = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/enroll-report/get-enroll-report`);
        if (response.data) {
          setEnrollment(response.data);
        }
      } catch (error) {
        console.error("Error fetching Enrollment data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEnrollmentData();
  }, []);

  useEffect(() => {
    const fetchGuarantor = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/guarantor/get-guarantor-info");
        console.info("guarantor", response.data);
        const guarantors = response.data?.guarantor || [];
        console.info("guarantor", response.data);
        setGuarantor(guarantors);
        const formattedData = guarantors.map((group, index) => {
          const enrollmentDetails = (group?.enrollment_ids || []).map(
            (enroll) => {
              const groupName = enroll?.group_id?.group_name || "N/A";
              const ticket = enroll?.tickets || "N/A";
              return `${groupName} | Ticket: ${ticket}`;
            }
          );

          const guarantor = users.find((u) => u._id === group?.user_guarantor);
          console.info("test-test", guarantor);
          const guarantorName =
            group?.guarantor_referred_type === "Customer"
              ? guarantor?.full_name || "N/A"
              : group?.guarantor_name;

          const guarantorPhone =
            group?.guarantor_referred_type === "Customer"
              ? guarantor?.phone_number || "N/A"
              : group?.guarantor_phone_number;

          return {
            _id: group?._id,
            id: index + 1,
            guarantor_code: group?.guarantor_code,
            user_id: group?.user_id?.full_name,
            enrollment_summary: enrollmentDetails.join(", "),
            guarantor_referred_type: group?.guarantor_referred_type,
            guarantor_name: guarantorName,
            guarantor_phone_number: guarantorPhone,
            guarantor_description: group?.guarantor_description,
            action: (
              <div className="flex justify-center gap-2">
                <Dropdown
                  trigger={["click"]}
                  menu={{
                    items: [
                      {
                        key: "1",
                        label: (
                          <div
                            className="text-green-600"
                            onClick={() => handleUpdateModalOpen(group?._id)}
                          >
                            Edit
                          </div>
                        ),
                      },
                      {
                        key: "2",
                        label: (
                          <div
                            className="text-red-600"
                            onClick={() => handleDeleteModalOpen(group?._id)}
                          >
                            Delete
                          </div>
                        ),
                      },
                      {
                        key: "3",
                        label: (
                          <div
                            onClick={() => handleGuarantorPrint(group?._id)}
                            className=" text-blue-600 "
                          >
                            Print
                          </div>
                        ),
                      },
                    ],
                  }}
                  placement="bottomLeft"
                >
                  <IoMdMore className="text-bold" />
                </Dropdown>
              </div>
            ),
          };
        });

        let fData = formattedData.map((ele) => {
          if (
            ele?.guarantor_address &&
            typeof ele.guarantor_address === "string" &&
            ele?.guarantor_address?.includes(",")
          )
            ele.guarantor_address = ele.guarantor_address.replaceAll(",", " ");
          return ele;
        });
        if (!fData) setTableGuarantor(formattedData);
        if (!fData) setTableGuarantor(formattedData);
        setTableGuarantor(fData);
      } catch (error) {
        console.error("Error fetching Guarantor data:", error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGuarantor();
  }, [reloadTrigger]);

  const handleAntDSelect = (field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
    if (value !== "Other") {
      setCustomRelationship("");
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: "",
    }));
  };
  const handleAntInputDSelect = (field, value) => {
    setUpdateFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));

    setErrors({ ...errors, [field]: "" });
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

//   const validateForm = (type) => {
//     const newErrors = {};
//     const data = type === "addGuarantor" ? formData : updateFormData;

//     const regex = {
//       email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
//       phone: /^[6-9]\d{9}$/,
//       pincode: /^\d{6}$/,
//       adhaar: /^\d{12}$/,
//       pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
//     };

//     if (!data.user_id) newErrors.user_id = "Customer Name is required";
//     if (!data.guarantor_referred_type)
//       newErrors.guarantor_referred_type = "Referred Type is required";
//     if (!data.enrollment_ids || data.enrollment_ids.length === 0)
//       newErrors.enrollment_ids = "Enrollment is required";

//     if (data.guarantor_referred_type === "Customer") {
//       if (!data.user_guarantor)
//         newErrors.user_guarantor = "Referred Customer is required";
//     }
//     if (data.guarantor_referred_type === "Customer") {
//       if (!data.guarantor_description?.trim())
//         newErrors.guarantor_description = "Description is required";
//     }

//     if (data.guarantor_referred_type === "Third Party") {
//       if (!data.guarantor_name?.trim())
//         newErrors.guarantor_name = "Guarantor Name is required";
//       if (!data.guarantor_relationship_type?.trim())
//         newErrors.guarantor_relationship_type =
//           "Guarantor Relationship Customer is required";

//       if (!data.guarantor_phone_number)
//         newErrors.guarantor_phone_number = "Phone Number is required";
//       else if (!regex.phone.test(data.guarantor_phone_number))
//         newErrors.guarantor_phone_number = "Invalid Phone Number";


//       if (!data.guarantor_email)
//         newErrors.guarantor_email = "Email  is required";
//       else if (!regex.email.test(data.guarantor_email))
//         newErrors.guarantor_email = "Invalid Email ";

//       if (!data.guarantor_adhaar_no)
//         newErrors.guarantor_adhaar_no = "Adhaar Number is required";
//       else if (!regex.adhaar.test(data.guarantor_adhaar_no))
//         newErrors.guarantor_adhaar_no = "Invalid Adhaar Number";

//       if (!data.guarantor_pincode)
//         newErrors.guarantor_pincode = "Pincode is required";
//       else if (!regex.pincode.test(data.guarantor_pincode))
//         newErrors.guarantor_pincode = "Invalid Pincode";

//      if (!data.guarantor_pan_no)
//         newErrors.guarantor_pan_no = "Pan Number is required";
//       // else if (!regex.pan.test(data.guarantor_pan_no))
//       //   newErrors.guarantor_pan_no = "Invalid Pan Number";
//        // newErrors.guarantor_pan_no = "Invalid PAN format";


//         if (!data.guarantor_photo || data.guarantor_photo.length === 0) {
//     newErrors.guarantor_photo = "Profile Photo is required";
//   } else if (typeof data.guarantor_photo === "string") {
//     // if it's a URL from DB, allow it
//     if (data.guarantor_photo.trim() === "") {
//       newErrors.guarantor_photo = "Profile Photo is required";
//     }
//   } else if (data.guarantor_photo instanceof File) {
//     // optional: file type & size validation
//     const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
//     if (!allowedTypes.includes(data.guarantor_photo.type)) {
//       newErrors.guarantor_photo = "Only JPG and PNG files are allowed";
//     }
//     if (data.guarantor_photo.size > 2 * 1024 * 1024) {
//       // 2MB limit
//       newErrors.guarantor_photo = "File size must be less than 2MB";
//     }
//   }

//       if (!data.guarantor_pan_document || data.guarantor_pan_document.length === 0) {
//     newErrors.guarantor_pan_document = "Pan Photo is required";
//   } else if (typeof data.guarantor_pan_document === "string") {
//     // if it's a URL from DB, allow it
//     if (data.guarantor_pan_document.trim() === "") {
//       newErrors.guarantor_pan_document = "Pan Photo is required";
//     }
//   } else if (data.guarantor_pan_document instanceof File) {
//     // optional: file type & size validation
//     const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
//     if (!allowedTypes.includes(data.guarantor_pan_document.type)) {
//       newErrors.guarantor_pan_document = "Only JPG and PNG files are allowed";
//     }
//     if (data.guarantor_pan_document.size > 2 * 1024 * 1024) {
//       // 2MB limit
//       newErrors.guarantor_pan_document = "File size must be less than 2MB";
//     }
//   }

//      if (!data.guarantor_aadhar_document || data.guarantor_aadhar_document.length === 0) {
//     newErrors.guarantor_aadhar_document = "Aadhar Photo is required";
//   } else if (typeof data.guarantor_aadhar_document === "string") {
//     // if it's a URL from DB, allow it
//     if (data.guarantor_aadhar_document.trim() === "") {
//       newErrors.guarantor_aadhar_document = "Aadhar Photo is required";
//     }
//   } else if (data.guarantor_aadhar_document instanceof File) {
//     // optional: file type & size validation
//     const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
//     if (!allowedTypes.includes(data.guarantor_aadhar_document.type)) {
//       newErrors.guarantor_aadhar_document = "Only JPG and PNG files are allowed";
//     }
//     if (data.guarantor_aadhar_document.size > 2 * 1024 * 1024) {
//       // 2MB limit
//       newErrors.guarantor_aadhar_document = "File size must be less than 2MB";
//     }
//   }

//    if (!data.guarantor_income_document || data.guarantor_income_document.length === 0) {
//     newErrors.guarantor_income_document = "Occupation Document Photo is required";
//   } else if (typeof data.guarantor_income_document === "string") {
//     // if it's a URL from DB, allow it
//     if (data.guarantor_income_document.trim() === "") {
//       newErrors.guarantor_income_document = "Aadhar Photo is required";
//     }
//   } else if (data.guarantor_income_document instanceof File) {
//     // optional: file type & size validation
//     const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
//     if (!allowedTypes.includes(data.guarantor_income_document.type)) {
//       newErrors.guarantor_income_document = "Only JPG and PNG files are allowed";
//     }
//     if (data.guarantor_income_document.size > 2 * 1024 * 1024) {
//       // 2MB limit
//       newErrors.guarantor_income_document = "File size must be less than 2MB";
//     }
//   }

//       if (!data.guarantor_address?.trim())
//         newErrors.guarantor_address = "Address is required";

//       if (!data.guarantor_occupation)
//         newErrors.guarantor_occupation = "Enter Occupation Details";
//       if (!data.guarantor_profession_type)
//         newErrors.guarantor_profession_type = "Enter Profession Type";

//       if (!data.guarantor_agri_rtc_no)
//         newErrors.guarantor_agri_rtc_no = "Enter Agriculture RTC number";

//       if (!data.guarantor_land_holdings)
//         newErrors.guarantor_land_holdings = "Enter Agriculture land Area";

//       if(!data.guarantor_bank_account_number)
//         newErrors.guarantor_bank_account_number = "Enter Bank Account Number "
//       if(!data.guarantor_bank_branch)
//         newErrors.guarantor_bank_branch = "Enter Bank Branch Name "
//       if(!data.guarantor_bank_ifsc_code)
//         newErrors.guarantor_bank_ifsc_code = "Enter Bank IFSC Code "


//           if (!data.guarantor_bank_passbook_photo || data.guarantor_bank_passbook_photo.length === 0) {
//     newErrors.guarantor_bank_passbook_photo = "Bank PassBook Photo is required";
//   } else if (typeof data.guarantor_bank_passbook_photo === "string") {
//     // if it's a URL from DB, allow it
//     if (data.guarantor_bank_passbook_photo.trim() === "") {
//       newErrors.guarantor_bank_passbook_photo = "Bank PassBook Photo is required";
//     }
//   } else if (data.guarantor_bank_passbook_photo instanceof File) {
//     // optional: file type & size validation
//     const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
//     if (!allowedTypes.includes(data.guarantor_bank_passbook_photo.type)) {
//       newErrors.guarantor_bank_passbook_photo = "Only JPG and PNG files are allowed";
//     }
//     if (data.guarantor_bank_passbook_photo.size > 2 * 1024 * 1024) {
//       // 2MB limit
//       newErrors.guarantor_bank_passbook_photo = "File size must be less than 2MB";
//     }
//   }



//       if(!data.guarantor_bank_name)
//         newErrors.guarantor_bank_name = "Enter Bank Name "

//       if(!data.guarantor_occupation_sub)
//         newErrors.guarantor_occupation_sub = "Enter Occupation Catagory "
      
//       if(!data.guarantor_bussiness_type)
//         newErrors.guarantor_bussiness_type = "Enter Occupation Type is Required  "

// if(!data.guarantor_bussiness_address)
//         newErrors.guarantor_bussiness_address = "Enter Address  "

//       if(!data.guarantor_bussiness_name)
//         newErrors.guarantor_bussiness_name = "Enter Occupation Name is Required "


//       if (!data.guarantor_income)
//         newErrors.guarantor_income = "Guarantor income Details is required";
//     }

//     if (data.guarantor_referred_type === "Property") {
//       if (!data.guarantor_description?.trim())
//         newErrors.guarantor_description = "Description is required";
//     }
//     if (data.guarantor_referred_type === "Customer") {
//       if (!data.guarantor_description?.trim())
//         newErrors.guarantor_description = "Description is required";
//     }
//     if (data.guarantor_referred_type === "Property") {
//       if (!data.guarantor_document_name?.trim())
//         newErrors.guarantor_document_name = "Document Name is required";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

const validateForm = (type) => {
  const newErrors = {};
  const data = type === "addGuarantor" ? formData : updateFormData;

  // Define a single regex object
  const regex = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^[6-9]\d{9}$/,
    pincode: /^\d{6}$/,
    adhaar: /^\d{12}$/,
    pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  };

  // Helper function for file validation
  const validateFile = (file, name) => {
    if (!file) {
      return `${name} is required`;
    }
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (file instanceof File) {
      if (!allowedTypes.includes(file.type)) {
        return "Only JPG and PNG files are allowed";
      }
      if (file.size > 2 * 1024 * 1024) {
        return "File size must be less than 2MB";
      }
    } else if (typeof file === "string" && file.trim() === "") {
      return `${name} is required`;
    }
    return null;
  };

  // General validation for all types
  if (!data.user_id) newErrors.user_id = "Customer Name is required";
  if (!data.guarantor_referred_type) newErrors.guarantor_referred_type = "Referred Type is required";
  if (!data.enrollment_ids || data.enrollment_ids.length === 0) newErrors.enrollment_ids = "Enrollment is required";

  // Conditional validation based on referred type
  if (data.guarantor_referred_type === "Customer") {
    if (!data.user_guarantor) newErrors.user_guarantor = "Referred Customer is required";
    if (!data.guarantor_description?.trim()) newErrors.guarantor_description = "Description is required";
  } else if (data.guarantor_referred_type === "Property") {
    if (!data.guarantor_description?.trim()) newErrors.guarantor_description = "Description is required";
    if (!data.guarantor_document_name?.trim()) newErrors.guarantor_document_name = "Document Name is required";
    let fileError = validateFile(data.guarantor_document, "Property Document Photo");
    if (fileError) newErrors.guarantor_document = fileError;
  } else if (data.guarantor_referred_type === "Third Party") {
    // Personal Information
    if (!data.guarantor_name?.trim()) newErrors.guarantor_name = "Guarantor Name is required";
    if (!data.guarantor_relationship_type?.trim()) newErrors.guarantor_relationship_type = "Guarantor Relationship is required";
    if (!data.guarantor_phone_number || !regex.phone.test(data.guarantor_phone_number)) {
      newErrors.guarantor_phone_number = "Invalid Phone Number";
    }
    if (!data.guarantor_email || !regex.email.test(data.guarantor_email)) {
      newErrors.guarantor_email = "Invalid Email";
    }
    if (!data.guarantor_address?.trim()) newErrors.guarantor_address = "Address is required";
    if (!data.guarantor_pincode || !regex.pincode.test(data.guarantor_pincode)) {
      newErrors.guarantor_pincode = "Invalid Pincode";
    }

    // KYC Documents
    if (!data.guarantor_adhaar_no || !regex.adhaar.test(data.guarantor_adhaar_no)) {
      newErrors.guarantor_adhaar_no = "Invalid Aadhaar Number";
    }
    if (!data.guarantor_pan_no || !regex.pan.test(data.guarantor_pan_no)) {
      newErrors.guarantor_pan_no = "Invalid PAN Capital Alphabet with Number";
    }
    let fileError = validateFile(data.guarantor_photo, "Profile Photo");
    if (fileError) newErrors.guarantor_photo = fileError;
    fileError = validateFile(data.guarantor_pan_document, "PAN Card Photo");
    if (fileError) newErrors.guarantor_pan_document = fileError;
    fileError = validateFile(data.guarantor_aadhar_document, "Aadhaar Card Photo");
    if (fileError) newErrors.guarantor_aadhar_document = fileError;

    // Occupation Details
    if (!data.guarantor_occupation) newErrors.guarantor_occupation = "Occupation is required";
    
    // Conditional validation for Occupation fields
    switch (data.guarantor_occupation) {
      case "Self Employed":
      case "Salaried":
        if (!data.guarantor_bussiness_type?.trim()) newErrors.guarantor_bussiness_type = "Business Type is required";
        if (!data.guarantor_bussiness_name?.trim()) newErrors.guarantor_bussiness_name = "Business Name is required";
        if (!data.guarantor_bussiness_address?.trim()) newErrors.guarantor_bussiness_address = "Business Address is required";
        break;
      case "Professional":
        if (!data.guarantor_profession_type?.trim()) newErrors.guarantor_profession_type = "Profession Type is required";
        if (!data.guarantor_bussiness_address?.trim()) newErrors.guarantor_bussiness_address = "Business Address is required";
        break;
      case "Agri Allied":
        if (!data.guarantor_agri_rtc_no?.trim()) newErrors.guarantor_agri_rtc_no = "RTC Number is required";
        if (!data.guarantor_land_holdings) newErrors.guarantor_land_holdings = "Land Holdings is required";
        if (!data.guarantor_bussiness_address?.trim()) newErrors.guarantor_bussiness_address = "Business Address is required";
        break;
      case "Other":
        if (!data.guarantor_occupation_sub?.trim()) newErrors.guarantor_occupation_sub = "Occupation Sub-category is required";
        if (data.guarantor_occupation_sub === "Running an unregistered Business" && !data.guarantor_bussiness_address?.trim()) {
          newErrors.guarantor_bussiness_address = "Address is required for this occupation";
        }
        break;
      default:
        break;
    }
    fileError = validateFile(data.guarantor_income_document, "Income Document Photo");
    if (fileError) newErrors.guarantor_income_document = fileError;

    // Bank Details
    if (!data.guarantor_bank_name?.trim()) newErrors.guarantor_bank_name = "Bank Name is required";
    if (!data.guarantor_bank_account_number?.trim()) newErrors.guarantor_bank_account_number = "Bank Account Number is required";
    if (!data.guarantor_bank_branch?.trim()) newErrors.guarantor_bank_branch = "Bank Branch is required";
    if (!data.guarantor_bank_ifsc_code?.trim()) newErrors.guarantor_bank_ifsc_code = "Bank IFSC Code is required";
    fileError = validateFile(data.guarantor_bank_passbook_photo, "Bank Passbook Photo");
    if (fileError) newErrors.guarantor_bank_passbook_photo = fileError;
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isvalid = validateForm("addGuarantor");
    if (isvalid) {
      try {
        const fmData = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          if (value instanceof File) {
            fmData.append(key, value); //  actual file
          } else if (Array.isArray(value)) {
            value.forEach((v) => fmData.append(`${key}[]`, v));
          } else if (value) {
            fmData.append(key, value);
          }
        });

        // extraDocs.forEach((doc, i) => {
        //         if (doc.file) {
        //           fmData.append("guarantor_all_document", doc.file);
        //           fmData.append(
        //             "guarantor_all_document_name",
        //             doc.document_name || `Doc_${i + 1}`
        //           );
        //         }
        //       });
        // extraDocs.forEach((doc, i) => {
        //     if (doc.file) {
        //       fmData.append("guarantor_all_document", doc.file); // multiple files
        //       fmData.append("guarantor_all_document", doc.document_name || `Document_${i + 1}`);
        //     }
        //   });

        extraDocs.forEach((doc, i) => {
          if (doc.file) {
            fmData.append("guarantor_all_document", doc.file); // file
            fmData.append(
              "document_name[]",
              doc.document_name || `Document_${i + 1}`
            ); // name separately
          }
        });

        const response = await api.post(
          "/guarantor/add-guarantor-info",
          //formData,
          fmData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        setReloadTrigger((prev) => prev + 1);
        setAlertConfig({
          type: "success",
          message: "Guarantor Added Successfully",
          visibility: true,
        });
        setShowModal(false);
        setFormData({
          user_id: "",
          guarantor_name: "",
          guarantor_email: "",
          user_guarantor: "",
          guarantor_phone_number: "",
          guarantor_address: "",
          guarantor_pincode: "",
          guarantor_adhaar_no: "",
          guarantor_pan_no: "",
          guarantor_gender: "",
          guarantor_marital_status: "",
          guarantor_dateofbirth: "",
          guarantor_nationality: "",
          guarantor_village: "",
          guarantor_taluk: "",
          guarantor_father_name: "",
          guarantor_district: "",
          guarantor_state: "",
          guarantor_description: "",
          enrollment_ids: [],
          guarantor_alternate_number: "",
          guarantor_referred_type: "",
          guarantor_document: "",
          guarantor_document_name: "",
          guarantor_photo: "",
          guarantor_pan_document: "",
          guarantor_aadhar_document: "",
          guarantor_relationship_type: "",
          guarantor_occupation: "",
          guarantor_income: "",
          guarantor_consent_document: "",
          guarantor_bank_name: "",
          guarantor_bank_account_number: "",
          guarantor_bank_branch: "",
          guarantor_bank_ifsc_code: "",
          guarantor_bank_passbook_photo: "",
          guarantor_sector_name: "",
          guarantor_income_document: "",
          guarantor_bussiness_type: "",
          guarantor_bussiness_name: "",
          guarantor_bussiness_address: "",
          guarantor_profession_type: "",
          guarantor_agri_rtc_no: "",
          guarantor_land_holdings: "",
          guarantor_occupation_sub: "",
          guarantor_all_document_name: "",
          guarantor_all_document: "",
        });
      } catch (error) {
        console.error("Error adding Guarantor:", error);
        setAlertConfig({
          type: "error",
          message:
            error?.response?.data?.message || "An unexpected error occurred.",
          visibility: true,
        });
      }
    }
  };

  // const handleUpdate = async (e) => {
  //   e.preventDefault();
  //   try {
  //     const fmData = new FormData();

  //     // append all fields from updateFormData
  //     // Object.entries(updateFormData).forEach(([key, value]) => {
  //     //   if (value) fmData.append(key, value);
  //     // });

  //     const { guarantor_all_document, ...rest } = updateFormData;

  //     // Append non-file fields and existing URLs
  //     Object.entries(rest).forEach(([key, value]) => {
  //       if (value) fmData.append(key, value);
  //     });

  //     // Append new files only if they are of type 'File'
  //     if (updateFormData.guarantor_photo instanceof File) {
  //       fmData.append("guarantor_photo", updateFormData.guarantor_photo);
  //     }
  //     // Repeat this logic for all other single file fields...
  //     if (updateFormData.guarantor_aadhar_document instanceof File) {
  //       fmData.append(
  //         "guarantor_aadhar_document",
  //         updateFormData.guarantor_aadhar_document
  //       );
  //     }

  //     if (extraDocs && Array.isArray(extraDocs)) {
  //       extraDocs.forEach((doc, i) => {
  //         // Check if the item has a file and it's a new file object
  //         if (doc.file instanceof File) {
  //           fmData.append("guarantor_all_document", doc.file);
  //           fmData.append(
  //             "guarantor_all_document",
  //             doc.document_name || `Doc_${i + 1}`
  //           );
  //         }
  //       });
  //     }
  //     await api.put(
  //       `/guarantor/update-guarantor-info/${currentUpdateGuarantor?._id}`,
  //       fmData,
  //       {
  //         headers: { "Content-Type": "multipart/form-data" },
  //       }
  //     );

  //     setShowModalUpdate(false);
  //     setReloadTrigger((prev) => prev + 1);
  //     setAlertConfig({
  //       type: "success",
  //       message: "Guarantor Updated Successfully",
  //       visibility: true,
  //     });
  //   } catch (error) {
  //     console.error("Error updating Guarantor:", error);
  //     setAlertConfig({
  //       type: "error",
  //       message: error?.response?.data?.message || "Update failed",
  //       visibility: true,
  //     });
  //   }
  // };
const handleUpdate = async (e) => {
  e.preventDefault();
  try {
    const fmData = new FormData();

    const { guarantor_all_document, ...rest } = updateFormData;

    // Append non-file fields
    Object.entries(rest).forEach(([key, value]) => {
      if (value) fmData.append(key, value);
    });

    // Handle single file fields
    const singleFileFields = [
      "guarantor_photo",
      "guarantor_aadhar_document",
      "guarantor_pan_document",
      "guarantor_income_document",
      "guarantor_bank_passbook_photo",
      "guarantor_document",
    ];

    singleFileFields.forEach((field) => {
      if (updateFormData[field] instanceof File) {
        fmData.append(field, updateFormData[field]);
      }
    });

    // Handle multiple extra docs
    if (extraDocs && Array.isArray(extraDocs)) {
      extraDocs.forEach((doc, i) => {
        if (doc.file instanceof File) {
          fmData.append("guarantor_all_document", doc.file); // file
          fmData.append(
            "document_name[]", // ✅ send as array
            doc.document_name || `Document_${i + 1}`
          );
        }
      });
    }

    await api.put(
      `/guarantor/update-guarantor-info/${currentUpdateGuarantor?._id}`,
      fmData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    setShowModalUpdate(false);
    setReloadTrigger((prev) => prev + 1);
    setAlertConfig({
      type: "success",
      message: "Guarantor Updated Successfully",
      visibility: true,
    });
  } catch (error) {
    console.error("Error updating Guarantor:", error);
    setAlertConfig({
      type: "error",
      message: error?.response?.data?.message || "Update failed",
      visibility: true,
    });
  }
};

  const columns = [
    { key: "id", header: "SL. NO" },
    {key: "guarantor_code", header: "Guarantor Code"},
    { key: "user_id", header: "Customer Name" },

    { key: "guarantor_referred_type", header: "Referred Type" },
    { key: "enrollment_summary", header: "Enrollment Details" },
    { key: "guarantor_name", header: "Guarantor Name" },
    { key: "guarantor_phone_number", header: "Guarantor Phone Number" },
    // { key: "guarantor_address", header: "Guarantor Address" },
    // { key: "guarantor_pincode", header: "Guarantor Pincode" },
    // { key: "guarantor_description", header: "Guarantor Description" },
    { key: "action", header: "Action" },
  ];

  const filteredGuarantor = users.filter((users) =>
    users.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteModalOpen = async (userId) => {
    try {
      const response = await api.get(
        `/guarantor/get-guarantor-info-by-id/${userId}`
      );
      setCurrentGuarantor(response.data?.guarantor);
      setShowModalDelete(true);
    } catch (error) {
      console.error("Error fetching Guarantor:", error);
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];

    if (file) {
      setFormData((prev) => ({
        ...prev,
        [name]: file, // ✅ keep real file object
        [`${name}_preview`]: URL.createObjectURL(file), // for preview
      }));
    }
  };

  const handleUpdateModalOpen = async (userId) => {
    try {
      const response = await api.get(
        `/guarantor/get-guarantor-info-by-id/${userId}`
      );
      const guarantor = response?.data?.guarantor;
      const matchedEnrollments = (guarantor?.enrollment_ids || []).map((e) => ({
        _id: e._id,
        group_name: e?.group_id?.group_name || "N/A",
        ticket: e?.tickets || "N/A",
      }));
      setFilteredEnrollments(matchedEnrollments);

      setUpdateFormData({
        user_id: guarantor?.user_id?._id || "",
        enrollment_ids: guarantor?.enrollment_ids?.map((e) => e._id) || [],
        guarantor_name: guarantor?.guarantor_name || "",
        guarantor_email: guarantor?.guarantor_email || "",
        guarantor_phone_number: guarantor?.guarantor_phone_number || "",
        user_guarantor: guarantor?.user_guarantor || "",
        guarantor_address: guarantor?.guarantor_address || "",
        guarantor_pincode: guarantor?.guarantor_pincode || "",
        guarantor_adhaar_no: guarantor?.guarantor_adhaar_no || "",
        guarantor_pan_no: guarantor?.guarantor_pan_no || "",
        guarantor_gender: guarantor?.guarantor_gender || "",
        guarantor_marital_status: guarantor?.guarantor_marital_status || "",
        guarantor_dateofbirth: guarantor?.guarantor_dateofbirth || "",
        guarantor_nationality: guarantor?.guarantor_nationality || "",
        guarantor_village: guarantor?.guarantor_village || "",
        guarantor_taluk: guarantor?.guarantor_taluk || "",
        guarantor_father_name: guarantor?.guarantor_father_name || "",
        guarantor_district: guarantor?.guarantor_district || "",
        guarantor_state: guarantor?.guarantor_state || "",
        guarantor_description: guarantor?.guarantor_description || "",
        guarantor_alternate_number: guarantor?.guarantor_alternate_number,
        guarantor_document: guarantor?.guarantor_document || "",
        guarantor_document_name: guarantor?.guarantor_document_name || "",
        guarantor_referred_type: guarantor?.guarantor_referred_type || "",
        guarantor_photo: guarantor?.guarantor_photo || "",
        guarantor_pan_document: guarantor?.guarantor_pan_document || "",
        guarantor_aadhar_document: guarantor?.guarantor_aadhar_document || "",
        guarantor_relationship_type:
          guarantor?.guarantor_relationship_type || "",
        guarantor_occupation: guarantor?.guarantor_occupation || "",
        guarantor_income: guarantor?.guarantor_income || "",
        guarantor_consent_document: guarantor?.guarantor_consent_document || "",
        guarantor_bank_name: guarantor?.guarantor_bank_name || "",
        guarantor_bank_account_number:
          guarantor?.guarantor_bank_account_number || "",
        guarantor_bank_branch: guarantor?.guarantor_bank_branch || "",
        guarantor_bank_ifsc_code: guarantor?.guarantor_bank_ifsc_code || "",
        guarantor_bank_passbook_photo:
          guarantor?.guarantor_bank_passbook_photo || "",
        guarantor_income_document: guarantor.guarantor_income_document || "",
        guarantor_bussiness_type: guarantor.guarantor_bussiness_type || "",
        guarantor_bussiness_name: guarantor.guarantor_bussiness_name || "",
        guarantor_bussiness_address:
          guarantor?.guarantor_bussiness_address || "",
        guarantor_profession_type: guarantor?.guarantor_profession_type || "",
        guarantor_agri_rtc_no: guarantor?.guarantor_agri_rtc_no || "",
        guarantor_land_holdings: guarantor?.guarantor_land_holdings || "",
        guarantor_occupation_sub: guarantor?.guarantor_occupation_sub || "",
        guarantor_all_document_name:
          guarantor?.guarantor_all_document_name || "",
        guarantor_all_document: guarantor?.guarantor_all_document || "",
      });
      setExtraDocs(
        (guarantor?.guarantor_all_document || []).map((d) => ({
          document_name: d.document_name,
          file: null, // no new file yet
          preview: d.document_url, // show existing file preview
          existingUrl: d.document_url, // keep original in case user doesn’t replace
        }))
      );

      setCurrentUpdateGuarantor(guarantor);
      setShowModalUpdate(true);
      setErrors({});
    } catch (error) {
      console.error("Error fetching Guarantor:", error);
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrors((prevData) => ({
      ...prevData,
      [name]: "",
    }));
  };

  const handleDeleteGuarantor = async () => {
    if (currentGuarantor) {
      try {
        await api.delete(
          `/guarantor/delete-guarantor-info-by-id/${currentGuarantor._id}`
        );

        setAlertConfig({
          visibility: true,
          message: "guarantor deleted successfully",
          type: "success",
        });
        setReloadTrigger((prev) => prev + 1);
        setShowModalDelete(false);
        setCurrentGuarantor(null);
      } catch (error) {
        console.error("Error deleting Guarantor:", error);
      }
    }
  };

  return (
    <>
      <div>
        <div className="flex mt-20">
          <Sidebar />
          <Navbar
            onGlobalSearchChangeHandler={GlobalSearchChangeHandler}
            visibility={true}
          />
          <CustomAlertDialog
            type={alertConfig.type}
            isVisible={alertConfig.visibility}
            message={alertConfig.message}
            onClose={() =>
              setAlertConfig((prev) => ({ ...prev, visibility: false }))
            }
          />

          <div className="flex-grow p-7">
            <div className="mt-6 mb-8">
              <div className="flex justify-between items-center w-full">
                <h1 className="text-2xl font-semibold">Guarantor</h1>

                <button
                  onClick={() => {
                    setShowModal(true);
                    setErrors({});
                  }}
                  className="ml-4 bg-blue-950 text-white px-4 py-2 rounded shadow-md hover:bg-blue-800 transition duration-200"
                >
                  + Add Guarantor
                </button>
              </div>
            </div>
            {TableGuarantor?.length > 0 && !isLoading ? (
              <DataTable
                catcher="_id"
                updateHandler={handleUpdateModalOpen}
                data={filterOption(TableGuarantor, searchText)}
                columns={columns}
                exportedPdfName="Guarantor"
                exportedFileName={`Guarantor.csv`}
              />
            ) : (
              <CircularLoader
                isLoading={isLoading}
                failure={TableGuarantor.length <= 0}
                data="Guarantor Data"
              />
            )}
          </div>
        </div>
        <Modal isVisible={showModal} onClose={() => setShowModal(false)}>
          <div className="py-6 px-5 lg:px-8 text-left">
            <h3 className="mb-4 text-xl font-bold text-gray-900">
              Add Guarantor
            </h3>
            <form
              className="space-y-6"
              method="POST"
              onSubmit={handleSubmit}
              enctype="multipart/form-data"
              noValidate
            >
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <Select
                  className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  placeholder="Select Or Search Customer"
                  showSearch
                  value={formData.user_id || undefined}
                  onChange={(value) => {
                    setFormData((prev) => ({
                      ...prev,
                      user_id: value,
                      enrollment_ids: [],
                    }));

                    const filtered = enrollment
                      .filter((e) => e.user_id?._id === value)
                      .map((e) => ({
                        _id: e._id,
                        group_name: e.group_id?.group_name,
                        ticket: e.tickets,
                      }));

                    setFilteredEnrollments(filtered);
                  }}
                  filterOption={(input, option) =>
                    option?.children
                      ?.toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  {Array.from(
                    new Map(
                      enrollment
                        .filter((e) => e.user_id && e.user_id.full_name?.trim())
                        .map((e) => [e.user_id._id, e.user_id])
                    ).values()
                  ).map((user) => (
                    <Select.Option key={user._id} value={user._id}>
                      {user.full_name}
                    </Select.Option>
                  ))}
                </Select>
                {errors.user_id && (
                  <p className="mt-2 text-sm text-red-600">{errors.user_id}</p>
                )}
              </div>
              <div className="mt-4">
                <label className="block mb-2 text-sm font-medium text-gray-900">
                  Select Enrollment <span className="text-red-500">*</span>
                </label>
                <Select
                  mode="tags"
                  allowClear
                  placeholder="Select enrollments"
                  className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  value={formData.enrollment_ids}
                  onChange={(selectedEnrollmentIds) => {
                    setFormData((prev) => ({
                      ...prev,
                      enrollment_ids: selectedEnrollmentIds,
                    }));
                  }}
                  filterOption={(input, option) =>
                    option?.label?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {filteredEnrollments.map((en) => {
                    const parts = [];
                    if (en.group_name && en.group_name !== "N/A")
                      parts.push(en.group_name);
                    if (en.ticket && en.ticket !== "N/A")
                      parts.push(`Ticket: ${en.ticket}`);
                    return (
                      <Select.Option key={en._id} value={en._id}>
                        {parts.join(" | ")}
                      </Select.Option>
                    );
                  })}
                </Select>

                {errors.enrollment_ids && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.enrollment_ids}
                  </p>
                )}
              </div>

              <div className="w-full">
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="referred_type"
                >
                  Select Referred Type <span className="text-red-500 ">*</span>
                </label>
                <Select
                  className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  placeholder="Select Referred Type"
                  popupMatchSelectWidth={false}
                  showSearch
                  name="guarantor_referred_type"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                  value={formData?.guarantor_referred_type || undefined}
                  onChange={(value) =>
                    handleAntDSelect("guarantor_referred_type", value)
                  }
                >
                  {["Customer", "Third Party", "Property"].map((refType) => (
                    <Select.Option key={refType} value={refType}>
                      {refType}
                    </Select.Option>
                  ))}
                </Select>
                {errors.guarantor_referred_type && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.guarantor_referred_type}
                  </p>
                )}
              </div>

              {formData.guarantor_referred_type === "Customer" && (
                <div className="w-full">
                  <div className="w-full mb-4">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="category"
                    >
                      Select Guarantor Customer{" "}
                      <span className="text-red-500 ">*</span>
                    </label>

                    <Select
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                      placeholder="Select Or Search Referred Guarantor"
                      popupMatchSelectWidth={false}
                      showSearch
                      name="user_guarantor"
                      filterOption={(input, option) =>
                        option.children
                          .toString()
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      value={formData?.user_guarantor || undefined}
                      onChange={(value) =>
                        handleAntDSelect("user_guarantor", value)
                      }
                    >
                      {users.map((user) => (
                        <Select.Option key={user._id} value={user._id}>
                          {user.full_name}
                        </Select.Option>
                      ))}
                    </Select>
                    {errors.user_guarantor && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.user_guarantor}
                      </p>
                    )}
                  </div>
                  <div className="w-full">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="desc"
                    >
                      Description <span className="text-red-500 ">*</span>
                    </label>
                    <Input
                      type="text"
                      name="guarantor_description"
                      value={formData.guarantor_description}
                      onChange={handleChange}
                      id="name"
                      placeholder="Enter the Description"
                      required
                      className={`bg-gray-50 border ${fieldSize.height} border-gray-300 text-gray-900 text-sm rounded-lg w-full`}
                    />
                    {errors.guarantor_description && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.guarantor_description}
                      </p>
                    )}
                  </div>
                </div>
              )}
              {formData.guarantor_referred_type === "Third Party" && (
                <div className="space-y-6 mt-6">
                  {/* Personal Information Card */}
                  <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-md">
                    <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
                      Personal Information
                    </h2>

                    {/* Guarantor Name & Phone */}
                    <div className="flex flex-row justify-between space-x-4 mt-4">
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Guarantor Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="text"
                          name="guarantor_name"
                          value={formData.guarantor_name}
                          onChange={handleChange}
                          placeholder="Enter Guarantor Name"
                          required
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                        />
                        {errors.guarantor_name && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_name}
                          </p>
                        )}
                      </div>
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="text"
                          name="guarantor_phone_number"
                          value={formData.guarantor_phone_number}
                          onChange={handleChange}
                          placeholder="Enter Phone Number"
                          required
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                        />
                        {errors.guarantor_phone_number && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_phone_number}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Customer Relationship */}
                    <div className="flex flex-row justify-between space-x-4 mt-4">
                      <div className="w-full">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Select Customer Relationship
                        </label>
                        <Select
                          className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                          placeholder="Select Customer Relationship"
                          showSearch
                          name="guarantor_relationship_type"
                          filterOption={(input, option) =>
                            option.children
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          value={
                            formData.guarantor_relationship_type || undefined
                          }
                          onChange={(value) =>
                            handleAntDSelect(
                              "guarantor_relationship_type",
                              value
                            )
                          }
                        >
                          {["Father", "Spouse", "Other"].map((rel) => (
                            <Select.Option key={rel} value={rel}>
                              {rel}
                            </Select.Option>
                          ))}
                        </Select>
                        {errors.guarantor_relationship_type && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_relationship_type}
                          </p>
                        )}
                      </div>

                      {formData.guarantor_relationship_type === "Other" && (
                        <div className="w-full">
                          <label className="block mb-2 text-sm font-medium text-gray-900">
                            Please specify the relationship:
                          </label>
                          <input
                            type="text"
                            className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5"
                            placeholder="Enter custom relationship"
                            value={customRelationship}
                            onChange={(e) =>
                              setCustomRelationship(e.target.value)
                            }
                          />
                        </div>
                      )}
                    </div>

                    {/* Email & DOB */}
                    <div className="flex flex-row justify-between space-x-4 mt-4">
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Email
                        </label>
                        <Input
                          type="email"
                          name="guarantor_email"
                          value={formData.guarantor_email}
                          onChange={handleChange}
                          placeholder="Enter Email"
                          required
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                        />
                        {errors.guarantor_email && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_email}
                          </p>
                        )}
                      </div>
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Date of Birth
                        </label>
                        <Input
                          type="date"
                          name="guarantor_dateofbirth"
                          value={
                            formData.guarantor_dateofbirth
                              ? new Date(formData.guarantor_dateofbirth)
                                  .toISOString()
                                  .split("T")[0]
                              : ""
                          }
                          onChange={handleChange}
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                        />
                      </div>
                    </div>

                    {/* Marital Status & Gender */}
                    <div className="flex flex-row justify-between space-x-4 mt-4">
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Marital Status
                        </label>
                        <Select
                          className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                          placeholder="Select Marital Status"
                          showSearch
                          name="guarantor_marital_status"
                          filterOption={(input, option) =>
                            option.children
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          value={formData.guarantor_marital_status || undefined}
                          onChange={(value) =>
                            handleAntDSelect("guarantor_marital_status", value)
                          }
                        >
                          {["Married", "Unmarried", "Widow", "Divorced"].map(
                            (status) => (
                              <Select.Option key={status} value={status}>
                                {status}
                              </Select.Option>
                            )
                          )}
                        </Select>
                      </div>
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Gender
                        </label>
                        <Select
                          className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                          placeholder="Select Gender"
                          showSearch
                          name="guarantor_gender"
                          filterOption={(input, option) =>
                            option.children
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          value={formData.guarantor_gender || undefined}
                          onChange={(value) =>
                            handleAntDSelect("guarantor_gender", value)
                          }
                        >
                          {["Male", "Female"].map((g) => (
                            <Select.Option key={g} value={g}>
                              {g}
                            </Select.Option>
                          ))}
                        </Select>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="mt-4">
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        Address <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        name="guarantor_address"
                        value={formData.guarantor_address}
                        onChange={handleChange}
                        placeholder="Enter the Address"
                        required
                        className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                      />
                      {errors.guarantor_address && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.guarantor_address}
                        </p>
                      )}
                    </div>

                    {/* Village & Taluk */}
                    <div className="flex flex-row justify-between space-x-4 mt-4">
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Village
                        </label>
                        <Input
                          type="text"
                          name="guarantor_village"
                          value={formData.guarantor_village}
                          onChange={handleChange}
                          placeholder="Enter Village"
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        />
                      </div>
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Taluk
                        </label>
                        <Input
                          type="text"
                          name="guarantor_taluk"
                          value={formData.guarantor_taluk}
                          onChange={handleChange}
                          placeholder="Enter Taluk"
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        />
                      </div>
                    </div>

                    {/* State & District */}
                    <div className="flex flex-row justify-between space-x-4 mt-4">
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          State
                        </label>
                        <Select
                          className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                          placeholder="Select State"
                          showSearch
                          name="guarantor_state"
                          filterOption={(input, option) =>
                            option.children
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          value={formData.guarantor_state || undefined}
                          onChange={(value) =>
                            handleAntDSelect("guarantor_state", value)
                          }
                        >
                          {["Karnataka", "Maharashtra", "Tamil Nadu"].map(
                            (state) => (
                              <Select.Option key={state} value={state}>
                                {state}
                              </Select.Option>
                            )
                          )}
                        </Select>
                      </div>
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          District
                        </label>
                        <Input
                          type="text"
                          name="guarantor_district"
                          value={formData.guarantor_district}
                          onChange={handleChange}
                          placeholder="Enter District"
                          className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        />
                      </div>
                    </div>

                    {/* Pincode & Father Name */}
                    <div className="flex flex-row justify-between space-x-4 mt-4">
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Pincode <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="text"
                          name="guarantor_pincode"
                          value={formData.guarantor_pincode}
                          onChange={handleChange}
                          placeholder="Enter Pincode"
                          required
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        />
                        {errors.guarantor_pincode && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_pincode}
                          </p>
                        )}
                      </div>
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Father Name
                        </label>
                        <Input
                          type="text"
                          name="guarantor_father_name"
                          value={formData.guarantor_father_name}
                          onChange={handleChange}
                          placeholder="Enter Father Name"
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        />
                      </div>
                    </div>

                    {/* Nationality & Alternate Number */}
                    <div className="flex flex-row justify-between space-x-4 mt-4">
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Nationality
                        </label>
                        <Select
                          className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                          placeholder="Select Nationality"
                          showSearch
                          name="guarantor_nationality"
                          filterOption={(input, option) =>
                            option.children
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          value={formData.guarantor_nationality || undefined}
                          onChange={(value) =>
                            handleAntDSelect("guarantor_nationality", value)
                          }
                        >
                          {["Indian", "Other"].map((nation) => (
                            <Select.Option key={nation} value={nation}>
                              {nation}
                            </Select.Option>
                          ))}
                        </Select>
                      </div>
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Alternate Phone Number
                        </label>
                        <Input
                          type="text"
                          name="guarantor_alternate_number"
                          value={formData.guarantor_alternate_number}
                          onChange={handleChange}
                          placeholder="Enter Alternate Number"
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        />
                      </div>
                    </div>
                  </div>

                  {/* KYC Documents Card */}
                  <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-md">
                    <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
                      KYC Documents
                    </h2>

                    {/* Aadhaar & PAN Number */}
                    <div className="flex flex-row justify-between space-x-4">
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Aadhaar Number <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="text"
                          name="guarantor_adhaar_no"
                          value={formData.guarantor_adhaar_no}
                          onChange={handleChange}
                          placeholder="Enter Aadhaar Number"
                          required
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        />
                        {errors.guarantor_adhaar_no && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_adhaar_no}
                          </p>
                        )}
                      </div>
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          PAN Number <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="text"
                          name="guarantor_pan_no"
                          value={formData.guarantor_pan_no}
                          onChange={handleChange}
                          placeholder="Enter PAN Number"
                          required
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        />
                        {errors.guarantor_pan_no && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_pan_no}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Profile Photo */}
                    <div className="mt-4">
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        Profile Photo <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="file"
                        name="guarantor_photo"
                        onChange={handleFileChange}
                        accept="image/*"
                        required
                        className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                      />
                      {errors.guarantor_photo && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_photo}
                          </p>
                        )}
                      {formData.guarantor_photo && (
                        <Link to={formData.guarantor_photo} download>
                          <img
                            src={formData.guarantor_photo_preview}
                            alt="Profile"
                            className="w-56 h-56 object-cover mt-4 rounded-md shadow"
                          />
                        </Link>
                      )}
                      
                    </div>

                    {/* PAN & Aadhaar Docs */}
                    <div className="flex flex-row justify-between space-x-4 mt-6">
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          PAN Card Photo <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="file"
                          name="guarantor_pan_document"
                          onChange={handleFileChange}
                          accept="image/*"
                          required
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        />
                        {errors.guarantor_pan_document && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_pan_document}
                          </p>
                        )}
                        {formData.guarantor_pan_document && (
                          <Link to={formData.guarantor_pan_document} download>
                            <img
                              src={formData.guarantor_pan_document_preview}
                              alt="PAN"
                              className="w-56 h-56 object-cover mt-4 rounded-md shadow"
                            />
                          </Link>
                        )}
                        
                      </div>
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Aadhaar Card Photo{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="file"
                          name="guarantor_aadhar_document"
                          onChange={handleFileChange}
                          accept="image/*"
                          required
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        />
                        {errors.guarantor_aadhar_document && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_aadhar_document}
                          </p>
                        )}
                        {formData.guarantor_aadhar_document && (
                          <Link
                            to={formData.guarantor_aadhar_document}
                            download
                          >
                            <img
                              src={formData.guarantor_aadhar_document_preview}
                              alt=""
                              className="w-56 h-56 object-cover mt-4 rounded-md shadow"
                            />
                          </Link>
                        )}
                      </div>
                    </div>

                    {/*  Extra Dynamic Documents Section */}
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-2">
                        Additional Documents
                      </h3>
                      {extraDocs.map((doc, index) => (
                        <div
                          key={index}
                          className="mb-6 p-3 border border-gray-200 rounded-lg bg-gray-50"
                        >
                          {/* Row for inputs + remove button */}
                          <div className="flex items-center space-x-4">
                            <Input
                              type="text"
                              placeholder="Document Name (e.g. Passport, Voter ID)"
                              value={doc.document_name}
                              onChange={(e) =>
                                handleExtraDocNameChange(index, e)
                              }
                              className="w-1/2 h-12 border border-gray-300 rounded-lg p-2"
                            />
                            <input
                              type="file"
                              name="guarantor_all_document" // ⚠️ must match multer config
                              onChange={(e) =>
                                handleExtraDocFileChange(index, e)
                              }
                              accept="image/*"
                              className="w-1/2 h-12 border border-gray-300 rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeDocField(index)}
                              className="text-blue-600 font-bold text-xl"
                            >
                              <IoMdClose />
                            </button>
                          </div>

                          {/* Preview shown below */}
                          {doc.preview && (
                            <div className="mt-4">
                              <img
                                src={doc.preview}
                                alt={doc.document_name}
                                className="w-56 h-56 object-cover rounded-md shadow"
                              />
                            </div>
                          )}
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={addNewDocField}
                        className="mt-2 px-2 py-1 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
                      >
                        + Add Document
                      </button>
                    </div>
                  </div>

                  <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-md">
                    <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
                      Occupation Details
                    </h2>

                    <div className="flex flex-row justify-between space-x-4">
                      {/* Left Column: Occupation & Dynamic Fields */}
                      <div className="w-full">
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          Guarantor Occupation
                        </label>

                        {/* Main Occupation Select */}
                        <Select
                          className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                          placeholder="Select Occupation"
                          showSearch
                          value={formData.guarantor_occupation || undefined}
                          onChange={(value) => {
                            // Reset related fields when occupation changes
                            setFormData((prev) => ({
                              ...prev,
                              guarantor_occupation: value,
                              guarantor_occupation_sub: "",
                              guarantor_bussiness_type: "",
                              guarantor_bussiness_name: "",
                              guarantor_bussiness_address: "",
                              guarantor_profession_type: "",
                              guarantor_agri_rtc_no: "",
                              guarantor_land_holdings: "",
                            }));
                          }}
                          filterOption={(input, option) =>
                            option.children
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                        >
                          {[
                            "Self Employed",
                            "Salaried",
                            "Professional",
                            "Agri Allied",
                            "Other",
                          ].map((occ) => (
                            <Select.Option key={occ} value={occ}>
                              {occ}
                            </Select.Option>
                          ))}
                        </Select>
                        {errors.guarantor_occupation && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_occupation}
                          </p>
                        )}
                        {/* Sub-option for "Other" */}
                        {formData.guarantor_occupation === "Other" && (
                          <>
                            <div className="mt-4 w-full">
                              <label className="block mb-2 text-sm font-medium text-gray-900">
                                Please specify Occupation:
                              </label>
                              <Select
                                className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                                placeholder="Select Sub-Category"
                                showSearch
                                value={
                                  formData.guarantor_occupation_sub || undefined
                                }
                                onChange={(value) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    guarantor_occupation_sub: value,
                                  }))
                                }
                                filterOption={(input, option) =>
                                  option.children
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                                }
                              >
                                {[
                                  "House Wife",
                                  "Retired",
                                  "Student",
                                  "Investment",
                                  "Running an unregistered Business",
                                ].map((sub) => (
                                  <Select.Option key={sub} value={sub}>
                                    {sub}
                                  </Select.Option>
                                ))}
                              </Select>
                              {errors.guarantor_occupation_sub && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_occupation_sub}
                          </p>
                        )}
                            </div>
                            <div className="w-full">
                              <label className="block mb-2 text-sm font-medium text-gray-700">
                                Address
                              </label>
                              <Input
                                type="text"
                                name="guarantor_bussiness_address"
                                value={formData.guarantor_bussiness_address}
                                onChange={handleChange}
                                placeholder="Enter  Address"
                                className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-3 focus:ring-blue-500 focus:border-blue-500"
                              />
                               {errors.guarantor_bussiness_address && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_bussiness_address}
                          </p>
                        )}
                            </div>
                          </>
                        )}

                        {/* Self Employed & Salaried: Business Type, Name, Address */}
                        {["Self Employed", "Salaried"].includes(
                          formData.guarantor_occupation
                        ) && (
                          <div className="mt-4 space-y-4">
                            <div className="w-full">
                              <label className="block mb-2 text-sm font-medium text-gray-700">
                                Business Type
                              </label>
                              <Input
                                type="text"
                                name="guarantor_bussiness_type"
                                value={formData.guarantor_bussiness_type}
                                onChange={handleChange}
                                placeholder="e.g., Retail, Manufacturing"
                                className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-3 focus:ring-blue-500 focus:border-blue-500"
                              />
                              {errors.guarantor_bussiness_type && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_bussiness_type}
                          </p>
                        )}
                            </div>
                            <div className="w-full">
                              <label className="block mb-2 text-sm font-medium text-gray-700">
                                Business Name
                              </label>
                              <Input
                                type="text"
                                name="guarantor_bussiness_name"
                                value={formData.guarantor_bussiness_name}
                                onChange={handleChange}
                                placeholder="Enter Business Name"
                                className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-3 focus:ring-blue-500 focus:border-blue-500"
                              />
                              {errors.guarantor_bussiness_name && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_bussiness_name}
                          </p>
                        )}
                            </div>
                            <div className="w-full">
                              <label className="block mb-2 text-sm font-medium text-gray-700">
                                Address
                              </label>
                              <Input
                                type="text"
                                name="guarantor_bussiness_address"
                                value={formData.guarantor_bussiness_address}
                                onChange={handleChange}
                                placeholder="Enter Address"
                                className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-3 focus:ring-blue-500 focus:border-blue-500"
                              />
                              {errors.guarantor_bussiness_address && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_bussiness_address}
                          </p>
                        )}
                            </div>
                          </div>
                        )}

                        {/* Professional: Profession Type + Business Address */}
                        {formData.guarantor_occupation === "Professional" && (
                          <div className="mt-4 space-y-4">
                            <div className="w-full">
                              <label className="block mb-2 text-sm font-medium text-gray-700">
                                Profession Type
                              </label>
                              <Input
                                type="text"
                                name="guarantor_profession_type"
                                value={formData.guarantor_profession_type}
                                onChange={handleChange}
                                placeholder="e.g., Doctor, CA, Engineer"
                                className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-3 focus:ring-blue-500 focus:border-blue-500"
                              />
                              {errors.guarantor_profession_type && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_profession_type}
                          </p>
                        )}
                            </div>
                            <div className="w-full">
                              <label className="block mb-2 text-sm font-medium text-gray-700">
                                Address
                              </label>
                              <Input
                                type="text"
                                name="guarantor_bussiness_address"
                                value={formData.guarantor_bussiness_address}
                                onChange={handleChange}
                                placeholder="Clinic/Office Address"
                                className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-3 focus:ring-blue-500 focus:border-blue-500"
                              />
                              {errors.guarantor_bussiness_address && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_bussiness_address}
                          </p>
                        )}
                            </div>
                          </div>
                        )}

                        {/* Agri Allied: RTC No, Land Holdings, Business Address */}
                        {formData.guarantor_occupation === "Agri Allied" && (
                          <div className="mt-4 w-full space-y-4">
                            <div className="w-full">
                              <label className="block mb-2 text-sm font-medium text-gray-700">
                                RTC No / Land Record ID
                              </label>
                              <Input
                                type="text"
                                name="guarantor_agri_rtc_no"
                                value={formData.guarantor_agri_rtc_no}
                                onChange={handleChange}
                                placeholder="Enter RTC Number"
                                className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-3 focus:ring-blue-500 focus:border-blue-500"
                              />
                              {errors.guarantor_agri_rtc_no && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_agri_rtc_no}
                          </p>
                        )}
                            </div>
                            <div className="w-full">
                              <label className="block mb-2 text-sm font-medium text-gray-700">
                                Land Holdings (in acres)
                              </label>
                              <Input
                                type="number"
                                name="guarantor_land_holdings"
                                value={formData.guarantor_land_holdings}
                                onChange={handleChange}
                                placeholder="e.g., 5.5"
                                className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-3 focus:ring-blue-500 focus:border-blue-500"
                              />
                              {errors.guarantor_land_holdings && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_land_holdings}
                          </p>
                        )}
                            </div>
                            <div className="w-full">
                              <label className="block mb-2 text-sm font-medium text-gray-700">
                                Address
                              </label>
                              <Input
                                type="text"
                                name="guarantor_bussiness_address"
                                value={formData.guarantor_bussiness_address}
                                onChange={handleChange}
                                placeholder="Farm or Operation Address"
                                className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-3 focus:ring-blue-500 focus:border-blue-500"
                              />
                              {errors.guarantor_bussiness_address && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_bussiness_address}
                          </p>
                        )}
                            </div>
                          </div>
                        )}

                        {/* For "Other" → Only show Business Address if "Running an unregistered Business" */}
                        {formData.guarantor_occupation === "Other" &&
                          formData.guarantor_occupation_sub ===
                            "Running an unregistered Business" && (
                            <div className=" w-full mt-4">
                              <label className="block mb-2 text-sm font-medium text-gray-700">
                                Address
                              </label>
                              <Input
                                type="text"
                                name="guarantor_bussiness_address"
                                value={formData.guarantor_bussiness_address}
                                onChange={handleChange}
                                placeholder="Enter Address"
                                className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-3 focus:ring-blue-500 focus:border-blue-500"
                              />
                              {errors.guarantor_bussiness_address && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_bussiness_address}
                          </p>
                        )}
                            </div>
                          )}
                      </div>
                    </div>

                    {/* Document Upload Section */}
                    <div className="mt-6">
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                       Salary/Income Document Photo <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="file"
                        name="guarantor_income_document"
                        onChange={handleFileChange}
                        accept="image/*"
                        required
                        className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-3 hover:bg-gray-100 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {errors.guarantor_income_document && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_income_document}
                          </p>
                        )}
                      {formData.guarantor_income_document && (
                        <Link to={formData.guarantor_income_document} download>
                          <img
                            src={formData.guarantor_income_document_preview}
                            alt="Income Document"
                            className="w-56 h-56 object-cover mt-4 rounded-md shadow-md border"
                          />
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Bank Details Card */}
                  <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-md">
                    <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
                      Bank Details
                    </h2>

                    <div className="flex flex-row justify-between space-x-4">
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Bank Name
                        </label>
                        <Input
                          type="text"
                          name="guarantor_bank_name"
                          value={formData.guarantor_bank_name}
                          onChange={handleChange}
                          placeholder="Enter Bank Name"
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        />
                        {errors.guarantor_bank_name && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_bank_name}
                          </p>
                        )}
                      </div>
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Bank Account Number
                        </label>
                        <Input
                          type="text"
                          name="guarantor_bank_account_number"
                          value={formData.guarantor_bank_account_number}
                          onChange={handleChange}
                          placeholder="Enter Account Number"
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        />
                        {errors.guarantor_bank_account_number && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_bank_account_number}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-row justify-between space-x-4 mt-4">
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Bank Branch
                        </label>
                        <Input
                          type="text"
                          name="guarantor_bank_branch"
                          value={formData.guarantor_bank_branch}
                          onChange={handleChange}
                          placeholder="Enter Branch"
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        />
                        {errors.guarantor_bank_branch && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_bank_branch}
                          </p>
                        )}
                      </div>
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Bank IFSC Code
                        </label>
                        <Input
                          type="text"
                          name="guarantor_bank_ifsc_code"
                          value={formData.guarantor_bank_ifsc_code}
                          onChange={handleChange}
                          placeholder="Enter IFSC Code"
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        />
                        {errors.guarantor_bank_ifsc_code && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_bank_ifsc_code}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-6">
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        Bank Passbook <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="file"
                        name="guarantor_bank_passbook_photo"
                        onChange={handleFileChange}
                        accept="image/*"
                        required
                        className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                      />
                      {errors.guarantor_bank_passbook_photo && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_bank_passbook_photo}
                          </p>
                        )}
                      {formData.guarantor_bank_passbook_photo && (
                        <Link
                          to={formData.guarantor_bank_passbook_photo}
                          download
                        >
                          <img
                            src={formData.guarantor_bank_passbook_photo_preview}
                            alt="Passbook"
                            className="w-56 h-56 object-cover mt-4 rounded-md shadow"
                          />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {formData.guarantor_referred_type === "Property" && (
                <>
                  <div>
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="email"
                    >
                      Property Name <span className="text-red-500 ">*</span>
                    </label>
                    <Input
                      type="text"
                      name="guarantor_document_name"
                      value={formData.guarantor_document_name}
                      onChange={handleChange}
                      id="name"
                      placeholder="Enter the Description"
                      required
                      className={`bg-gray-50 border ${fieldSize.height} border-gray-300 text-gray-900 text-sm rounded-lg w-full`}
                    />
                    {errors.guarantor_document_name && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.guarantor_document_name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="guarantor_document"
                    >
                      Property Document <span className="text-red-500 ">*</span>
                    </label>
                    <Input
                      type="file"
                      name="guarantor_document"
                      //  value={formData.guarantor_document}
                      onChange={handleFileChange}
                      id="guarantor_document"
                      accept="image/*"
                      placeholder="Upload Document"
                      required
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                    />
                     {errors.guarantor_document && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.guarantor_document}
                      </p>
                    )}
                   {formData.guarantor_document && (
                        <Link to={formData.guarantor_document} download>
                          <img
                            src={formData.guarantor_document_preview}
                            alt="Property"
                            className="w-56 h-56 object-cover mt-4 rounded-md shadow"
                          />
                        </Link>
                      )}
                  </div>
                  <div>
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="email"
                    >
                      Description <span className="text-red-500 ">*</span>
                    </label>
                    <Input
                      type="text"
                      name="guarantor_description"
                      value={formData.guarantor_description}
                      onChange={handleChange}
                      id="name"
                      placeholder="Enter the Description"
                      required
                      className={`bg-gray-50 border ${fieldSize.height} border-gray-300 text-gray-900 text-sm rounded-lg w-full`}
                    />
                    {errors.guarantor_description && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.guarantor_description}
                      </p>
                    )}
                  </div>
                </>
              )}

              <div className="w-full flex justify-end">
                <button
                  type="submit"
                  className="w-1/4 text-white bg-blue-700 hover:bg-blue-800 border-2 border-black
              focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                  Save Guarantor
                </button>
              </div>
            </form>
          </div>
        </Modal>
        <Modal
          isVisible={showModalUpdate}
          onClose={() => setShowModalUpdate(false)}
        >
          <div className="py-6 px-5 lg:px-8 text-left">
            <h3 className="mb-4 text-xl font-bold text-gray-900">
              Update Guarantor
            </h3>
            <form className="space-y-6" onSubmit={handleUpdate} noValidate>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <Select
                  className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  placeholder="Select Or Search Customer"
                  showSearch
                  value={updateFormData.user_id || ""}
                  onChange={(value) => {
                    setUpdateFormData((prev) => ({
                      ...prev,
                      user_id: value,
                      enrollment_ids: [], // reset selected enrollments
                    }));

                    const filtered = enrollment
                      .filter((e) => e.user_id?._id === value)
                      .map((e) => ({
                        _id: e._id,
                        group_name: e.group_id?.group_name,
                        ticket: e.tickets,
                      }));

                    setFilteredEnrollments(filtered);
                  }}
                  filterOption={(input, option) =>
                    option?.label?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {enrollment
                    .filter((e) => e.user_id && e.user_id.full_name?.trim()) // removes empty or invalid names
                    .map((e) => (
                      <Select.Option key={e.user_id._id} value={e.user_id._id}>
                        {e.user_id.full_name}
                      </Select.Option>
                    ))}
                </Select>
                {errors.user_id && (
                  <p className="mt-2 text-sm text-red-600">{errors.user_id}</p>
                )}
              </div>
              <div className="mt-4">
                <label className="block mb-2 text-sm font-medium text-gray-900">
                  Select Enrollment <span className="text-red-500">*</span>
                </label>
                <Select
                  mode="tags"
                  allowClear
                  placeholder="Select enrollments"
                  className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  value={updateFormData.enrollment_ids}
                  onChange={(selectedEnrollmentIds) => {
                    setUpdateFormData((prev) => ({
                      ...prev,
                      enrollment_ids: selectedEnrollmentIds,
                    }));
                  }}
                  filterOption={(input, option) =>
                    option?.label?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {filteredEnrollments.map((en) => {
                    const parts = [];
                    if (en.group_name && en.group_name !== "N/A")
                      parts.push(en.group_name);
                    if (en.ticket && en.ticket !== "N/A")
                      parts.push(`Ticket: ${en.ticket}`);
                    return (
                      <Select.Option key={en._id} value={en._id}>
                        {parts.join(" | ")}
                      </Select.Option>
                    );
                  })}
                </Select>
                {errors.enrollment_ids && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.enrollment_ids}
                  </p>
                )}
              </div>

              <div className="w-full">
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="referred_type"
                >
                  Select Referred Type <span className="text-red-500 ">*</span>
                </label>
                <Select
                  className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  placeholder="Select Referred Type"
                  popupMatchSelectWidth={false}
                  showSearch
                  name="guarantor_referred_type"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                  value={updateFormData?.guarantor_referred_type || undefined}
                  onChange={(value) =>
                    handleAntInputDSelect("guarantor_referred_type", value)
                  }
                >
                  {["Customer", "Third Party", "Property"].map((refType) => (
                    <Select.Option key={refType} value={refType}>
                      {refType}
                    </Select.Option>
                  ))}
                </Select>
                {errors.guarantor_referred_type && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.guarantor_referred_type}
                  </p>
                )}
              </div>

              {updateFormData.guarantor_referred_type === "Customer" && (
                <div className="w-full">
                  <div className="w-full mb-4">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="category"
                    >
                      Select Guarantor Customer{" "}
                      <span className="text-red-500 ">*</span>
                    </label>

                    <Select
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                      placeholder="Select Or Search Referred Customer"
                      popupMatchSelectWidth={false}
                      showSearch
                      name="user_guarantor"
                      filterOption={(input, option) =>
                        option.children
                          .toString()
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      value={updateFormData?.user_guarantor || undefined}
                      onChange={(value) =>
                        handleAntInputDSelect("user_guarantor", value)
                      }
                    >
                      {users.map((user) => (
                        <Select.Option key={user._id} value={user._id}>
                          {user.full_name}
                        </Select.Option>
                      ))}
                    </Select>
                    {errors.user_guarantor && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.user_guarantor}
                      </p>
                    )}
                  </div>
                  <div className="w-full">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="email"
                    >
                      Description <span className="text-red-500 ">*</span>
                    </label>
                    <Input
                      type="text"
                      name="guarantor_description"
                      value={updateFormData.guarantor_description}
                      onChange={handleInputChange}
                      id="name"
                      placeholder="Enter the Description"
                      required
                      className={`bg-gray-50 border ${fieldSize.height} border-gray-300 text-gray-900 text-sm rounded-lg w-full`}
                    />
                    {errors.guarantor_description && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.guarantor_description}
                      </p>
                    )}
                  </div>
                </div>
              )}
              {updateFormData.guarantor_referred_type === "Third Party" && (
                <div className="space-y-6 mt-6">
                  {/* Personal Information Card */}
                  <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-md">
                    <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
                      Personal Information
                    </h2>

                    {/* Guarantor Name & Phone */}
                    <div className="flex flex-row justify-between space-x-4 mt-4">
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Guarantor Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="text"
                          name="guarantor_name"
                          value={updateFormData.guarantor_name}
                          onChange={handleInputChange}
                          placeholder="Enter Guarantor Name"
                          required
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                        />
                        {errors.guarantor_name && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_name}
                          </p>
                        )}
                      </div>

                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="text"
                          name="guarantor_phone_number"
                          value={updateFormData.guarantor_phone_number}
                          onChange={handleInputChange}
                          placeholder="Enter Phone Number"
                          required
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                        />
                        {errors.guarantor_phone_number && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_phone_number}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Customer Relationship */}
                    <div className="flex flex-row justify-between space-x-4 mt-4">
                      <div className="w-full">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Select Customer Relationship
                        </label>
                        <Select
                          className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                          placeholder="Select Customer Relationship"
                          showSearch
                          name="guarantor_relationship_type"
                          filterOption={(input, option) =>
                            option.children
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          value={
                            updateFormData.guarantor_relationship_type ||
                            undefined
                          }
                          onChange={(value) =>
                            handleAntInputDSelect(
                              "guarantor_relationship_type",
                              value
                            )
                          }
                        >
                          {["Father", "Spouse", "Other"].map((rel) => (
                            <Select.Option key={rel} value={rel}>
                              {rel}
                            </Select.Option>
                          ))}
                        </Select>
                        {errors.guarantor_relationship_type && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_relationship_type}
                          </p>
                        )}
                      </div>

                      {updateFormData.guarantor_relationship_type ===
                        "Other" && (
                        <div className="w-full">
                          <label className="block mb-2 text-sm font-medium text-gray-900">
                            Please specify the relationship:
                          </label>
                          <input
                            type="text"
                            className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5"
                            placeholder="Enter custom relationship"
                            value={customRelationship}
                            onChange={(e) =>
                              setCustomRelationship(e.target.value)
                            }
                          />
                        </div>
                      )}
                    </div>

                    {/* Email & DOB */}
                    <div className="flex flex-row justify-between space-x-4 mt-4">
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Email
                        </label>
                        <Input
                          type="email"
                          name="guarantor_email"
                          value={updateFormData.guarantor_email}
                          onChange={handleInputChange}
                          placeholder="Enter Email"
                          required
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                        />
                        {errors.guarantor_email && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_email}
                          </p>
                        )}
                      </div>
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Date of Birth
                        </label>
                        <Input
                          type="date"
                          name="guarantor_dateofbirth"
                          value={
                            updateFormData.guarantor_dateofbirth
                              ? new Date(updateFormData.guarantor_dateofbirth)
                                  .toISOString()
                                  .split("T")[0]
                              : ""
                          }
                          onChange={handleInputChange}
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                        />
                      </div>
                    </div>

                    {/* Marital Status & Gender */}
                    <div className="flex flex-row justify-between space-x-4 mt-4">
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Marital Status
                        </label>
                        <Select
                          className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                          placeholder="Select Marital Status"
                          showSearch
                          name="guarantor_marital_status"
                          filterOption={(input, option) =>
                            option.children
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          value={
                            updateFormData.guarantor_marital_status || undefined
                          }
                          onChange={(value) =>
                            handleAntInputDSelect(
                              "guarantor_marital_status",
                              value
                            )
                          }
                        >
                          {["Married", "Unmarried", "Widow", "Divorced"].map(
                            (status) => (
                              <Select.Option key={status} value={status}>
                                {status}
                              </Select.Option>
                            )
                          )}
                        </Select>
                      </div>
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Gender
                        </label>
                        <Select
                          className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                          placeholder="Select Gender"
                          showSearch
                          name="guarantor_gender"
                          filterOption={(input, option) =>
                            option.children
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          value={updateFormData.guarantor_gender || undefined}
                          onChange={(value) =>
                            handleAntInputDSelect("guarantor_gender", value)
                          }
                        >
                          {["Male", "Female"].map((g) => (
                            <Select.Option key={g} value={g}>
                              {g}
                            </Select.Option>
                          ))}
                        </Select>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="mt-4">
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        Address <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        name="guarantor_address"
                        value={updateFormData.guarantor_address}
                        onChange={handleInputChange}
                        placeholder="Enter the Address"
                        required
                        className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                      />
                      {errors.guarantor_address && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.guarantor_address}
                        </p>
                      )}
                    </div>

                    {/* Village & Taluk */}
                    <div className="flex flex-row justify-between space-x-4 mt-4">
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Village
                        </label>
                        <Input
                          type="text"
                          name="guarantor_village"
                          value={updateFormData.guarantor_village}
                          onChange={handleInputChange}
                          placeholder="Enter Village"
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        />
                      </div>
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Taluk
                        </label>
                        <Input
                          type="text"
                          name="guarantor_taluk"
                          value={updateFormData.guarantor_taluk}
                          onChange={handleInputChange}
                          placeholder="Enter Taluk"
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        />
                      </div>
                    </div>

                    {/* State & District */}
                    <div className="flex flex-row justify-between space-x-4 mt-4">
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          State
                        </label>
                        <Select
                          className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                          placeholder="Select State"
                          showSearch
                          name="guarantor_state"
                          filterOption={(input, option) =>
                            option.children
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          value={updateFormData.guarantor_state || undefined}
                          onChange={(value) =>
                            handleAntInputDSelect("guarantor_state", value)
                          }
                        >
                          {["Karnataka", "Maharashtra", "Tamil Nadu"].map(
                            (state) => (
                              <Select.Option key={state} value={state}>
                                {state}
                              </Select.Option>
                            )
                          )}
                        </Select>
                      </div>
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          District
                        </label>
                        <Input
                          type="text"
                          name="guarantor_district"
                          value={updateFormData.guarantor_district}
                          onChange={handleInputChange}
                          placeholder="Enter District"
                          className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        />
                      </div>
                    </div>

                    {/* Pincode & Father Name */}
                    <div className="flex flex-row justify-between space-x-4 mt-4">
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Pincode <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="text"
                          name="guarantor_pincode"
                          value={updateFormData.guarantor_pincode}
                          onChange={handleInputChange}
                          placeholder="Enter Pincode"
                          required
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        />
                        {errors.guarantor_pincode && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_pincode}
                          </p>
                        )}
                      </div>
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Father Name
                        </label>
                        <Input
                          type="text"
                          name="guarantor_father_name"
                          value={updateFormData.guarantor_father_name}
                          onChange={handleInputChange}
                          placeholder="Enter Father Name"
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        />
                      </div>
                    </div>

                    {/* Nationality & Alternate Number */}
                    <div className="flex flex-row justify-between space-x-4 mt-4">
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Nationality
                        </label>
                        <Select
                          className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                          placeholder="Select Nationality"
                          showSearch
                          name="guarantor_nationality"
                          filterOption={(input, option) =>
                            option.children
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          value={
                            updateFormData.guarantor_nationality || undefined
                          }
                          onChange={(value) =>
                            handleAntInputDSelect(
                              "guarantor_nationality",
                              value
                            )
                          }
                        >
                          {["Indian", "Other"].map((nation) => (
                            <Select.Option key={nation} value={nation}>
                              {nation}
                            </Select.Option>
                          ))}
                        </Select>
                      </div>
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Alternate Phone Number
                        </label>
                        <Input
                          type="text"
                          name="guarantor_alternate_number"
                          value={updateFormData.guarantor_alternate_number}
                          onChange={handleInputChange}
                          placeholder="Enter Alternate Number"
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        />
                      </div>
                    </div>
                  </div>

                  {/* KYC Documents Card */}
                  <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-md">
                    <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
                      KYC Documents
                    </h2>

                    {/* Aadhaar & PAN Number */}
                    <div className="flex flex-row justify-between space-x-4">
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Aadhaar Number <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="text"
                          name="guarantor_adhaar_no"
                          value={updateFormData.guarantor_adhaar_no}
                          onChange={handleInputChange}
                          placeholder="Enter Aadhaar Number"
                          required
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        />
                        {errors.guarantor_adhaar_no && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_adhaar_no}
                          </p>
                        )}
                      </div>
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          PAN Number <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="text"
                          name="guarantor_pan_no"
                          value={updateFormData.guarantor_pan_no}
                          onChange={handleInputChange}
                          placeholder="Enter PAN Number"
                          required
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        />
                        {errors.guarantor_pan_no && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_pan_no}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Profile Photo */}
                    <div className="mt-4">
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        Profile Photo <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="file"
                        name="guarantor_photo"
                        onChange={handleFileChange}
                        accept="image/*"
                        required
                        className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                      />
                       {errors.guarantor_photo && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_photo}
                          </p>
                        )}
                      {updateFormData.guarantor_photo && (
                        <Link to={updateFormData.guarantor_photo} download>
                          <img
                            src={updateFormData.guarantor_photo}
                            alt="Profile"
                            className="w-56 h-56 object-cover mt-4 rounded-md shadow"
                          />
                        </Link>
                      )}
                    </div>

                    {/* PAN & Aadhaar Docs */}
                    <div className="flex flex-row justify-between space-x-4 mt-6">
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          PAN Card Photo <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="file"
                          name="guarantor_pan_document"
                          onChange={handleFileChange}
                          accept="image/*"
                          required
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        />
                        {errors.guarantor_pan_document && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_pan_document}
                          </p>
                        )}
                        {updateFormData.guarantor_pan_document && (
                          <Link
                            to={updateFormData.guarantor_pan_document}
                            download
                          >
                            <img
                              src={updateFormData.guarantor_pan_document}
                              alt="PAN"
                              className="w-56 h-56 object-cover mt-4 rounded-md shadow"
                            />
                          </Link>
                        )}
                      </div>
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Aadhaar Card Photo{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="file"
                          name="guarantor_aadhar_document"
                          onChange={handleFileChange}
                          accept="image/*"
                          required
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        />
                        {errors.guarantor_aadhar_document && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_aadhar_document}
                          </p>
                        )}
                        {updateFormData.guarantor_aadhar_document && (
                          <Link
                            to={updateFormData.guarantor_aadhar_document}
                            download
                          >
                            <img
                              src={updateFormData.guarantor_aadhar_document}
                              alt=""
                              className="w-56 h-56 object-cover mt-4 rounded-md shadow"
                            />
                          </Link>
                        )}
                      </div>
                    </div>

                    {/*  Extra Dynamic Documents Section */}
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-2">
                        Additional Documents
                      </h3>
                      {extraDocs.map((doc, index) => (
                        <div
                          key={index}
                          className="mb-6 p-3 border border-gray-200 rounded-lg bg-gray-50"
                        >
                          {/* Row for inputs + remove button */}
                          <div className="flex items-center space-x-4">
                            <Input
                              type="text"
                              placeholder="Document Name (e.g. Passport, Voter ID)"
                              value={doc.document_name}
                              onChange={(e) =>
                                handleExtraDocNameChange(index, e)
                              }
                              className="w-1/2 h-12 border border-gray-300 rounded-lg p-2"
                            />
                            <input
                              type="file"
                              name="guarantor_all_document" // ⚠️ must match multer config
                              onChange={(e) =>
                                handleExtraDocFileChange(index, e)
                              }
                              accept="image/*"
                              className="w-1/2 h-12 border border-gray-300 rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeDocField(index)}
                              className="text-blue-600 font-bold text-xl"
                            >
                              <IoMdClose />
                            </button>
                          </div>

                          {/* Preview shown below */}
                          {doc.preview && (
                            <div className="mt-4">
                              <img
                                src={doc.preview}
                                alt={doc.document_name}
                                className="w-56 h-56 object-cover rounded-md shadow"
                              />
                            </div>
                          )}
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={addNewDocField}
                        className="mt-2 px-2 py-1 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
                      >
                        + Add Document
                      </button>
                    </div>
                  </div>

                  {/* Income Details Card */}
                  {/* <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-md">
                    <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
                      Income Details
                    </h2>

                    <div className="flex flex-row justify-between space-x-4">
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          Guarantor Occupation
                        </label>
                        <Input
                          type="text"
                          name="guarantor_occupation"
                          value={formData.guarantor_occupation}
                          onChange={handleChange}
                          placeholder="Enter Occupation"
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-3 hover:bg-gray-100 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <Select
                          className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                          placeholder="guarantor_occupation"
                          showSearch
                          name="guarantor_occupation"
                          filterOption={(input, option) =>
                            option.children
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          value={formData.guarantor_occupation || undefined}
                          onChange={(value) =>
                            handleAntDSelect("guarantor_occupation", value)
                          }
                        >
                          {["Self Employed","Salaried","Professional", "Agri Allied", "Other"].map((nation) => (
                            <Select.Option key={nation} value={nation}>
                              {nation}
                            </Select.Option>
                          ))}
                        </Select>
                        {formData.guarantor_occupation === "Other" && (
                        <div className="w-full">
                          <label className="block mb-2 text-sm font-medium text-gray-900">
                            Please specify Occupation:
                          </label>
                          <Select
                          className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                          placeholder="guarantor_occupation"
                          showSearch
                          name="guarantor_occupation"
                          filterOption={(input, option) =>
                            option.children
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          value={formData.guarantor_occupation || undefined}
                          onChange={(value) =>
                            handleAntDSelect("guarantor_occupation", value)
                          }
                        >
                          {["House Wife","Retired","Student", "Investment", "Running an unregistered Bussiness"].map((nation) => (
                            <Select.Option key={nation} value={nation}>
                              {nation}
                            </Select.Option>
                          ))}
                        </Select>
                        </div>
                      )}
                      </div>
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          Guarantor Sector
                        </label>
                        <Input
                          type="text"
                          name="guarantor_sector_name"
                          value={formData.guarantor_sector_name}
                          onChange={handleChange}
                          placeholder="Enter Working Sector"
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-3 hover:bg-gray-100 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="mt-6">
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Document Photo <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="file"
                        name="guarantor_income_document"
                        onChange={handleFileChange}
                        accept="image/*"
                        required
                        className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-3 hover:bg-gray-100 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {formData.guarantor_income_document && (
                        <Link to={formData.guarantor_income_document} download>
                          <img
                            src={formData.guarantor_income_document}
                            alt="Income Document"
                            className="w-56 h-56 object-cover mt-4 rounded-md shadow-md border"
                          />
                        </Link>
                      )}
                    </div>
                  </div> */}
                  <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-md">
                    <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
                      Occupation Details
                    </h2>

                    <div className="flex flex-row justify-between space-x-4">
                      {/* Left Column: Occupation & Dynamic Fields */}
                      <div className="w-full">
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          Guarantor Occupation
                        </label>

                        {/* Main Occupation Select */}
                        <Select
                          className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                          placeholder="Select Occupation"
                          showSearch
                          value={
                            updateFormData.guarantor_occupation || undefined
                          }
                          onChange={(value) => {
                            // Reset related fields when occupation changes
                            setUpdateFormData((prev) => ({
                              ...prev,
                              guarantor_occupation: value,
                              guarantor_occupation_sub: "",
                              guarantor_bussiness_type: "",
                              guarantor_bussiness_name: "",
                              guarantor_bussiness_address: "",
                              guarantor_profession_type: "",
                              guarantor_agri_rtc_no: "",
                              guarantor_land_holdings: "",
                            }));
                          }}
                          filterOption={(input, option) =>
                            option.children
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                        >
                          {[
                            "Self Employed",
                            "Salaried",
                            "Professional",
                            "Agri Allied",
                            "Other",
                          ].map((occ) => (
                            <Select.Option key={occ} value={occ}>
                              {occ}
                            </Select.Option>
                          ))}
                        </Select>
                        {errors.guarantor_occupation && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_occupation}
                          </p>
                        )}

                        {/* Sub-option for "Other" */}
                        {updateFormData.guarantor_occupation === "Other" && (
                          <>
                            <div className="mt-4 w-full">
                              <label className="block mb-2 text-sm font-medium text-gray-900">
                                Please specify Occupation:
                              </label>
                              <Select
                                className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                                placeholder="Select Sub-Category"
                                showSearch
                                value={
                                  updateFormData.guarantor_occupation_sub ||
                                  undefined
                                }
                                onChange={(value) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    guarantor_occupation_sub: value,
                                  }))
                                }
                                filterOption={(input, option) =>
                                  option.children
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                                }
                              >
                                {[
                                  "House Wife",
                                  "Retired",
                                  "Student",
                                  "Investment",
                                  "Running an unregistered Business",
                                ].map((sub) => (
                                  <Select.Option key={sub} value={sub}>
                                    {sub}
                                  </Select.Option>
                                ))}
                              </Select>
                              {errors.guarantor_occupation_sub && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_occupation_sub}
                          </p>
                        )}
                            </div>
                            <div className="w-full">
                              <label className="block mb-2 text-sm font-medium text-gray-700">
                                Address
                              </label>
                              <Input
                                type="text"
                                name="guarantor_bussiness_address"
                                value={
                                  updateFormData.guarantor_bussiness_address
                                }
                                onChange={handleInputChange}
                                placeholder="Enter Address"
                                className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-3 focus:ring-blue-500 focus:border-blue-500"
                              />
                              {errors.guarantor_bussiness_address && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_bussiness_address}
                          </p>
                        )}
                            </div>
                          </>
                        )}

                        {/* Self Employed & Salaried: Business Type, Name, Address */}
                        {["Self Employed", "Salaried"].includes(
                          updateFormData.guarantor_occupation
                        ) && (
                          <div className="mt-4 space-y-4">
                            <div className="w-full">
                              <label className="block mb-2 text-sm font-medium text-gray-700">
                                Business Type
                              </label>
                              <Input
                                type="text"
                                name="guarantor_bussiness_type"
                                value={updateFormData.guarantor_bussiness_type}
                                onChange={handleInputChange}
                                placeholder="e.g., Retail, Manufacturing"
                                className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-3 focus:ring-blue-500 focus:border-blue-500"
                              />
                              {errors.guarantor_bussiness_type && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_bussiness_type}
                          </p>
                        )}
                            </div>
                            <div className="w-full">
                              <label className="block mb-2 text-sm font-medium text-gray-700">
                                Business Name
                              </label>
                              <Input
                                type="text"
                                name="guarantor_bussiness_name"
                                value={updateFormData.guarantor_bussiness_name}
                                onChange={handleInputChange}
                                placeholder="Enter Business Name"
                                className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-3 focus:ring-blue-500 focus:border-blue-500"
                              />
                              {errors.guarantor_bussiness_name && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_bussiness_name}
                          </p>
                        )}
                            </div>
                            <div className="w-full">
                              <label className="block mb-2 text-sm font-medium text-gray-700">
                                Address
                              </label>
                              <Input
                                type="text"
                                name="guarantor_bussiness_address"
                                value={
                                  updateFormData.guarantor_bussiness_address
                                }
                                onChange={handleInputChange}
                                placeholder="Enter Address"
                                className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-3 focus:ring-blue-500 focus:border-blue-500"
                              />
                              {errors.guarantor_bussiness_address && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_bussiness_address}
                          </p>
                        )}
                            </div>
                          </div>
                        )}

                        {/* Professional: Profession Type + Business Address */}
                        {updateFormData.guarantor_occupation ===
                          "Professional" && (
                          <div className="mt-4 space-y-4">
                            <div className="w-full">
                              <label className="block mb-2 text-sm font-medium text-gray-700">
                                Profession Type
                              </label>
                              <Input
                                type="text"
                                name="guarantor_profession_type"
                                value={updateFormData.guarantor_profession_type}
                                onChange={handleInputChange}
                                placeholder="e.g., Doctor, CA, Engineer"
                                className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-3 focus:ring-blue-500 focus:border-blue-500"
                              />
                              {errors.guarantor_profession_type && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_profession_type}
                          </p>
                        )}
                            </div>
                            <div className="w-full">
                              <label className="block mb-2 text-sm font-medium text-gray-700">
                                Address
                              </label>
                              <Input
                                type="text"
                                name="guarantor_bussiness_address"
                                value={
                                  updateFormData.guarantor_bussiness_address
                                }
                                onChange={handleInputChange}
                                placeholder="Clinic/Office Address"
                                className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-3 focus:ring-blue-500 focus:border-blue-500"
                              />
                              {errors.guarantor_bussiness_address && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_bussiness_address}
                          </p>
                        )}
                            </div>
                          </div>
                        )}

                        {/* Agri Allied: RTC No, Land Holdings, Business Address */}
                        {updateFormData.guarantor_occupation ===
                          "Agri Allied" && (
                          <div className="mt-4 w-full space-y-4">
                            <div className="w-full">
                              <label className="block mb-2 text-sm font-medium text-gray-700">
                                RTC No / Land Record ID
                              </label>
                              <Input
                                type="text"
                                name="guarantor_agri_rtc_no"
                                value={updateFormData.guarantor_agri_rtc_no}
                                onChange={handleInputChange}
                                placeholder="Enter RTC Number"
                                className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-3 focus:ring-blue-500 focus:border-blue-500"
                              />
                               {errors.guarantor_agri_rtc_no && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_agri_rtc_no}
                          </p>
                        )}
                            </div>
                            <div className="w-full">
                              <label className="block mb-2 text-sm font-medium text-gray-700">
                                Land Holdings (in acres)
                              </label>
                              <Input
                                type="number"
                                name="guarantor_land_holdings"
                                value={updateFormData.guarantor_land_holdings}
                                onChange={handleInputChange}
                                placeholder="e.g., 5.5"
                                className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-3 focus:ring-blue-500 focus:border-blue-500"
                              />
                              {errors.guarantor_land_holdings && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_land_holdings}
                          </p>
                        )}
                            </div>
                            <div className="w-full">
                              <label className="block mb-2 text-sm font-medium text-gray-700">
                                Address
                              </label>
                              <Input
                                type="text"
                                name="guarantor_bussiness_address"
                                value={
                                  updateFormData.guarantor_bussiness_address
                                }
                                onChange={handleInputChange}
                                placeholder="Farm or Operation Address"
                                className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-3 focus:ring-blue-500 focus:border-blue-500"
                              />
                              {errors.guarantor_bussiness_address && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_bussiness_address}
                          </p>
                        )}
                            </div>
                          </div>
                        )}

                        {/* For "Other" → Only show Business Address if "Running an unregistered Business" */}
                        {updateFormData.guarantor_occupation === "Other" &&
                          updateFormData.guarantor_occupation_sub ===
                            "Running an unregistered Business" && (
                            <div className=" w-full mt-4">
                              <label className="block mb-2 text-sm font-medium text-gray-700">
                                Address
                              </label>
                              <Input
                                type="text"
                                name="guarantor_bussiness_address"
                                value={
                                  updateFormData.guarantor_bussiness_address
                                }
                                onChange={handleInputChange}
                                placeholder="Enter Address"
                                className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-3 focus:ring-blue-500 focus:border-blue-500"
                              />
                               {errors.guarantor_bussiness_address && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_bussiness_address}
                          </p>
                        )}
                            </div>
                          )}
                      </div>
                    </div>

                    {/* Document Upload Section */}
                    <div className="mt-6">
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                       Salary/Income Document Photo <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="file"
                        name="guarantor_income_document"
                        onChange={handleFileChange}
                        accept="image/*"
                        required
                        className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-3 hover:bg-gray-100 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {errors.guarantor_income_document && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_income_document}
                          </p>
                        )}
                      {updateFormData.guarantor_income_document && (
                        <Link
                          to={updateFormData.guarantor_income_document}
                          download
                        >
                          <img
                            src={updateFormData.guarantor_income_document}
                            alt="Income Document"
                            className="w-56 h-56 object-cover mt-4 rounded-md shadow-md border"
                          />
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Bank Details Card */}
                  <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-md">
                    <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
                      Bank Details
                    </h2>

                    <div className="flex flex-row justify-between space-x-4">
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Bank Name
                        </label>
                        <Input
                          type="text"
                          name="guarantor_bank_name"
                          value={updateFormData.guarantor_bank_name}
                          onChange={handleInputChange}
                          placeholder="Enter Bank Name"
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        />
                        {errors.guarantor_bank_name && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_bank_name}
                          </p>
                        )}
                      </div>
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Bank Account Number
                        </label>
                        <Input
                          type="text"
                          name="guarantor_bank_account_number"
                          value={updateFormData.guarantor_bank_account_number}
                          onChange={handleInputChange}
                          placeholder="Enter Account Number"
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        />
                        {errors.guarantor_bank_account_number && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_bank_account_number}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-row justify-between space-x-4 mt-4">
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Bank Branch
                        </label>
                        <Input
                          type="text"
                          name="guarantor_bank_branch"
                          value={updateFormData.guarantor_bank_branch}
                          onChange={handleInputChange}
                          placeholder="Enter Branch"
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        />
                        {errors.guarantor_bank_branch && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_bank_branch}
                          </p>
                        )}
                      </div>
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Bank IFSC Code
                        </label>
                        <Input
                          type="text"
                          name="guarantor_bank_ifsc_code"
                          value={updateFormData.guarantor_bank_ifsc_code}
                          onChange={handleInputChange}
                          placeholder="Enter IFSC Code"
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        />
                        {errors.guarantor_bank_ifsc_code && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_bank_ifsc_code}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-6">
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        Bank Passbook <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="file"
                        name="guarantor_bank_passbook_photo"
                        onChange={handleFileChange}
                        accept="image/*"
                        required
                        className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                      />
                      {errors.guarantor_bank_passbook_photo && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.guarantor_bank_passbook_photo}
                          </p>
                        )}
                      {updateFormData.guarantor_bank_passbook_photo && (
                        <Link
                          to={updateFormData.guarantor_bank_passbook_photo}
                          download
                        >
                          <img
                            src={updateFormData.guarantor_bank_passbook_photo}
                            alt="Passbook"
                            className="w-56 h-56 object-cover mt-4 rounded-md shadow"
                          />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {updateFormData.guarantor_referred_type === "Property" && (
                <>
                  <div>
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="email"
                    >
                      Property Name <span className="text-red-500 ">*</span>
                    </label>
                    <Input
                      type="text"
                      name="guarantor_document_name"
                      value={updateFormData.guarantor_document_name}
                      onChange={handleInputChange}
                      id="name"
                      placeholder="Enter the Description"
                      required
                      className={`bg-gray-50 border ${fieldSize.height} border-gray-300 text-gray-900 text-sm rounded-lg w-full`}
                    />
                    {errors.guarantor_document_name && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.guarantor_document_name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="email"
                    >
                      Property Document <span className="text-red-500 ">*</span>
                    </label>
                    <Input
                      type="file"
                      name="guarantor_document"
                      //  value={formData.guarantor_document}
                      onChange={handleFileChange}
                      id="guarantor_document"
                      accept="image/*"
                      placeholder="Upload Document"
                      required
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                    />
                     {errors.guarantor_document && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.guarantor_document}
                      </p>
                    )}
                    {updateFormData.guarantor_document && (
                        <Link
                          to={updateFormData.guarantor_document}
                          download
                        >
                          <img
                            src={updateFormData.guarantor_document}
                            alt="Property"
                            className="w-56 h-56 object-cover mt-4 rounded-md shadow"
                          />
                        </Link>
                      )}
                  </div>
                  <div>
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="description"
                    >
                      Description <span className="text-red-500 ">*</span>
                    </label>
                    <Input
                      type="text"
                      name="guarantor_description"
                      value={updateFormData.guarantor_description}
                      onChange={handleInputChange}
                      id="description"
                      placeholder="Enter the Description"
                      required
                      className={`bg-gray-50 border ${fieldSize.height} border-gray-300 text-gray-900 text-sm rounded-lg w-full`}
                    />
                    {errors.guarantor_description && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.guarantor_description}
                      </p>
                    )}
                  </div>
                </>
              )}

              <div className="w-full flex justify-end">
                <button
                  type="submit"
                  className="w-1/4 text-white bg-blue-700 hover:bg-blue-800 border-2 border-black
              focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </Modal>
        <Modal
          isVisible={showModalDelete}
          onClose={() => {
            setShowModalDelete(false);
            setCurrentGuarantor(null);
          }}
        >
          <div className="py-6 px-5 lg:px-8 text-left">
            <h3 className="mb-4 text-xl font-bold text-gray-900">
              Delete Guarantor
            </h3>
            {currentGuarantor && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleDeleteGuarantor();
                }}
                className="space-y-6"
              >
                <div>
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="groupName"
                  >
                    Please enter{" "}
                    <span className="text-primary font-bold">
                      {currentGuarantor.guarantor_name}
                    </span>{" "}
                    to confirm deletion.{" "}
                    <span className="text-red-500 ">*</span>
                  </label>
                  <Input
                    type="text"
                    id="groupName"
                    placeholder="Enter the Guarantor Name"
                    required
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full text-white bg-red-700 hover:bg-red-800
          focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                  Delete
                </button>
              </form>
            )}
          </div>
        </Modal>
      </div>
    </>
  );
};

export default Guarantor;
