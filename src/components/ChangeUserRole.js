import React, { useState, useEffect } from "react";
import Role from "../common/Role";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose } from "react-icons/io5";
import { FaUserShield } from "react-icons/fa";

const RoleChangeModal = ({ isOpen, onClose, onSubmit, user }) => {
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    if (user?.role) {
      setUserRole(user.role);
    }
  }, [user, isOpen]); // isOpen অ্যাড করা হয়েছে যাতে প্রতিবার ওপেন হলে ডেটা সিঙ্ক হয়

  const handleSubmit = (e) => {
    e.preventDefault();
    // এখানে শুধু userRole স্ট্রিং পাঠাচ্ছি, AllUsers.js এ এটা হ্যান্ডেল করতে হবে
    onSubmit(user?._id, userRole);
  };

  const handleRoleChange = (e) => {
    setUserRole(e.target.value);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <FaUserShield size={20} />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Change User Role</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
              >
                <IoClose size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Updating role for:</p>
                <h4 className="text-lg font-bold text-slate-800 capitalize mt-1">{user?.name}</h4>
                <p className="text-sm text-blue-600 font-medium">{user?.email}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="role" className="block text-sm font-semibold text-slate-700 ml-1">
                    Select New Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer font-medium text-slate-700 shadow-sm"
                    required
                    value={userRole}
                    onChange={handleRoleChange}
                  >
                    <option value="" disabled>Select a role</option>
                    {Object.values(Role).map((el) => (
                      <option value={el} key={el}>{el}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex-[2] py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all"
                  >
                    Save Changes
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RoleChangeModal;