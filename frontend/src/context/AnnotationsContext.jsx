import { createContext, useState, useEffect } from "react";
import TYPES from "./AnnotationTypes";

const AnnotationsContext = createContext();

// eslint-disable-next-line react/prop-types
const AnnotationsContextProvider = ({ children }) => {
  const [annotationTypes, setAnnotationTypes] = useState(TYPES);
  const [priorAnnotations, setPriorAnnotations] = useState([]);
  const [editingAnnotation, setEditingAnnotation] = useState(false);
  const [viewingPriorAnnotation, setViewingPriorAnnotation] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [updatingAnnotation, setUpdatingAnnotation] = useState(false);

  const [currentNotes, setCurrentNotes] = useState({
    type: "Area of Interest",
    title: "",
    notes: "",
    createdAt: new Date(),
    modifiedAt: new Date(),
  });

  const [intervieweeId, setIntervieweeId] = useState("");

  const [currentHexes, setCurrentHexes] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const setCurrentAnnotation = (annotation) => {
    setCurrentNotes({
      index: annotation["index"],
      type: annotation["type"],
      title: annotation["title"],
      notes: annotation["notes"],
      createdAt: annotation["createdAt"],
      modifiedAt: annotation["modifiedAt"],
    });
    setCurrentHexes(annotation["annotationHexes"]);
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
    console.log(priorAnnotations);
    if (annotation.index) {
      if (!priorAnnotations.find((prior) => prior.index === annotation.index)) {
        addToPriorAnnotations(annotation);
      } else {
        setPriorAnnotations((priors) =>
          priors.map((prior) =>
            prior.index === annotation.index ? annotation : prior
          )
        );
      }
    } else {
      addToPriorAnnotations(annotation);
    }
  };

  const resetCurrentAnnotation = () => {
    setUpdatingAnnotation(false);
    setCurrentNotes({
      type: "Area of Interest",
      title: "",
      notes: "",
      createdAt: new Date(),
      modifiedAt: new Date(),
    });

    setCurrentHexes([]);
  };

  const updateCurrentAnnotationType = (newType) => {
    setCurrentNotes((prevNotes) => ({
      ...prevNotes,
      type: newType,
    }));
  };

  const deleteFromPriorAnnotations = (annotation) => {
    setPriorAnnotations(
      [...priorAnnotations].filter((value) => annotation.index !== value.index)
    );
  };

  const saveInterview = async () => {
    const interview = {};
    interview.intervieweeId = intervieweeId;
    interview.annotations = priorAnnotations;
    console.log(interview);
    try {
      console.log("Saving interview");
      console.log(`${import.meta.env.VITE_BACKEND_IP}/api/save`);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_IP}/api/save`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(interview),
        }
      );
      if (!response.ok) {
        throw new Error(`Error saving interview! status: ${response.status}`);
      }
      return {
        success: true,
        message: "Interview saved successfully",
        interview,
      };
    } catch (error) {
      console.error("Error saving interview", error);
      return { success: false, message: "Error saving interview", interview };
    }
  };

  const saveStateToStorage = () => {
    const state = {
      priorAnnotations,
      currentIndex,
      currentNotes,
      intervieweeId,
      currentHexes,
    };
    localStorage.setItem("annotationsState", JSON.stringify(state));
  };

  const clearStateFromStorage = () => {
    localStorage.removeItem("annotationsState");
  };

  useEffect(() => {
    console.log(`Backend: ${import.meta.env.VITE_BACKEND_IP}`);
    fetch(`${import.meta.env.VITE_BACKEND_IP}`).then((response) =>
      console.log("Connection: ", response.status)
    );

    const loadStateFromStorage = async () => {
      const savedState = localStorage.getItem("annotationsState");
      if (savedState) {
        const {
          priorAnnotations,
          currentIndex,
          currentNotes,
          intervieweeId,
          currentHexes,
        } = JSON.parse(savedState);

        setPriorAnnotations(priorAnnotations || []);
        setCurrentIndex(currentIndex || 0);
        setCurrentNotes(
          currentNotes || {
            type: "Area of Interest",
            title: "",
            notes: "",
            createdAt: new Date(),
            modifiedAt: new Date(),
          }
        );
        setIntervieweeId(intervieweeId || "");
        setCurrentHexes(currentHexes || []);
      }
      setIsInitialized(true);
    };

    loadStateFromStorage();
  }, []);

  useEffect(() => {
    if (isInitialized) {
      saveStateToStorage();
    }
  }, [
    priorAnnotations,
    currentNotes,
    currentIndex,
    intervieweeId,
    currentHexes,
  ]);

  const resetInterview = () => {
    setPriorAnnotations([]);
    setCurrentIndex(0);
    resetCurrentAnnotation();
    clearStateFromStorage();
    setIntervieweeId("");
    window.location.reload();
  };

  return (
    <AnnotationsContext.Provider
      value={{
        editingAnnotation,
        viewingPriorAnnotation,
        priorAnnotations,
        currentNotes,
        currentHexes,
        updatingAnnotation,
        intervieweeId,
        annotationTypes,
        resetInterview,
        setIntervieweeId,
        setEditingAnnotation,
        setViewingPriorAnnotation,
        saveInterview,
        saveStateToStorage,
        clearStateFromStorage,
        setCurrentNotes,
        setCurrentHexes,
        updateCurrentAnnotationType,
        resetCurrentAnnotation,
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
