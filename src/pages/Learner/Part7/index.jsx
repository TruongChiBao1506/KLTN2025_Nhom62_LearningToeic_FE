import React from "react";
import PartPractice from "../PartPractice";
import withSectionAccess from "../../../components/Learner/withSectionAccess";

const Part7 = () => {
  // Part 7: Reading Comprehension - ID từ log của bạn
  const sectionId = "686ce171b614dda1fc08f1d6";
  
  return <PartPractice sectionId={sectionId} />;
};

export default withSectionAccess(Part7, "686ce171b614dda1fc08f1d6");
