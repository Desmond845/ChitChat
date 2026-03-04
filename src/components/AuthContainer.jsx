import { motion } from 'framer-motion'; // optional but nice

function AuthContainer({ children, title, subtitle }) {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4 overflow-hidden">
      {/* Animated blobs (keep your existing ones) */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-20 w-80 h-80 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative bg-white bg-opacity-20 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-md border border-white border-opacity-30"
      >
        <h1 className="text-4xl font-bold text-white text-center mb-2">Chit Chat</h1>
        {subtitle && <p className="text-white text-opacity-80 text-center mb-6">{subtitle}</p>}
        {title && <h2 className="text-2xl font-semibold text-white mb-4">{title}</h2>}
        {children}
      </motion.div>
    </div>
  );
}

export default AuthContainer;