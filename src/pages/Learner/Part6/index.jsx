import React, { useEffect } from "react";
import PartPractice from "../PartPractice";
import withSectionAccess from "../../../components/Learner/withSectionAccess";
import { useParams } from "react-router-dom";

const Part6 = () => {
  // Part 6: Text Completion - ID từ log của bạn
  const { sectionId } = useParams();

  useEffect(() => {
    document.title = "Part 6: Text Completion | TOEIC Learning Platform";
  }, []);
  
  return <PartPractice sectionId={sectionId} />;
};

export default withSectionAccess(Part6);
