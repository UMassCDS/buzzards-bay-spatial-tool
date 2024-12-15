import { createContext, useState, useEffect } from "react";

const AnnotationsContext = createContext();

const TYPES = {
  "Area of Interest": "#137ac2",
  "Suggested Sensor Location": "#84aa10",
  "Comment on existing sensor location": "#c23b8a",
};

const AnnotationsContextProvider = ({ children }) => {
  const [annotationTypes, setAnnotationTypes] = useState({});

  const fetchAnnotationTypes = async () => {
    try {
      // const response = await fetch("data/annotationtypes.json");
      // if (!response.ok) {
      //   throw new Error(`Error loading types! status: ${response.status}`);
      // }
      // const data = await response.json();
      const data = TYPES; // After Vite build, it could not fetch the JSON file, using this shortcut for now
      setAnnotationTypes(data);
    } catch (error) {
      console.error("Could not load annotation types:", error);
    }
  };

  const [priorAnnotations, setPriorAnnotations] = useState([]);

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
    if (annotation.index) {
      setPriorAnnotations((priors) => [...priors, annotation]);
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
      console.log(
        `http://localhost:${import.meta.env.VITE_BACKEND_PORT}/api/save`
      );
      const response = await fetch(
        `http://localhost:${import.meta.env.VITE_BACKEND_PORT}/api/save`,
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
      // setPriorAnnotations([]);
      // setCurrentIndex(0);
      // resetCurrentAnnotation();
      // clearStateFromStorage();
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

        await fetchAnnotationTypes();

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
        priorAnnotations,
        currentNotes,
        currentHexes,
        updatingAnnotation,
        intervieweeId,
        annotationTypes,
        resetInterview,
        setIntervieweeId,
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
