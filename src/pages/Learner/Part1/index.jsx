import React, { useEffect } from "react";
import PartPractice from "../PartPractice";
import withSectionAccess from "../../../components/Learner/withSectionAccess";
import { useParams } from "react-router-dom";

const Part1 = () => {
  // Part 1: Photographs - ID từ log của bạn
  const { sectionId } = useParams();

  useEffect(() => {
    document.title = "Part 1: Photographs | TOEIC Learning Platform";
  }, []);
  
  return <PartPractice sectionId={sectionId} />;
};

// Wrap with section access control
export default withSectionAccess(Part1);
