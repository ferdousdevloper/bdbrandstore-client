import React, { useState } from "react";
import { FaEdit } from "react-icons/fa";
import { FaCircleUser } from "react-icons/fa6";
import { useSelector } from "react-redux";
import UserEdit from "../components/UserEdit";

const UserAccount = () => {
  const user = useSelector((state) => state?.user?.user);
  const [editUser, setEditUser] = useState(false);

  return (
    <div className="w-full h-full flex items-center justify-center p-2 md:p-4 relative">
      <div className="max-w-lg w-full bg-white rounded-2xl border border-surface-100 shadow-soft p-6 md:p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800">
              My Profile
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage your personal information
            </p>
          </div>
          <button
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-50 text-primary-700 hover:bg-primary-100 text-sm font-semibold"
            onClick={() => setEditUser(true)}
          >
            <FaEdit />
            Edit
          </button>
        </div>

        <div className="flex flex-col items-center text-center gap-4">
          <div className="relative">
            {user?.profilepic ? (
              <img
                src={user?.profilepic}
                className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-primary-100 shadow-card"
                alt={user?.name}
              />
            ) : (
              <FaCircleUser className="w-28 h-28 md:w-32 md:h-32 rounded-full text-slate-300" />
            )}
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Account
            </p>
            <h2 className="capitalize font-bold text-2xl mt-1 text-slate-800">
              {user?.name || "User"}
            </h2>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-sm text-slate-500">Email</span>
            <span className="text-sm font-medium text-slate-800 break-all">
              {user?.email || "-"}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-sm text-slate-500">Contact</span>
            <span className="text-sm font-medium text-slate-800">
              {user?.contact || "-"}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-sm text-slate-500">Role</span>
            <span className="text-sm font-medium text-slate-800">
              {user?.role || "USER"}
            </span>
          </div>
        </div>
      </div>

      {editUser && <UserEdit onClose={() => setEditUser(false)} />}
    </div>
  );
};

export default UserAccount;
