import React, { useEffect } from "react";
import PartPractice from "../PartPractice";
import withSectionAccess from "../../../components/Learner/withSectionAccess";

const Part6 = () => {
  // Part 6: Text Completion - ID từ log của bạn
  const sectionId = "686ce171b614dda1fc08f1d5";

  useEffect(() => {
    document.title = "Part 6: Text Completion | TOEIC Learning Platform";
  }, []);
  
  return <PartPractice sectionId={sectionId} />;
};

export default withSectionAccess(Part6, "686ce171b614dda1fc08f1d5");
