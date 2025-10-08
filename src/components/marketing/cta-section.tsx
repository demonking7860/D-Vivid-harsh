"use client";

import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Brain, Globe, GraduationCap } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
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

  // Listen for custom events from navigation menu
  useEffect(() => {
    const handleOpenTest = (event: CustomEvent) => {
      const { testType } = event.detail;
      
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
    };

    window.addEventListener('openTest', handleOpenTest as EventListener);
    
    return () => {
      window.removeEventListener('openTest', handleOpenTest as EventListener);
    };
  }, []);

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
                onAssessmentClick={setShowAssessment}
                onConciseClick={setShowConciseSurvey}
                onExpandedClick={setShowExpandedSurvey}
                onUltraQuickClick={setShowUltraQuickSurvey}
              />
              <TestCard 
                title="Expanded Assessment"
                description="42 questions covering academic, emotional, and financial aspects. (15–20 mins)"
                icon={<Brain className="w-8 h-8 text-purple-400" />}
                testType="expanded"
                onAssessmentClick={setShowAssessment}
                onConciseClick={setShowConciseSurvey}
                onExpandedClick={setShowExpandedSurvey}
                onUltraQuickClick={setShowUltraQuickSurvey}
              />
              <TestCard 
                title="Focused Assessment"
                description="25 questions to measure readiness across key areas. (10–12 mins)"
                icon={<Globe className="w-8 h-8 text-purple-400" />}
                testType="concise"
                onAssessmentClick={setShowAssessment}
                onConciseClick={setShowConciseSurvey}
                onExpandedClick={setShowExpandedSurvey}
                onUltraQuickClick={setShowUltraQuickSurvey}
              />
              <TestCard 
                title="Quick Check"
                description="12 quick questions for an instant readiness snapshot. (3–5 mins)"
                icon={<GraduationCap className="w-8 h-8 text-purple-400" />}
                testType="ultraquick"
                onAssessmentClick={setShowAssessment}
                onConciseClick={setShowConciseSurvey}
                onExpandedClick={setShowExpandedSurvey}
                onUltraQuickClick={setShowUltraQuickSurvey}
              />
            </div>
            

          </>
        ) : showAssessment ? (
          <div className="mt-12 w-full max-w-6xl">
            <StudyAbroadSurvey />
            <div className="mt-8 text-center">
              <Button 
                onClick={() => setShowAssessment(false)}
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
                onClick={() => setShowConciseSurvey(false)}
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
                onClick={() => setShowExpandedSurvey(false)}
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
                onClick={() => setShowUltraQuickSurvey(false)}
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