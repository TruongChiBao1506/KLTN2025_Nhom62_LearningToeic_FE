import React from "react";
import { useParams } from "react-router-dom";

// Import components Speaking
import No1To2 from "../../../components/Learner/Speaking/No1To2";
import No3To4 from "../../../components/Learner/Speaking/No3To4";
import No5To7 from "../../../components/Learner/Speaking/No5To7";

// Import components Writing
import No1To5 from "../../../components/Learner/Writing/No1To5";

import "./style.css";

const StudySW = () => {
  const { sectionId, testId } = useParams();

  console.log("🚀 ~ StudySW ~ sectionId:", sectionId);
  console.log("🚀 ~ StudySW ~ testId:", testId);

  // Render component tương ứng dựa vào sectionId
  const renderComponent = () => {
    switch (sectionId) {
      // Speaking sections (type 3)
      case "6894cc50892a33de30593472": // Part 8: Speaking - Read a text aloud
        return <No1To2 testId={testId} />;
      case "6894cc50892a33de30593473": // Part 9: Speaking - Describe a picture
        return <No3To4 testId={testId} />;
      case "6894cc50892a33de30593474": // Part 10: Speaking - Respond to questions
        return <No5To7 testId={testId} />;

      // Writing sections (type 4)
      case "6894cc50892a33de30593475": // Part 11: Writing - Describe a picture
        return <No1To5 testId={testId} />;
      case "6894cc50892a33de30593476": // Part 12: Writing - Respond to a written request
      case "6894cc50892a33de30593477": // Part 13: Writing - Write an opinion essay
        return (
          <div className="col-12 text-center py-5">
            <div className="card">
              <div className="card-body">
                <h2>Đang phát triển</h2>
                <p className="lead">
                  Component cho phần này đang trong quá trình phát triển. Vui
                  lòng quay lại sau.
                </p>
                <div className="coming-soon">
                  <i className="fas fa-tools fa-3x mt-3"></i>
                  <p className="mt-3">
                    {sectionId === "6894cc50892a33de30593476" &&
                      "Part 12: Writing - Respond to a written request"}
                    {sectionId === "6894cc50892a33de30593477" &&
                      "Part 13: Writing - Write an opinion essay"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      // Legacy support for old sectionIds (backwards compatibility)
      case "104":
        return <No1To2 testId={testId} />;
      case "105":
        return <No3To4 testId={testId} />;
      case "106":
        return <No5To7 testId={testId} />;
      case "109":
        return <No1To5 testId={testId} />;
      case "107":
      case "108":
      case "110":
      case "111":
        return (
          <div className="col-12 text-center py-5">
            <div className="card">
              <div className="card-body">
                <h2>Đang phát triển</h2>
                <p className="lead">
                  Component cho phần này đang trong quá trình phát triển. Vui
                  lòng quay lại sau.
                </p>
                <div className="coming-soon">
                  <i className="fas fa-tools fa-3x mt-3"></i>
                  <p className="mt-3">
                    {sectionId === "107" && "Speaking Tasks 8-10"}
                    {sectionId === "108" && "Speaking Task 11"}
                    {sectionId === "110" && "Writing Tasks 6-7"}
                    {sectionId === "111" && "Writing Task 8"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="container mt-5 text-center">
            Không tìm thấy phần thi phù hợp
          </div>
        );
    }
  };

  return (
    <div className="bg-test">
      <div className="container-fluid">
        <div className="row mt-3">{renderComponent()}</div>
      </div>
    </div>
  );
};

export default StudySW;
