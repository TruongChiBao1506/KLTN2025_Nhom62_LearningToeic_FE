import React, { useEffect } from "react";
import PartPractice from "../PartPractice";
import withSectionAccess from "../../../components/Learner/withSectionAccess";

const Part3 = () => {
  // Part 3: Conversations - ID từ log của bạn  
  const sectionId = "686ce171b614dda1fc08f1d2";

  useEffect(() => {
    document.title = "Part 3: Conversations | TOEIC Learning Platform";
  }, []);
  
  return <PartPractice sectionId={sectionId} />;
};

export default withSectionAccess(Part3, "686ce171b614dda1fc08f1d2");
