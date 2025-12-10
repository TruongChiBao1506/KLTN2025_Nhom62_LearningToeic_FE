import React, { useEffect } from "react";
import PartPractice from "../PartPractice";
import withSectionAccess from "../../../components/Learner/withSectionAccess";
import { useParams } from "react-router-dom";

const Part2 = () => {
  // Part 2: Question-Response - ID từ log của bạn
  const { sectionId } = useParams();

  useEffect(() => {
    document.title = "Part 2: Question-Response | TOEIC Learning Platform";
  }, []);
  
  return <PartPractice sectionId={sectionId} />;
};

export default withSectionAccess(Part2);
