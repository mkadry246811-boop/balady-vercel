import React from "react";
import "../styles/PublicWelcome.css";

const PublicWelcome = () => {
  return (
    <div className="public-welcome-container">
      <div className="public-welcome-card">
        <h1 className="public-welcome-title">أهلاً بك، زائرنا الكريم!</h1>
        <p className="public-welcome-subtitle">
          يسعدنا انضمامك إلينا اليوم. نتمنى لك تجربة ممتعة.
        </p>
      </div>
    </div>
  );
};

export default PublicWelcome;
