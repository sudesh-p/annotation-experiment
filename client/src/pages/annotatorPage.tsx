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
  const [isFinished, setIsFinished] = useState<boolean>(false);

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
        (import.meta.env.MODE === "development"
          ? "http://localhost:3001/"
          : "https://annotation-experiment.netlify.app/api/") +
          `is-completed?name=${name}`
      );
      console.log("test", responseData);
      const data: boolean = await responseData.json();
      setIsFinished(data);
    } catch (error) {
      console.error("Error fetching status:", error);
    }
  }, [name]);

  const submitQuiz = useCallback(
    (completedQuestions: Questions) => {
      const allQuestionsAttempted = completedQuestions.every(
        (question) => question.response !== undefined
      );

      const allQuestionsModified = completedQuestions.every(
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
    },
    [fetchQuestions, getUserStorageKey, name, questions]
  );

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
      submitQuiz(updatedQuestions);
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
        case "ArrowLeft":
          handlePrevious();
          break;
        case "ArrowUp":
          handleAnswer("Yes");
          break;
        case "ArrowDown":
          handleAnswer("No");
          break;
        case "ArrowRight":
          handleNext();
          break;
      }
    };

    window.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
      }
    });

    return () => {
      document.onkeydown = null;
      window.removeEventListener("keydown", (event) => {
        if (event.key === "ArrowDown") {
          event.preventDefault();
        }
      });
    };
  }, [handleAnswer, handleNext, handlePrevious]);

  const sendDataToServer = async (name: string, questions: Questions) => {
    try {
      const response = await fetch(
        (import.meta.env.MODE === "development"
          ? "http://localhost:3001/"
          : "https://annotation-experiment.netlify.app/api/") + "create-file",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, questions }),
        }
      );

      if (response.ok) {
        console.log("Annotator Data saved successfully.");
      } else {
        alert("There was a problem saving the data. Please try again.");
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
        <div className="left-bar">
          <div className="text_box">
            <h3 style={{ textAlign: "center" }}>Good:</h3>
            <ul>
              <li>
                Safe
                <ul>
                  <li>Pleasurable</li>
                  <li>Regenerative</li>
                  <li>Progressing</li>
                  <li>Harmless</li>
                  <li>Cooperative</li>
                  <li>Stable</li>
                  <li>Just</li>
                </ul>
              </li>
              <li>
                Enticing
                <ul>
                  <li>Interesting</li>
                  <li>Beautiful</li>
                  <li>Abundant</li>
                  <li>Worth exploring</li>
                  <li>Improvable</li>
                  <li>Meaningful</li>
                  <li>Funny</li>
                </ul>
              </li>
              <li>
                Alive
                <ul>
                  <li>Intentional</li>
                  <li>Needs me</li>
                  <li>About me</li>
                </ul>
              </li>
            </ul>
          </div>

          <div className="text_box">
            <h3 style={{ textAlign: "center" }}>Bad:</h3>
            <ul>
              <li>
                Dangerous
                <ul>
                  <li>Miserable</li>
                  <li>Degenerative</li>
                  <li>Declining</li>
                  <li>Threatening</li>
                  <li>Competitive</li>
                  <li>Fragile</li>
                  <li>Unjust</li>
                </ul>
              </li>
              <li>
                Dull
                <ul>
                  <li>Boring</li>
                  <li>Ugly</li>
                  <li>Barren</li>
                  <li>Not Worth Exploring</li>
                  <li>Too Hard to Improve</li>
                  <li>Meaningless</li>
                  <li>Not Funny</li>
                </ul>
              </li>
              <li>
                Mechanistic
                <ul>
                  <li>Unintentional</li>
                  <li>Doesn't Need Me</li>
                  <li>Indifferent</li>
                </ul>
              </li>
            </ul>
          </div>

          <div className="text_box">
            <h3 style={{ textAlign: "center" }}>Tertiaries with No Secondary:</h3>
            <ul>
              <ul>
                <li>Acceptable</li>
                <li>Changing</li>
                <li>Hierarchical</li>
                <li>Interconnected</li>
                <li>Understandable</li>
              </ul>

              <ul>
                <li>Unacceptable</li>
                <li>Static</li>
                <li>Non Hierarchical</li>
                <li>Separable</li>
                <li>Too Hard To Understand</li>
              </ul>
            </ul>
          </div>
        </div>
        <div className="main">
          <h2>
            Welcome to the Annotation,{" "}
            {name ? name[0].toUpperCase() + name.substring(1) : ""}
          </h2>{" "}
          <p
            style={{
              textAlign: "center",
              fontSize: "1.2rem",
              color: "#000",
              margin: "10px 0",
            }}
          >
            Here you will be presented with a series of sentences. Your task is
            to determine whether each sentence implies a primal belief or not.
          </p>
          <p
            style={{
              textAlign: "center",
              fontSize: "1.2rem",
              color: "#000",
              margin: "10px 0",
            }}
          >
            To navigate through the sentences, you can use the arrow keys or
            your mouse to interact with the buttons.
          </p>
          <p
            style={{
              textAlign: "center",
              fontSize: "1.2rem",
              color: "#000",
              margin: "10px 0",
            }}
          >
            Feel free to stop and take a break at any time! Your progress will
            be saved automatically even if the browser is closed.
          </p>
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
                <label htmlFor="yes">Yes (↑)</label>
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
                <label htmlFor="no">No (↓)</label>
              </div>
              <div className="btn_container">
                <button
                  onClick={handlePrevious}
                  disabled={Number(currentQuestion) === 0}
                >
                  Previous (←)
                </button>
                <button onClick={handleNext}>
                  {Number(currentQuestion) < questions.length - 1
                    ? "Next (→)"
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
