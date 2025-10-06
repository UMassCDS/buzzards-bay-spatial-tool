import UserInformation from "./UserInformation.jsx";
import Annotations from "./Annotations.jsx";
import { Button, Divider, Stack } from "@mantine/core";
import { useContext } from "react";
import { AnnotationsContext } from "../context/AnnotationsContext.jsx";

function NavBar() {
  const context = useContext(AnnotationsContext);

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
            alert(response.message);
            if (response.success) {
              context.resetInterview();
            }
          }}
        >
          Submit Data
        </Button>
      </Stack>
    </div>
  );
}

export default NavBar;
