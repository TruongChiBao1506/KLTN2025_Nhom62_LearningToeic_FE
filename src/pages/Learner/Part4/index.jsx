import React from "react";
import PartPractice from "../PartPractice";
import withSectionAccess from "../../../components/Learner/withSectionAccess";

const Part4 = () => {
  // Part 4: Talks - ID từ log của bạn
  const sectionId = "686ce171b614dda1fc08f1d3";
  
  return <PartPractice sectionId={sectionId} />;
};

export default withSectionAccess(Part4, "686ce171b614dda1fc08f1d3");
