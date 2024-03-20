import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Footer } from "../components";

export default function AnnotatorPage() {
  let { name } = useParams();

  // Use userId to differentiate between users in localStorage
  const getUserStorageKey = useCallback((key) => `user_${name}_${key}`, [name]);
  const [currentQuestion, setCurrentQuestion] = useState(
    localStorage.getItem(getUserStorageKey("currentQuestion")) || 0
  );
  const [isFinished, setIsFinished] = useState(
    localStorage.getItem(getUserStorageKey("isFinished")) === "true"
      ? true
      : false
  );
  const [questions, setQuestions] = useState(
    JSON.parse(localStorage.getItem(getUserStorageKey("questions"))) || []
  );

  const fetchQuestions = useCallback(
    async (quizName) => {
      try {
        const responseData = await fetch(`/data/${quizName}.json`);
        const data = await responseData.json();
        const storedQuestions = data.questions.map((question) => ({
          ...question,
          modified: false,
        }));
        setQuestions(storedQuestions);
        localStorage.setItem(
          getUserStorageKey("questions"),
          JSON.stringify(storedQuestions)
        );
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    },
    [setQuestions, getUserStorageKey]
  );

  useEffect(() => {
    if (!questions.length) {
      fetchQuestions(name);
    }
  }, [fetchQuestions, name, questions.length]);

  const handleAnswer = (answer) => {
    const updatedQuestions = questions.map((q, i) =>
      i === Number(currentQuestion) ? { ...q, response: answer } : q
    );
    setQuestions(updatedQuestions);
    localStorage.setItem(
      getUserStorageKey("questions"),
      JSON.stringify(updatedQuestions)
    );
  };

  const handleNext = () => {
    const updatedQuestions = [...questions];
    updatedQuestions[Number(currentQuestion)] = {
      ...updatedQuestions[Number(currentQuestion)],
      modified: true,
    };
    setQuestions(updatedQuestions);
    localStorage.setItem(
      getUserStorageKey("questions"),
      JSON.stringify(updatedQuestions)
    );
  
    if (Number(currentQuestion) < questions.length - 1) {
      setCurrentQuestion(Number(currentQuestion) + 1);
      localStorage.setItem(
        getUserStorageKey("currentQuestion"),
        Number(currentQuestion) + 1
      );
    } else {
      // If it's the last question, submit the quiz
      submitQuiz();
    }
  };
  

  const submitQuiz = () => {
    const allQuestionsAttempted = questions.every(
      (question) => question.response !== undefined
    );
    if (allQuestionsAttempted) {
      const allQuestionsModified = questions.every(
        (question) => question.modified
      );
      setIsFinished(allQuestionsModified);
      if (allQuestionsModified) {
        console.log(questions);
        sendDataToServer(name, questions);
        localStorage.removeItem(getUserStorageKey("currentQuestion"));
        localStorage.removeItem(getUserStorageKey("isFinished"));
        localStorage.removeItem(getUserStorageKey("questions"));
        fetchQuestions()
      }
    } else {
      alert("Please attempt all the questions!");
    }
  }
  const sendDataToServer = async (name, questions) => {
    try {
      const response = await fetch("http://localhost:3001/create-file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, questions }),
      });

      if (response.ok) {
        console.log("Annotator Data saved successfully.");
        
      } else {
        throw new Error("Network response was not ok.");
      }
    } catch (error) {
      console.error(
        "There was a problem with the performed fetch operation: ",
        error
      );
    }
  };

  const handlePrevious = () => {
    if (Number(currentQuestion) > 0) {
      setCurrentQuestion(Number(currentQuestion) - 1);
      localStorage.setItem(
        getUserStorageKey("currentQuestion"),
        Number(currentQuestion) - 1
      );
    }
  };

  const handleQuestionClick = (index) => {
    setCurrentQuestion(index);
    localStorage.setItem(getUserStorageKey("currentQuestion"), index);
  };

  return (
    <div>
      <div className="main_container">
        <div className="main">
          <h2>Welcome to the Annotation, {name}</h2> <br />
          {!isFinished && questions.length > 0 ? (
            <div className="question_box">
              <h3>
                {" "}
                Do the following sentences imply a primal belief or not?{" "}
              </h3>
              <h2 className="question">
                {`Sentence ${Number(currentQuestion) + 1} of ${
                  questions.length
                }: ${questions[Number(currentQuestion)].sentence}`}
              </h2>
              <div className="input_box">
                <input
                  type="radio"
                  id="yes"
                  name="answer"
                  value="yes"
                  checked={
                    questions[Number(currentQuestion)].response === "Yes"
                  }
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
                  checked={questions[Number(currentQuestion)].response === "No"}
                  onChange={() => handleAnswer("No")}
                />
                <label htmlFor="no">No</label>
              </div>
              <div className="btn_container">
                <button
                  onClick={handlePrevious}
                  disabled={Number(currentQuestion) === 0}
                >
                  Previous
                </button>
                <button onClick={handleNext}>
                  {Number(currentQuestion) < questions.length - 1
                    ? "Next"
                    : "Finish"}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h1>
                You have completed the Phase 1 of the Annotations. Please wait
                for further instructions on Slack.{" "}
              </h1>
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
                  color: index === Number(currentQuestion) ? "#fff" : "#000",
                  textAlign: "left",
                  backgroundColor:
                    index === Number(currentQuestion) ? "#727272" : "#eee",
                  margin: "10px 0",
                  padding: "4px",
                }}
              >
                {`${index + 1}: ${
                  questions[index].sentence.length > 20
                    ? questions[index].sentence.substring(0, 20) + "..."
                    : questions[index].sentence
                }`}
                {questions[index].modified && (
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
