import React, { useEffect } from "react";
import PartPractice from "../PartPractice";
import withSectionAccess from "../../../components/Learner/withSectionAccess";
import { useParams } from "react-router-dom";

const Part5 = () => {
  // Part 5: Incomplete Sentences - ID từ log của bạn
  const { sectionId } = useParams();

  useEffect(() => {
    document.title = "Part 5: Incomplete Sentences | TOEIC Learning Platform";
  }, []);
  
  return <PartPractice sectionId={sectionId} />;
};

export default withSectionAccess(Part5);
