import { createContext, useContext, useState } from "react";

const AnnotationsContext = createContext();

const AnnotationsContextProvider = ({ children }) => {
  const [priorAnnotations, setPriorAnnotations] = useState([
    {
      index: 0,
      type: "Area of Interest",
      notes: "I got fish",
      annotationHexes: [],
      createdAt: new Date(),
      modifiedAt: new Date(),
    },
    {
      index: 1,
      type: "Suggested Sensor Location",
      notes: "Something",
      annotationHexes: [],
      createdAt: new Date(),
      modifiedAt: new Date(),
    },
    {
      index: 2,
      type: "Comment on existing sensor location",
      notes: "Another note",
      annotationHexes: [],
      createdAt: new Date(),
      modifiedAt: new Date(),
    },
  ]);

  let currentIndex = 3;

  const [currentAnnotation, setCurrentAnnotation] = useState({
    type: "Area of Interest",
    notes: "",
    annotationHexes: [],
    createdAt: new Date(),
    modifiedAt: new Date(),
  });

  const addToPriorAnnotations = (annotation) => {
    annotation = {
      index: currentIndex,
      ...annotation,
    };
    setPriorAnnotations((priors) => [...priors, annotation]);
    currentIndex += 1;
  };

  const updatePriorAnnotations = (annotation) => {
    if (priorAnnotations.find((value) => value.index === annotation.index)) {
      const updatedAnnotations = priorAnnotations.map((value) => {
        if (value.index === annotation.index) {
          return annotation;
        } else {
          return value;
        }
      });

      setPriorAnnotations(updatedAnnotations);
    } else {
      addToPriorAnnotations(annotation);
    }
  };

  const deleteFromPriorAnnotations = (annotation) => {
    setPriorAnnotations(
      [...priorAnnotations].filter((value) => annotation.index !== value.index)
    );
  };

  return (
    <AnnotationsContext.Provider
      value={{
        priorAnnotations,
        currentAnnotation,
        setCurrentAnnotation,
        setPriorAnnotations,
        addToPriorAnnotations,
        updatePriorAnnotations,
        deleteFromPriorAnnotations,
      }}
    >
      {children}
    </AnnotationsContext.Provider>
  );
};

export { AnnotationsContextProvider, AnnotationsContext };
