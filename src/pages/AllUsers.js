import React, { useEffect, useState } from "react";
import SummaryApi from "../common/API";
import { toast } from "react-toastify";
import moment from "moment";
import { Link } from "react-router-dom";
import { FaEdit, FaUserCircle, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { MdDelete, MdEmail, MdDateRange } from "react-icons/md";
import RoleChangeModal from "../components/ChangeUserRole";
import { motion, AnimatePresence } from "framer-motion";

const AllUsers = () => {
  const [allUser, setAllUser] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 8;

  const fetchAllUser = async () => {
    try {
      const res = await fetch(SummaryApi.allUser.url, {
        method: SummaryApi.allUser.method,
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setAllUser(data.data);
      else toast.error(data.message);
    } catch (err) {
      toast.error("Failed to fetch users");
    }
  };

  useEffect(() => {
    fetchAllUser();
  }, []);

  const handleRoleChange = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleRoleSubmit = async (userId, role) => {
  try {
    const res = await fetch(`${SummaryApi.updateRole.url}/${userId}`, {
      method: SummaryApi.updateRole.method,
      headers: { 
        "Content-Type": "application/json" 
      },
      // এই লাইনটি অত্যন্ত গুরুত্বপূর্ণ সেশন কুকি পাঠানোর জন্য
      credentials: "include", 
      body: JSON.stringify({ role: role }),
    });

    const data = await res.json();

    if (data.success) {
      toast.success(data.message);
      fetchAllUser(); // লিস্ট আপডেট করার জন্য
      handleModalClose(); // মোডাল বন্ধ করার জন্য
    } else {
      toast.error(data.message);
    }
  } catch (err) {
    toast.error("An error occurred while updating the role");
    console.error("Update Role Error:", err);
  }
};

  const totalPages = Math.ceil(allUser.length / itemsPerPage);
  const paginatedUsers = allUser.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Users Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage all registered users and their roles</p>
        </div>
        <div className="bg-primary-100 text-primary-700 px-4 py-2 rounded-xl font-semibold text-sm self-start">
          Total Users: {allUser.length}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {paginatedUsers.map((user, idx) => (
            <motion.div
              key={user._id || idx}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-3xl border border-surface-100 shadow-soft hover:shadow-card p-6 flex flex-col transition-all duration-300"
            >
              {/* Profile Image & Badge */}
              <div className="relative flex justify-center mb-4">
                {user.profilepic ? (
                  <img
                    src={user.profilepic}
                    alt={user.name}
                    className="w-24 h-24 rounded-full object-cover ring-4 ring-primary-50 shadow-md"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <FaUserCircle size={80} />
                  </div>
                )}
                <div className={`absolute bottom-0 right-1/2 translate-x-12 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border ${
                  user.role === 'ADMIN' 
                  ? "bg-red-50 text-red-600 border-red-100" 
                  : "bg-emerald-50 text-emerald-600 border-emerald-100"
                }`}>
                  {user.role}
                </div>
              </div>

              {/* User Info */}
              <div className="text-center flex-1">
                <h2 className="text-lg font-bold text-slate-800 capitalize line-clamp-1">{user.name}</h2>
                <div className="flex items-center justify-center gap-1.5 text-slate-500 text-sm mt-1">
                  <MdEmail className="text-primary-400" />
                  <span className="truncate max-w-[180px]">{user.email}</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs mt-3 bg-slate-50 py-2 rounded-xl">
                  <MdDateRange />
                  <span>Joined {moment(user.createdAt).format("MMM DD, YYYY")}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => handleRoleChange(user)}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white py-2.5 rounded-xl transition-all font-semibold text-sm shadow-md shadow-primary-500/20 active:scale-95"
                >
                  <FaEdit size={14} /> Change Role
                </button>
                <button
                  className="w-11 h-11 flex items-center justify-center text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 rounded-xl transition-all border border-slate-100 active:scale-95"
                  title="Delete User"
                >
                  <MdDelete size={20} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modern Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-12 gap-2">
          <button
            onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-600 hover:bg-primary-500 hover:text-white disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-slate-600 transition-all duration-300"
          >
            <FaChevronLeft size={14} />
          </button>
          
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, idx) => (
              <button
                key={idx}
                onClick={() => handlePageChange(idx + 1)}
                className={`w-10 h-10 rounded-xl font-bold text-sm transition-all duration-300 ${
                  currentPage === idx + 1
                    ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30 scale-110"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-primary-500"
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-600 hover:bg-primary-500 hover:text-white disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-slate-600 transition-all duration-300"
          >
            <FaChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Modal */}
      {selectedUser && (
        <RoleChangeModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSubmit={handleRoleSubmit}
          user={selectedUser}
        />
      )}
    </div>
  );
};

export default AllUsers;