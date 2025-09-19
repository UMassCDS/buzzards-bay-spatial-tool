import UserInformation from "./UserInformation.jsx";
import Annotations from "./Annotations.jsx";
import { Button, Divider, Stack } from "@mantine/core";
import { useContext } from "react";
import { AnnotationsContext } from "../context/AnnotationsContext.jsx";

function NavBar() {
  const context = useContext(AnnotationsContext);

  // const downloadFile = (content, filename) => {
  //   const blob = new Blob([content], { type: "application/json" });
  //   const url = URL.createObjectURL(blob);
  //   const link = document.createElement("a");
  //   link.href = url;
  //   link.download = filename;
  //   link.click();
  //   URL.revokeObjectURL(url);
  // };

  return (
    <div style={{ flexGrow: 1, overflow: "auto" }}>
      <Stack gap="md">
        <UserInformation />
        <Divider />
        <Annotations />
        <Divider />
        <Button
          variant="filled"
          color="lime"
          onClick={async () => {
            console.log("Saving interview - Button clicked");
            const response = await context.saveInterview();
            console.log(response);
            alert(response.message);
            if (response.success) {
              context.resetInterview();
            }
            // const jsonContent = JSON.stringify(response.interview, null, 2);
            // downloadFile(jsonContent, "interview.json");
          }}
        >
          Submit Data
        </Button>
      </Stack>
    </div>
  );
}

export default NavBar;
