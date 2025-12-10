import React, { useEffect } from "react";
import PartPractice from "../PartPractice";
import withSectionAccess from "../../../components/Learner/withSectionAccess";
import { useParams } from "react-router-dom";

const Part3 = () => {
  // Part 3: Conversations - ID từ log của bạn  
  const { sectionId } = useParams();

  useEffect(() => {
    document.title = "Part 3: Conversations | TOEIC Learning Platform";
  }, []);
  
  return <PartPractice sectionId={sectionId} />;
};

export default withSectionAccess(Part3);
