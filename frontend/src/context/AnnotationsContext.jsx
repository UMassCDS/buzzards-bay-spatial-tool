import { createContext, useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import TYPES from "./AnnotationTypes";

const AnnotationsContext = createContext();

const AnnotationsContextProvider = ({ children }) => {
  const [annotationTypes, setAnnotationTypes] = useState(TYPES);
  const [priorAnnotations, setPriorAnnotations] = useState([]);
  const [editingAnnotation, setEditingAnnotation] = useState(false);
  const [viewingPriorAnnotation, setViewingPriorAnnotation] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [updatingAnnotation, setUpdatingAnnotation] = useState(false);

  const [sensorDataVisible, setSensorDataVisible] = useState(true);
  const [sensorLocationsVisible, setSensorLocationsVisible] = useState(true);

  const [currentNotes, setCurrentNotes] = useState({
    type: "Area of Importance",
    dataTitle: "",
    locationRating: "Not applicable",
    explanation: "",
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
      dataTitle: annotation["dataTitle"] || "",
      locationRating: annotation["locationRating"] || "Not applicable",
      explanation: annotation["explanation"] || "",
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
    if (Object.keys(annotation).includes("index")) {
      const existingAnnotation = priorAnnotations.find(
        (prior) => prior.index === annotation.index
      );

      if (!existingAnnotation) {
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
      type: "Area of Importance",
      dataTitle: "",
      locationRating: "Not applicable",
      explanation: "",
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

  const updateCustomColor = (color) => {
    setAnnotationTypes((prevTypes) => ({
      ...prevTypes,
      Custom: color,
    }));
  };

  const saveInterview = async () => {
    const interview = {};
    interview.intervieweeId = intervieweeId;
    interview.annotations = priorAnnotations;
    try {
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

  const saveStateToStorage = useCallback(() => {
    const state = {
      priorAnnotations,
      currentIndex,
      intervieweeId,
    };
    localStorage.setItem("annotationsState", JSON.stringify(state));
  }, [priorAnnotations, currentIndex, intervieweeId]);

  const clearStateFromStorage = () => {
    localStorage.removeItem("annotationsState");
  };

  useEffect(() => {
    const loadStateFromStorage = async () => {
      const savedState = localStorage.getItem("annotationsState");
      if (savedState) {
        const { priorAnnotations, currentIndex, intervieweeId } =
          JSON.parse(savedState);

        setPriorAnnotations(priorAnnotations || []);
        setCurrentIndex(currentIndex || 0);
        setIntervieweeId(intervieweeId || "");
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
    isInitialized,
    saveStateToStorage,
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
        sensorDataVisible,
        sensorLocationsVisible,
        setSensorDataVisible,
        setSensorLocationsVisible,
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
        updateCustomColor,
      }}
    >
      {children}
    </AnnotationsContext.Provider>
  );
};
AnnotationsContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { AnnotationsContextProvider, AnnotationsContext };
