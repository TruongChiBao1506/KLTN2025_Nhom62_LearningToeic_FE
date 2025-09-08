import React from "react";
import PartPractice from "../PartPractice";
import withSectionAccess from "../../../components/Learner/withSectionAccess";

const Part2 = () => {
  // Part 2: Question-Response - ID từ log của bạn
  const sectionId = "686ce171b614dda1fc08f1d1";
  
  return <PartPractice sectionId={sectionId} />;
};

export default withSectionAccess(Part2, "686ce171b614dda1fc08f1d1");
