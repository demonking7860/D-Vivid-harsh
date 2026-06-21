"use client";

import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Brain, Globe, GraduationCap } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import StudyAbroadSurvey from "../assessment/StudyAbroadSurvey";
import ConciseSurvey from "../assessment/ConciseSurvey";
import ExpandedSurvey from "../assessment/ExpandedSurvey";
import UltraQuickSurvey from "../assessment/UltraQuickSurvey";
import { Button } from "../ui/button";
import { CardSpotlight } from "../ui/card-spotlight";
import { LampContainer } from "../ui/lamp";

interface CTASectionProps {
  title?: string;
  buttonText?: string;
  href?: string;
  className?: string;
}

const CTASection = ({ 
  title = "Take your psychometric test today",
  buttonText = "Get started for free",
  href = "/auth/signup",
  className 
}: CTASectionProps) => {
  const [showAssessment, setShowAssessment] = useState(false);
  const [showConciseSurvey, setShowConciseSurvey] = useState(false);
  const [showExpandedSurvey, setShowExpandedSurvey] = useState(false);
  const [showUltraQuickSurvey, setShowUltraQuickSurvey] = useState(false);

  // Initialize history state on mount
  useEffect(() => {
    // Push initial state to history so back button works correctly
    if (window.history.state === null) {
      window.history.replaceState({ test: null }, '', window.location.pathname);
    }
  }, []);

  // Helper function to open a test with history management
  const openTest = useCallback((testType: string) => {
    // Push state to history
    window.history.pushState({ test: testType }, '', window.location.pathname);
    
    // Reset all tests first
    setShowAssessment(false);
    setShowConciseSurvey(false);
    setShowExpandedSurvey(false);
    setShowUltraQuickSurvey(false);
    
    // Open the specific test
    switch(testType) {
      case 'assessment':
        setShowAssessment(true);
        break;
      case 'expanded':
        setShowExpandedSurvey(true);
        break;
      case 'concise':
        setShowConciseSurvey(true);
        break;
      case 'ultraquick':
        setShowUltraQuickSurvey(true);
        break;
    }
    
    // Scroll to question container after test opens
    setTimeout(() => {
      const questionContainer = document.querySelector('[data-question-container]');
      if (questionContainer) {
        const yOffset = window.innerWidth < 640 ? -80 : -100;
        const y = questionContainer.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 400);
  }, []);

  // Helper function to close all tests with history management
  const closeAllTests = useCallback(() => {
    // Push state to history (back to main view)
    window.history.pushState({ test: null }, '', window.location.pathname);
    
    setShowAssessment(false);
    setShowConciseSurvey(false);
    setShowExpandedSurvey(false);
    setShowUltraQuickSurvey(false);
  }, []);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.test) {
        // Restore test state
        const testType = event.state.test;
        setShowAssessment(false);
        setShowConciseSurvey(false);
        setShowExpandedSurvey(false);
        setShowUltraQuickSurvey(false);
        
        switch(testType) {
          case 'assessment':
            setShowAssessment(true);
            break;
          case 'expanded':
            setShowExpandedSurvey(true);
            break;
          case 'concise':
            setShowConciseSurvey(true);
            break;
          case 'ultraquick':
            setShowUltraQuickSurvey(true);
            break;
        }
      } else {
        // Close all tests
        setShowAssessment(false);
        setShowConciseSurvey(false);
        setShowExpandedSurvey(false);
        setShowUltraQuickSurvey(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Listen for custom events from navigation menu
  useEffect(() => {
    const handleOpenTest = (event: CustomEvent) => {
      const { testType } = event.detail;
      openTest(testType);
    };

    window.addEventListener('openTest', handleOpenTest as EventListener);
    
    return () => {
      window.removeEventListener('openTest', handleOpenTest as EventListener);
    };
  }, [openTest]);

  return (
    <div id="services">
      <div id="psychometric-test"></div>
      <LampContainer className={className}>
      <motion.div
        initial={{ opacity: 0.5, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="flex flex-col items-center text-center max-w-7xl mx-auto px-4 w-full"
      >
        <h1 className="mt-8 bg-gradient-to-br from-slate-300 to-slate-500 py-4 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl font-heading">
          {title}
        </h1>
        
        {!showAssessment && !showConciseSurvey && !showExpandedSurvey && !showUltraQuickSurvey ? (
          <>
            {/* Test Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 w-full max-w-6xl">
              <TestCard 
                title="Comprehensive Assessment"
                description="54-question test to evaluate overall study abroad readiness. (20–25 mins)"
                icon={<BookOpen className="w-8 h-8 text-purple-400" />}
                testType="assessment"
                onAssessmentClick={() => openTest('assessment')}
                onConciseClick={() => openTest('concise')}
                onExpandedClick={() => openTest('expanded')}
                onUltraQuickClick={() => openTest('ultraquick')}
              />
              <TestCard 
                title="Expanded Assessment"
                description="42 questions covering academic, emotional, and financial aspects. (15–20 mins)"
                icon={<Brain className="w-8 h-8 text-purple-400" />}
                testType="expanded"
                onAssessmentClick={() => openTest('assessment')}
                onConciseClick={() => openTest('concise')}
                onExpandedClick={() => openTest('expanded')}
                onUltraQuickClick={() => openTest('ultraquick')}
              />
              <TestCard 
                title="Focused Assessment"
                description="25 questions to measure readiness across key areas. (10–12 mins)"
                icon={<Globe className="w-8 h-8 text-purple-400" />}
                testType="concise"
                onAssessmentClick={() => openTest('assessment')}
                onConciseClick={() => openTest('concise')}
                onExpandedClick={() => openTest('expanded')}
                onUltraQuickClick={() => openTest('ultraquick')}
              />
              <TestCard 
                title="Quick Check"
                description="12 quick questions for an instant readiness snapshot. (3–5 mins)"
                icon={<GraduationCap className="w-8 h-8 text-purple-400" />}
                testType="ultraquick"
                onAssessmentClick={() => openTest('assessment')}
                onConciseClick={() => openTest('concise')}
                onExpandedClick={() => openTest('expanded')}
                onUltraQuickClick={() => openTest('ultraquick')}
              />
            </div>
            

          </>
        ) : showAssessment ? (
          <div className="mt-12 w-full max-w-6xl">
            <StudyAbroadSurvey />
            <div className="mt-8 text-center">
              <Button 
                onClick={closeAllTests}
                variant="outline"
                className="mt-4"
              >
                ← Back to Tests
              </Button>
            </div>
          </div>
        ) : showConciseSurvey ? (
          <div className="mt-12 w-full max-w-6xl">
            <ConciseSurvey />
            <div className="mt-8 text-center">
              <Button 
                onClick={closeAllTests}
                variant="outline"
                className="mt-4"
              >
                ← Back to Tests
              </Button>
            </div>
          </div>
        ) : showExpandedSurvey ? (
          <div className="mt-12 w-full max-w-6xl">
            <ExpandedSurvey />
            <div className="mt-8 text-center">
              <Button 
                onClick={closeAllTests}
                variant="outline"
                className="mt-4"
              >
                ← Back to Tests
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-12 w-full max-w-6xl">
            <UltraQuickSurvey />
            <div className="mt-8 text-center">
              <Button 
                onClick={closeAllTests}
                variant="outline"
                className="mt-4"
              >
                ← Back to Tests
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </LampContainer>
    </div>
  );
};

// Test Card Component
const TestCard = ({ 
  title, 
  description, 
  icon, 
  testType,
  onAssessmentClick,
  onConciseClick,
  onExpandedClick,
  onUltraQuickClick
}: { 
  title: string; 
  description: string; 
  icon: React.ReactNode;
  testType: string;
  onAssessmentClick?: (show: boolean) => void;
  onConciseClick?: (show: boolean) => void;
  onExpandedClick?: (show: boolean) => void;
  onUltraQuickClick?: (show: boolean) => void;
}) => {
  return (
    <CardSpotlight className="h-96 w-full">
      <div className="flex flex-col h-full p-6">
        <div className="mb-4">
          {icon}
        </div>
        
        <h3 className="text-xl font-bold relative z-20 text-white mb-4">
          {title}
        </h3>
        
        <p className="text-neutral-300 relative z-20 text-sm flex-grow">
          {description}
        </p>
        
        <div className="mt-6 pt-4 border-t border-neutral-700">
          {testType === 'assessment' ? (
            <Button 
              onClick={() => onAssessmentClick?.(true)}
              size="sm"
              className="w-full bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-500 hover:to-violet-600 text-white font-medium rounded-lg transition-all duration-200"
            >
              Take Test
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          ) : testType === 'concise' ? (
            <Button 
              onClick={() => onConciseClick?.(true)}
              size="sm"
              className="w-full bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-500 hover:to-violet-600 text-white font-medium rounded-lg transition-all duration-200"
            >
              Take Test
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          ) : testType === 'expanded' ? (
            <Button 
              onClick={() => onExpandedClick?.(true)}
              size="sm"
              className="w-full bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-500 hover:to-violet-600 text-white font-medium rounded-lg transition-all duration-200"
            >
              Take Test
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          ) : testType === 'ultraquick' ? (
            <Button 
              onClick={() => onUltraQuickClick?.(true)}
              size="sm"
              className="w-full bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-500 hover:to-violet-600 text-white font-medium rounded-lg transition-all duration-200"
            >
              Take Test
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          ) : (
            <Button 
              asChild
              size="sm"
              className="w-full bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-500 hover:to-violet-600 text-white font-medium rounded-lg transition-all duration-200"
            >
              <Link href={`/test/${testType}`}>
                Take Test
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </CardSpotlight>
  );
};

export default CTASection;