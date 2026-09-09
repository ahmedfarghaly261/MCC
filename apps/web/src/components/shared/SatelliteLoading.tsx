import { motion } from "framer-motion";
import { Satellite } from "lucide-react";

export default function SatelliteLoading() {
  return (
    <div className="flex h-full min-h-80 flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="text-blue-500"
      >
        <Satellite size={50} />
      </motion.div>

      <div className="relative flex items-center justify-center">
        {[1, 2, 3].map((wave) => (
          <motion.span
            key={wave}
            className="absolute h-20 w-20 rounded-full border-2 border-blue-400"
            initial={{ scale: 0.5, opacity: 0.6 }}
            animate={{ scale: 1.8, opacity: 0 }}
            transition={{
              repeat: Infinity,
              duration: 2,
              delay: wave * 0.4,
            }}
          />
        ))}
      </div>

      <motion.p
        className="text-lg font-medium text-gray-400"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        Loading...
      </motion.p>
    </div>
  );
}
