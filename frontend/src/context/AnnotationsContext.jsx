import { createContext, useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import * as h3 from "h3-js";
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
  const [selectedRegion, setSelectedRegion] = useState("newengland");

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
    // Compact each annotation's hexes before sending. A filled area of same-resolution
    // hexes collapses into far fewer mixed-resolution cells, which keeps the request
    // body small for large selections. The backend un-compacts them before storing.
    interview.annotations = priorAnnotations.map((annotation) => {
      const hexes = annotation.annotationHexes;
      if (!hexes || hexes.length === 0) {
        return annotation;
      }
      try {
        return { ...annotation, annotationHexes: h3.compactCells(hexes) };
      } catch (error) {
        console.warn("Failed to compact hexes, sending uncompacted", error);
        return annotation;
      }
    });
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
        // Surface the backend's descriptive message when available (e.g. a 413 for
        // an area that is too large even after compaction).
        const body = await response.json().catch(() => null);
        const message =
          body?.message || `Error saving interview! status: ${response.status}`;
        return { success: false, message, interview };
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
      selectedRegion,
    };
    localStorage.setItem("annotationsState", JSON.stringify(state));
  }, [priorAnnotations, currentIndex, intervieweeId, selectedRegion]);

  const clearStateFromStorage = () => {
    localStorage.removeItem("annotationsState");
  };

  useEffect(() => {
    const loadStateFromStorage = async () => {
      const savedState = localStorage.getItem("annotationsState");
      if (savedState) {
        const {
          priorAnnotations,
          currentIndex,
          intervieweeId,
          selectedRegion,
        } = JSON.parse(savedState);

        setPriorAnnotations(priorAnnotations || []);
        setCurrentIndex(currentIndex || 0);
        setIntervieweeId(intervieweeId || "");
        setSelectedRegion(selectedRegion || "newengland");
      }
      setIsInitialized(true);
    };

    loadStateFromStorage();
  }, []);

  useEffect(() => {
    if (isInitialized) {
      saveStateToStorage();
    }
    // saveStateToStorage only persists priorAnnotations/currentIndex/
    // intervieweeId/selectedRegion, so only re-save when those change (via the
    // useCallback identity). Depending on currentHexes/currentNotes here would
    // re-serialize everything to localStorage on every hex click and keystroke.
  }, [isInitialized, saveStateToStorage]);

  const resetInterview = () => {
    setPriorAnnotations([]);
    setCurrentIndex(0);
    resetCurrentAnnotation();
    clearStateFromStorage();
    setIntervieweeId("");
    setSelectedRegion("newengland");
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
        selectedRegion,
        setSensorDataVisible,
        setSensorLocationsVisible,
        setSelectedRegion,
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
