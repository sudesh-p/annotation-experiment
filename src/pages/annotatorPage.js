import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Footer } from "../components";

export default function AnnotatorPage() {
  let { name } = useParams();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    fetchQuestions(name);
  }, [name]); 
  const fetchQuestions = async (quizName) => {
    try {
      const responseData = await fetch(`/data/${quizName}.json`); 
      const data = await responseData.json();
      setQuestions(
        data.questions.map((question) => ({ ...question, modified: false }))
      );
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  const handleAnswer = (answer) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q, i) =>
        i === currentQuestion ? { ...q, response: answer } : q
      )
    );
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      const updatedQuestions = [...questions];
      updatedQuestions[currentQuestion] = {
        ...updatedQuestions[currentQuestion],
        modified: true,
      };
      setQuestions(updatedQuestions);
      setCurrentQuestion(currentQuestion + 1);
    } 
    else 
    {
      const updatedQuestions = [...questions];
      updatedQuestions[currentQuestion] = {
        ...updatedQuestions[currentQuestion],
        modified: true,
      };
      setQuestions(updatedQuestions);

      const allQuestionsModified = updatedQuestions.every(
        (question) => question.modified
      );

      setIsFinished(allQuestionsModified);
      if (allQuestionsModified) 
      {
        console.log(questions);
        sendDataToServer(name, updatedQuestions);
      }
       else {
        alert("Please attempt all the questions!");
      }
    }
  };

  const sendDataToServer = async (name, questions) => {
  try {
      const response = await fetch('http://localhost:3001/create-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, questions }),
      });

      if (response.ok) 
      {
        console.log('Annotator Data saved successfully.');
      } 
      else 
      {
        throw new Error('Network response was not ok.');
      }
    } catch (error) 
    {
      console.error('There was a problem with the performed fetch operation: ', error);
    }
  };

  const handlePrevious = () => {
    setCurrentQuestion(currentQuestion - 1);
  };

  const handleQuestionClick = (index) => {
    setCurrentQuestion(index);
  };

  return (
    <div>
      <div className="main_container">
        <div className="main">
          <h2>Welcome to the Annotation, {name}</h2> <br />
          {!isFinished && questions.length > 0 ? (
            <div className="question_box">
              <h3> Do the following sentences imply a primal belief or not? </h3>
              <h2 className="question">
                {`Sentence ${currentQuestion + 1} of ${questions.length}: ` +
                  questions[currentQuestion].sentence}
              </h2>
              <div className="input_box">
                <input
                  type="radio"
                  id="yes"
                  name="answer"
                  value="yes"
                  checked={questions[currentQuestion].response === "Yes"}
                  onChange={() => handleAnswer("Yes")}
                />
                <label htmlFor="yes">Yes</label>
              </div>
              <div className="input_box">
                <input
                  type="radio"
                  id="no"
                  name="answer"
                  value="no"
                  checked={questions[currentQuestion].response === "No"}
                  onChange={() => handleAnswer("No")}
                />
                <label htmlFor="no">No</label>
              </div>
              <div className="btn_container">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                >
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  // disabled={currentQuestion === questions.length - 1}
                >
                  {currentQuestion < questions.length - 1 ? "Next" : "Finish"}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h1>You have completed the Phase 1 of the Annotations. Please wait for further instructions on Slack. </h1>
            </div>
          )}
        </div>
        <div className="side_bar">
          <h3>Sentences</h3>
          <div>
            {questions.map((question, index) => (
              <p
                key={index}
                onClick={() => handleQuestionClick(index)}
                style={{
                  cursor: "pointer",
                  color: index === currentQuestion ? "#fff" : "#000",
                  textAlign: "left",
                  backgroundColor:
                    index === currentQuestion ? "#727272" : "#eee",
                  margin: "10px 0",
                  padding: "4px",
                }}
              >
               {`${index + 1}: ${questions[index].sentence.length > 20 ? questions[index].sentence.substring(0, 20) + "..." : questions[index].sentence}`}
                {question.modified && (
                  <span style={{ color: "green" }}>&#10003;</span>
                )}
              </p>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
