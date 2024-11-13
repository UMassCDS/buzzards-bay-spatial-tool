import { createContext, useContext, useState } from "react";

const AnnotationsContext = createContext();

const AnnotationsContextProvider = ({ children }) => {
  const [priorAnnotations, setPriorAnnotations] = useState([]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [updatingAnnotation, setUpdatingAnnotation] = useState(false);

  const [currentAnnotation, setCurrentAnnotation] = useState({
    type: "Area of Interest",
    notes: "",
    annotationHexes: [],
    createdAt: new Date(),
    modifiedAt: new Date(),
  });

  const updateCurrentAnnotationHexagons = (hexIds) => {
    const updatedAnnotation = {
      ...currentAnnotation,
      annotationHexes: hexIds,
    };

    setCurrentAnnotation(updatedAnnotation);
  };

  const addToPriorAnnotations = (annotation) => {
    annotation = {
      index: currentIndex,
      ...annotation,
    };
    setPriorAnnotations((priors) => [...priors, annotation]);
    setCurrentIndex(currentIndex + 1);
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
        updatingAnnotation,
        updateCurrentAnnotationHexagons,
        setUpdatingAnnotation,
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
