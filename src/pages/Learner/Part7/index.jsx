import React, { useEffect } from "react";
import PartPractice from "../PartPractice";
import withSectionAccess from "../../../components/Learner/withSectionAccess";
import { useParams } from "react-router-dom";

const Part7 = () => {
  // Part 7: Reading Comprehension - ID từ log của bạn
  const { sectionId } = useParams();

  useEffect(() => {
    document.title = "Part 7: Reading Comprehension | TOEIC Learning Platform";
  }, []);
  
  return <PartPractice sectionId={sectionId} />;
};

export default withSectionAccess(Part7);
