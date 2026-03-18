import {
  createContext,
  createSignal,
  onCleanup,
  onMount,
  ParentComponent,
  useContext,
} from "solid-js";
import { Bus } from "../utils/bus/bus";
import { Question } from "../utils/question";

type QuestionContextValue = {
  questions: () => string[];
  reply: (answers: string[]) => void;
};

const QuestionContext = createContext<QuestionContextValue>();

export const QuestionProvider: ParentComponent = (props) => {
  const [questions, setQuestions] = createSignal<string[]>([]);

  onMount(() => {
    const unsub = Bus.subscribe(Question.Event.Asked, (event) => {
      setQuestions(event.properties.questions);
    });

    onCleanup(unsub);
  });

  function reply(answers: string[]) {
    setQuestions([]);
    Bus.publish(Question.Event.Reply, { answers });
  }

  return (
    <QuestionContext.Provider value={{ questions, reply }}>
      {props.children}
    </QuestionContext.Provider>
  );
};

export function useQuestion() {
  const ctx = useContext(QuestionContext);
  if (!ctx) throw new Error("useQuestion must be used within QuestionProvider");
  return ctx;
}
