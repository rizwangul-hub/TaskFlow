import { motion } from "framer-motion";

const Loader = ({ size = "md", color = "brand", className = "" }) => {
  const sizeClasses = {
    xs: "h-4 w-4 border-2",
    sm: "h-6 w-6 border-2",
    md: "h-10 w-10 border-3",
    lg: "h-16 w-16 border-4",
  };

  const colorClasses = {
    brand: "border-brand-500 border-t-transparent",
    accent: "border-accent-500 border-t-transparent",
    white: "border-white border-t-transparent",
    slate: "border-slate-500 border-t-transparent dark:border-slate-400",
  };

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Outer rotating circle */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          duration: 0.8,
          ease: "linear",
        }}
        className={`rounded-full ${sizeClasses[size] || sizeClasses.md} ${
          colorClasses[color] || colorClasses.brand
        }`}
      />
      
      {/* Inner decorative pulse ring */}
      <motion.div
        animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.3, 0.6, 0.3] }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: "easeInOut",
        }}
        className={`absolute rounded-full bg-brand-500/10 ${
          size === "xs"
            ? "h-2 w-2"
            : size === "sm"
            ? "h-3.5 w-3.5"
            : size === "md"
            ? "h-6 w-6"
            : "h-10 w-10"
        }`}
      />
    </div>
  );
};

export default Loader;
