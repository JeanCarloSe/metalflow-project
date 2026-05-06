import React from 'react';
import { motion } from 'framer-motion';
import AppleHeader from './AppleHeader';
import AppleFooter from './AppleFooter';

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

const AppLayout = ({ 
  children, 
  title, 
  currentUser, 
  onLogout,
  headerProps = {}
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AppleHeader 
        currentUser={currentUser} 
        onLogout={onLogout}
        {...headerProps}
      />
      
      <motion.main 
        className="flex-1 pt-20 pb-8"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="max-w-6xl mx-auto px-4">
          {title && (
            <h1 className="text-4xl font-bold mb-8" style={{ color: '#0170B9' }}>
              {title}
            </h1>
          )}
          {children}
        </div>
      </motion.main>

      <AppleFooter />
    </div>
  );
};

export default AppLayout;
