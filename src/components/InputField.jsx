
// src/components/InputField.jsx
import React from 'react';
import { motion } from 'framer-motion';

const InputField = ({ icon: Icon, type, placeholder, value, onChange, error }) => {
  return (
    <motion.div
      className="mb-5 relative"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`flex items-center border-b-2 transition-all duration-300 ${
        error ? 'border-red-500' : 'border-gray-300 focus-within:border-blue-500'
      }`}>
        {Icon && <Icon className="text-blue-400 mr-2" size={20} />}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full py-3 px-2 outline-none bg-transparent text-white placeholder-gray-400"
        />
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-xs mt-1"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
};

export default InputField;