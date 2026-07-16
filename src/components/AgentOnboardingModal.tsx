import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Rocket, X, ArrowRight, ArrowLeft } from 'lucide-react';

const VerdictLogo = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M4 5L12 19L20 5" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

interface AgentOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AgentOnboardingModal({ isOpen, onClose }: AgentOnboardingModalProps) {
  const [step, setStep] = useState(0);

  // Reset step when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(0);
    }
  }, [isOpen]);

  const steps = [
    {
      title: "The Agentic Era",
      description: "Verdict is not just a web app. It's an Onchain OS-compatible protocol built specifically for autonomous AI agents on the OKX network.",
      icon: <VerdictLogo className="w-12 h-12 text-orange-500" />,
      highlight: true
    },
    {
      title: "Equip Your Agent",
      description: "To use Verdict, your local AI agent needs to be equipped with the Onchain OS toolkit and a secure Agentic Wallet to process micro-payments.",
      icon: <Terminal className="w-12 h-12 text-blue-500" />,
      highlight: false
    },
    {
      title: "Gas & Funding",
      description: "Verdict charges a flat fee of 0.5 USDT per audit. Ensure your Agentic Wallet is funded with USDT and OKB (for gas) on the X Layer Mainnet.",
      icon: (
        <div className="flex gap-4 items-center justify-center">
          <img src="https://cryptologos.cc/logos/tether-usdt-logo.svg?v=032" alt="USDT" className="w-12 h-12 drop-shadow-md" />
          <img src="https://cryptologos.cc/logos/okb-okb-logo.svg?v=032" alt="OKB" className="w-12 h-12 drop-shadow-md" />
        </div>
      ),
      highlight: false
    },
    {
      title: "Ready to Audit",
      description: (
        <>
          Copy the prompt on our <a href="https://www.okx.ai/agents/4686" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-600 underline underline-offset-4 decoration-orange-500/30 font-bold">ASP page</a>, paste it into your agent, and watch it work autonomously!
        </>
      ),
      icon: <Rocket className="w-12 h-12 text-emerald-500" />,
      highlight: false
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
            className="w-full max-w-lg bg-white dark:bg-[#0B0F19] rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden relative z-10 border border-slate-200 dark:border-slate-800"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors z-20"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 sm:p-10 min-h-[420px] flex flex-col">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 flex flex-col items-center text-center justify-center"
                >
                  <div className={`mb-8 p-6 rounded-3xl ${steps[step].highlight ? 'bg-orange-50 dark:bg-orange-500/10' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
                    {steps[step].icon}
                  </div>
                  
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                    {steps[step].title}
                  </h3>
                  
                  <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed text-base max-w-sm">
                    {steps[step].description}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Navigation & Progress */}
              <div className="mt-10 flex items-center justify-between">
                <div className="flex gap-2">
                  {steps.map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        i === step 
                          ? 'w-8 bg-orange-500' 
                          : 'w-2 bg-slate-200 dark:bg-slate-800'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex gap-3">
                  {step > 0 && (
                    <button 
                      onClick={handleBack}
                      className="p-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                  )}
                  
                  {step < steps.length - 1 ? (
                    <button 
                      onClick={handleNext}
                      className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-full font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                    >
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <a 
                      href="https://www.okx.ai/agents/4686"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={onClose}
                      className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-full font-bold hover:from-orange-400 hover:to-orange-500 transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] active:scale-95"
                    >
                      Continue to OKX.AI
                      <Rocket className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
