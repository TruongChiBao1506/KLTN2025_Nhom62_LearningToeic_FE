import React, { useEffect } from "react";
import PartPractice from "../PartPractice";
import withSectionAccess from "../../../components/Learner/withSectionAccess";

const Part7 = () => {
  // Part 7: Reading Comprehension - ID từ log của bạn
  const sectionId = "686ce171b614dda1fc08f1d6";

  useEffect(() => {
    document.title = "Part 7: Reading Comprehension | TOEIC Learning Platform";
  }, []);
  
  return <PartPractice sectionId={sectionId} />;
};

export default withSectionAccess(Part7, "686ce171b614dda1fc08f1d6");
