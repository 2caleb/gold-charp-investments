
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FinalResultAnimationProps {
  showFinalResult: boolean;
  finalResult: 'SUCCESSFUL' | 'FAILED' | null;
}

const FinalResultAnimation: React.FC<FinalResultAnimationProps> = ({
  showFinalResult,
  finalResult
}) => {
  return (
    <AnimatePresence>
      {showFinalResult && finalResult && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ 
              scale: [0.5, 1.2, 1],
              opacity: 1,
              rotate: finalResult === 'SUCCESSFUL' ? [0, 5, -5, 0] : [0, -2, 2, 0]
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`text-center p-8 rounded-lg ${
              finalResult === 'SUCCESSFUL' 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                : 'bg-gradient-to-r from-red-500 to-red-600'
            }`}
          >
            <motion.h1
              animate={finalResult === 'SUCCESSFUL' 
                ? { scale: [1, 1.1, 1] }
                : { x: [-10, 10, -10, 0] }
              }
              transition={{ 
                repeat: finalResult === 'SUCCESSFUL' ? 2 : 1,
                duration: finalResult === 'SUCCESSFUL' ? 0.6 : 0.4
              }}
              className={`text-6xl font-black text-white mb-4 ${
                finalResult === 'SUCCESSFUL' ? 'drop-shadow-lg' : 'drop-shadow-md'
              }`}
            >
              {finalResult}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-white text-xl"
            >
              {finalResult === 'SUCCESSFUL' 
                ? '🎉 Loan Application Approved!' 
                : '❌ Loan Application Rejected'
              }
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FinalResultAnimation;
