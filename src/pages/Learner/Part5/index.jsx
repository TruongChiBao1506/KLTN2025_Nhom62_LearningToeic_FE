import React from "react";
import PartPractice from "../PartPractice";
import withSectionAccess from "../../../components/Learner/withSectionAccess";

const Part5 = () => {
  // Part 5: Incomplete Sentences - ID từ log của bạn
  const sectionId = "686ce171b614dda1fc08f1d4";
  
  return <PartPractice sectionId={sectionId} />;
};

export default withSectionAccess(Part5, "686ce171b614dda1fc08f1d4");
