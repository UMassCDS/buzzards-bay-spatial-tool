import { createContext, useContext, useState } from "react";

const AnnotationsContext = createContext();

const AnnotationsContextProvider = ({ children }) => {
  const [priorAnnotations, setPriorAnnotations] = useState([
    { type: "Area of Interest", notes: "I got fish", annotationHexes: [] },
    {
      type: "Suggested Sensor Location",
      notes: "Something",
      annotationHexes: [],
    },
    {
      type: "Comment on existing sensor location",
      notes: "Another note",
      annotationHexes: [],
    },
  ]);

  const [currentAnnotation, setCurrentAnnotation] = useState({});

  const addToPriorAnnotations = (annotation) => {
    setPriorAnnotations((priors) => [...priors, annotation]);
  };

  const deleteFromPriorAnnotations = (idx) => {
    let array = [...priorAnnotations];
    array.splice(idx, 1);
    setPriorAnnotations(array);
  };

  return (
    <AnnotationsContext.Provider
      value={{
        priorAnnotations,
        setPriorAnnotations,
        addToPriorAnnotations,
        deleteFromPriorAnnotations,
      }}
    >
      {children}
    </AnnotationsContext.Provider>
  );
};

// const useAnnotationsContext = () => {
//   return useContext(AnnotationsContext);
// };

export { AnnotationsContextProvider, AnnotationsContext };
