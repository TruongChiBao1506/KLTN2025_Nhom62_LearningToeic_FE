import React, { useEffect } from "react";
import PartPractice from "../PartPractice";
import withSectionAccess from "../../../components/Learner/withSectionAccess";
import { useParams } from "react-router-dom";

const Part4 = () => {
  // Part 4: Talks - ID từ log của bạn
  const { sectionId } = useParams();

  useEffect(() => {
    document.title = "Part 4: Talks | TOEIC Learning Platform";
  }, []);
  
  return <PartPractice sectionId={sectionId} />;
};

export default withSectionAccess(Part4);
