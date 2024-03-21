import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import Footer from "../components/footer";
import { Questions } from "../types/data";

export default function AnnotatorPage() {
  const { name } = useParams();

  // Use userId to differentiate between users in localStorage
  const getUserStorageKey = useCallback(
    (key: string) => `user_${name}_${key}`,
    [name]
  );
  const [currentQuestion, setCurrentQuestion] = useState<string>(
    localStorage.getItem(getUserStorageKey("currentQuestion")) || "0"
  );
  const [isFinished, setIsFinished] = useState<boolean>(
    localStorage.getItem(getUserStorageKey("isFinished")) === "true"
      ? true
      : false
  );

  const [questions, setQuestions] = useState<Questions>(
    JSON.parse(localStorage.getItem(getUserStorageKey("questions")) || '""') ||
      []
  );

  const fetchQuestions = useCallback(
    async (quizName?: string) => {
      try {
        const responseData = await fetch(`/data/${quizName}.json`);
        const data: {
          questions: Questions;
        } = await responseData.json();
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

  const fetchCompletionStatus = useCallback(async () => {
    try {
      const responseData = await fetch(
        `http://localhost:3001/is-completed?name=${name}`
      );
      console.log("test", responseData);
      const data: boolean = await responseData.json();
      setIsFinished(data);
    } catch (error) {
      console.error("Error fetching status:", error);
    }
  }, [name]);

  const submitQuiz = useCallback(() => {
    const allQuestionsAttempted = questions.every(
      (question) => question.response !== undefined
    );

    const allQuestionsModified = questions.every(
      (question) => question.modified
    );
    if (allQuestionsAttempted && allQuestionsModified) {
      setIsFinished(allQuestionsModified);
      if (allQuestionsModified) {
        sendDataToServer(name || "", questions);
        localStorage.removeItem(getUserStorageKey("currentQuestion"));
        localStorage.removeItem(getUserStorageKey("isFinished"));
        localStorage.removeItem(getUserStorageKey("questions"));
        fetchQuestions();
      }
    } else {
      alert("Please attempt all the questions!");
    }
  }, [fetchQuestions, getUserStorageKey, name, questions]);

  const handleAnswer = useCallback(
    (answer: "Yes" | "No") => {
      const updatedQuestions = questions.map((q, i) =>
        i === Number(currentQuestion) ? { ...q, response: answer } : q
      );
      setQuestions(updatedQuestions);
      localStorage.setItem(
        getUserStorageKey("questions"),
        JSON.stringify(updatedQuestions)
      );
    },
    [currentQuestion, getUserStorageKey, questions]
  );

  const handleNext = useCallback(() => {
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
      setCurrentQuestion(String(Number(currentQuestion) + 1));
      localStorage.setItem(
        getUserStorageKey("currentQuestion"),
        String(Number(currentQuestion) + 1)
      );
    } else {
      // If it's the last question, submit the quiz
      submitQuiz();
    }
  }, [currentQuestion, getUserStorageKey, questions, submitQuiz]);

  const handlePrevious = useCallback(() => {
    if (Number(currentQuestion) > 0) {
      setCurrentQuestion(String(Number(currentQuestion) - 1));
      localStorage.setItem(
        getUserStorageKey("currentQuestion"),
        String(Number(currentQuestion) - 1)
      );
    }
  }, [currentQuestion, getUserStorageKey]);

  useEffect(() => {
    fetchCompletionStatus();
  }, [fetchCompletionStatus]);

  useEffect(() => {
    if (!questions.length) {
      fetchQuestions(name || "");
    }
  }, [fetchQuestions, name, questions.length]);

  useEffect(() => {
    document.onkeydown = (event) => {
      switch (event.key) {
        case "a":
          handlePrevious();
          break;
        case "w":
          handleAnswer("Yes");
          break;
        case "s":
          handleAnswer("No");
          break;
        case "d":
          handleNext();
          break;
      }
    };

    return () => {
      document.onkeydown = null;
    };
  }, [handleAnswer, handleNext, handlePrevious]);

  const sendDataToServer = async (name: string, questions: Questions) => {
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

  const handleQuestionClick = (index: number) => {
    setCurrentQuestion(String(index));
    localStorage.setItem(getUserStorageKey("currentQuestion"), String(index));
  };

  return (
    <div>
      <div className="main_container">
        <div className="main">
          <h2>
            Welcome to the Annotation,{" "}
            {name ? name[0].toUpperCase() + name.substring(1) : ""}
          </h2>{" "}
          <br />
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
            {questions.map((_, index) => (
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
