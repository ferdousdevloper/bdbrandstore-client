import React, { useState } from "react";
import imageToBase64 from "../helpers/imageToBase64";
import loginIcon from "../assest/signin.gif"; 
import { FaEye, FaEyeSlash, FaCamera } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import SummaryApi from "../common/API";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";

const UserEdit = ({ onClose }) => {
  const user = useSelector((state) => state?.user?.user);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [userData, setUserData] = useState({
    name: user?.name,
    email: user?.email,
    contact: user?.contact,
    password: "",
    confirmPwd: "",
    profilepic: user?.profilepic,
  });

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUploadPic = async (e) => {
    const file = e.target.files[0];
    const image = await imageToBase64(file);
    setUserData((prev) => ({ ...prev, profilepic: image }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (userData.password !== userData.confirmPwd) {
      return toast.error("Passwords do not match");
    }

    const dataResponse = await fetch(SummaryApi.updateUser.url, {
      method: SummaryApi.updateUser.method,
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify(userData),
    });

    const dataApiResponse = await dataResponse.json();
    if (dataApiResponse.success) {
      toast.success(dataApiResponse.message);
      onClose();
    } else {
      toast.error(dataApiResponse.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Background Overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      {/* Modal Content */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-white  w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-white/20"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 ">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-blue-500 bg-clip-text text-transparent">
            Edit Profile
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative group">
                <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-primary-500/20 shadow-xl">
                  <img
                    src={userData.profilepic || loginIcon}
                    alt="profile"
                    className="w-full h-full object-cover transition group-hover:scale-110"
                  />
                </div>
                <label className="absolute bottom-1 right-1 bg-primary-500 p-2 rounded-full text-white cursor-pointer shadow-lg hover:bg-primary-600 transition-transform active:scale-90">
                  <FaCamera size={14} />
                  <input type="file" className="hidden" onChange={handleUploadPic} />
                </label>
              </div>
              <p className="mt-2 text-sm text-slate-500 font-medium">Change Profile Photo</p>
            </div>

            {/* Input Fields */}
            <div className="grid gap-5">
              {[
                { label: "Full Name", name: "name", type: "text", value: userData.name },
                { label: "Email Address", name: "email", type: "email", value: userData.email },
                { label: "Contact Number", name: "contact", type: "text", value: userData.contact },
              ].map((field) => (
                <div key={field.name} className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700  ml-1">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={field.value}
                    onChange={handleOnChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200  focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                  />
                </div>
              ))}

              {/* Password Fields */}
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { 
                    label: "New Password", 
                    name: "password", 
                    show: showPassword, 
                    setShow: setShowPassword 
                  },
                  { 
                    label: "Confirm Password", 
                    name: "confirmPwd", 
                    show: showConfirmPwd, 
                    setShow: setShowConfirmPwd 
                  }
                ].map((pwdField) => (
                  <div key={pwdField.name} className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700  ml-1">
                      {pwdField.label}
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={pwdField.show ? "text" : "password"}
                        name={pwdField.name}
                        onChange={handleOnChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => pwdField.setShow(!pwdField.show)}
                        className="absolute right-3 text-slate-400 hover:text-primary-500"
                      >
                        {pwdField.show ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="flex-[2] py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-primary-500 to-blue-600 shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transition-all"
              >
                Save Changes
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default UserEdit;