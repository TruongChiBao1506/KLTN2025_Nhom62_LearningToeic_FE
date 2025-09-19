import React, { useEffect } from "react";
import PartPractice from "../PartPractice";
import withSectionAccess from "../../../components/Learner/withSectionAccess";

const Part1 = () => {
  // Part 1: Photographs - ID từ log của bạn
  const sectionId = "686ce171b614dda1fc08f1d0";

  useEffect(() => {
    document.title = "Part 1: Photographs | TOEIC Learning Platform";
  }, []);
  
  return <PartPractice sectionId={sectionId} />;
};

// Wrap with section access control
export default withSectionAccess(Part1, "686ce171b614dda1fc08f1d0");
