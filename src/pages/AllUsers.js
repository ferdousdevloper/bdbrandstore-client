import React, { useEffect, useState } from "react";
import SummaryApi from "../common/API";
import { toast } from "react-toastify";
import moment from "moment";
import { Link } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Role updated successfully");
        fetchAllUser();
      } else toast.error(data.message);
    } catch {
      toast.error("Failed to update role");
    }
    handleModalClose();
  };

  const totalPages = Math.ceil(allUser.length / itemsPerPage);
  const paginatedUsers = allUser.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  // Framer Motion Variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { scale: 1.05, boxShadow: "0px 10px 20px rgba(0,0,0,0.2)" },
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">All Users</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {paginatedUsers.map((user, idx) => (
            <motion.div
              key={user._id || idx}
              className="bg-white rounded-xl shadow-lg p-5 flex flex-col items-center text-center"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              whileHover="hover"
              transition={{ duration: 0.3 }}
            >
              <img
                src={user.profilepic}
                alt={user.name}
                className="w-20 h-20 rounded-full border-2 border-blue-300 mb-4"
              />
              <h2 className="text-lg font-semibold text-gray-800">{user.name}</h2>
              <p className="text-sm text-gray-500 mb-1">{user.email}</p>
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium mb-3">
                {user.role}
              </span>
              <p className="text-gray-400 text-xs mb-3">
                Joined {moment(user.createdAt).format("LL")}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => handleRoleChange(user)}
                  className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors"
                >
                  <FaEdit size={18} />
                </button>
                <Link
                  to={""}
                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                >
                  <MdDelete size={18} />
                </Link>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center mt-6 space-x-2 flex-wrap">
        <button
          onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
          className="px-4 py-2 bg-white border rounded-lg shadow hover:bg-gray-50 transition"
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, idx) => (
          <button
            key={idx}
            onClick={() => handlePageChange(idx + 1)}
            className={`px-4 py-2 border rounded-lg shadow transition mb-2 ${
              currentPage === idx + 1
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:text-blue-600"
            }`}
          >
            {idx + 1}
          </button>
        ))}
        <button
          onClick={() =>
            currentPage < totalPages && handlePageChange(currentPage + 1)
          }
          className="px-4 py-2 bg-white border rounded-lg shadow hover:bg-gray-50 transition"
        >
          Next
        </button>
      </div>

      {/* Role Change Modal */}
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