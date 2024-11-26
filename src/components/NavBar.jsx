import UserInformation from "./UserInformation.jsx";
import Annotations from "./Annotations.jsx";
import AnnotationInput from "./AnnotationInput.jsx";
import { Button, Divider, Stack } from "@mantine/core";
import { useContext } from "react";
import { AnnotationsContext } from "../context/AnnotationsContext.jsx";
import ListOfAnnotations from "./ListOfAnnotations.jsx";

function NavBar({ code }) {
  const context = useContext(AnnotationsContext);

  const downloadFile = (content, filename) => {
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ flexGrow: 1, overflow: "auto" }}>
      <Stack gap="md">
        <UserInformation code={code} />
        <Divider />
        <Annotations />
        <Divider />
        <AnnotationInput />
        <Divider />
        <Button
          variant="filled"
          color="lime"
          onClick={() => {
            const interview = context.saveInterview();
            const jsonContent = JSON.stringify(interview, null, 2);
            downloadFile(jsonContent, "interview.json");
          }}
        >
          Submit Interview
        </Button>
        <Divider />
        <ListOfAnnotations />
      </Stack>
    </div>
  );
}

export default NavBar;
