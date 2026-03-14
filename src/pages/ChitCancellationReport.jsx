import React, { useEffect, useState } from 'react'
import CircularLoader from '../components/loaders/CircularLoader';
import DataTable from '../components/layouts/Datatable';
import api from '../instance/TokenInstance';
import {Select} from "antd";


const ChitCancellationReport = () => {
const [chitCancelDataTable, setChitCancelDataTable] = useState([]);
  const [loading, setLoading] = useState(true);



 const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);

  const [selectedGroup, setSelectedGroup] = useState();
  const [selectedUser, setSelectedUser] = useState();
  useEffect(()=>{
    const fetchGroups = async () => {
      try {
        const response = await api.get("/group/get-group-admin");
        setGroups(response.data)
        
      } catch (error) {
        console.error("failed to fetch group data", error)
      }
    }
    fetchGroups()
  },[]);

  useEffect(()=> {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/user/get-user");
        setUsers(response.data)
      } catch (error) {
        console.error("failed to fetch users", error)
      }
    }
    fetchUsers()
  },[])

    useEffect(()=> {
        const fetchChitCancellation = async () => {
            try {
                const response = await api.get("/enroll/chit-cancellation",
                  {
        params: {
          group_id: selectedGroup,
          user_id: selectedUser
        }
      }
                );

                const formattedData = response.data?.data?.map((chit, index) => ({
                    id: chit?._id,
                    slNo: index + 1,
                    userName: chit?.user_name,
                    userPhone: chit?.user_phone,
                    groupName: chit?.group_name,
                    ticket: chit?.tickets,
                    groupValue: chit?.group_value,
                    totalPaidAmount: chit?.totalPaidAmount,
                    cancellationDate: chit?.cancellation_date?.split("T")[0],
                    joinedOn: chit?.createdAt?.split("T")[0],
                }));
                setChitCancelDataTable(formattedData)
                
            } catch (error) {
                console.error("failed to fetch chit cancelation report", error)
            } finally{
        setLoading(false);
            }
        }
        fetchChitCancellation();
    },[selectedGroup, selectedUser]);

    const chitColumns = [
        {key: "slNo", header: "Sl No"},
        {key: "userName", header: "Customer Name"},
        {key: "userPhone", header: "Phone Number"},
        {key: "joinedOn", header: "Joined On"},
        {key: "groupName", header: "Group Name"},
        {key: "ticket", header: "Ticket"},
        {key: "groupValue", header: "Group Value"},
        {key: "totalPaidAmount", header: "Paid Amount"},
        {key: "cancellationDate", header: "Cancellation Date"},
    ]
  return (
    <div className="max-w-screen">
      <div className=" mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
             Chit Cancellation Report
          </h1>
        
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <CircularLoader />
          </div>
        ) : (
          <>
             <div className="grid grid-cols-2 gap-4 mb-6">

              <div>
                <label className="block text-sm font-medium mb-1">
                  Select Group
                </label>

                <Select
                  className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                  showSearch
                    popupMatchSelectWidth={false}
                  placeholder="Select Group"
                  value={selectedGroup}
                  onChange={setSelectedGroup}
                  allowClear
                  filterOption={(input, option) =>
                      option.children
                        .toString()
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                >
                  <Select.Option key= "">All Groups</Select.Option>
                  {groups.map((group) => (
                    <Select.Option key={group._id} value={group._id}>
                      {group.group_name}
                    </Select.Option>
                  ))}
                </Select>
              </div>


              <div>
                <label className="block text-sm font-medium mb-1">
                  Select User
                </label>

                <Select
                  showSearch
                  placeholder="Select User"
                  value={selectedUser}
                  onChange={setSelectedUser}
                  allowClear
                  className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                   filterOption={(input, option) =>
                      option.children
                        .toString()
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                >
                  <Select.Option key= "">All Users</Select.Option>
                  {users.map((user) => (
                    <Select.Option key={user._id} value={user._id}>
                      {user.full_name}
                    </Select.Option>
                  ))}
                </Select>
              </div>

            </div>
            <div className="max-w-screen">
              <DataTable
                columns={chitColumns}
                data={chitCancelDataTable}
                
                exportedPdfName="Chit Cancellation  Report"
                exportedFileName="Chit Cancellation Report.csv"
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ChitCancellationReport
