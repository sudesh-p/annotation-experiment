import { useState } from "react";
import Footer from "../components/footer";
//import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const [annotator, setAnnotator] = useState("");
  //const navigate = useNavigate();

  const handleAnnotator = () => {
    if (annotator) {
      const url = `/annotator/${annotator}`;
      window.open(url, "_blank");
    }
    console.log(annotator); // Placeholder logic till we get Venkat's code.
  };

  return (
    <div id="root">
      <div className="main-container">
        <div className="container">
          <h1>Primal Belief Annotation Study Web Interface</h1>
          <div className="instructions">
            <p>
              1. Please go through the{" "}
              <a
                href="https://docs.google.com/document/d/1YMcO4OXxFWFaEbWT3t_IN794cdgL4mifw0rxsVcLp_g/edit"
                target="_blank"
                rel="noreferrer"
              >
                Annotation Guidelines
              </a>{" "}
              for the annotation. <br />
              2. Select your Name in the Dropdown Below. <br />
              3. Click on Start to Begin Annotating. <br />
            </p>
          </div>
          <select
            onChange={(e) => setAnnotator(e.target.value)}
            value={annotator}
          >
            <option value="">Select your Name</option>
            {/* Add annotators here */}
            <option value="bonnie">Bonnie</option>
            <option value="brodie">Brodie</option>
            <option value="justin">Justin</option>
          </select>
          <br />
          <button onClick={handleAnnotator}>Start</button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
