import "@mantine/core/styles.css";

import {
  AppShell,
  Burger,
  Button,
  Divider,
  Group,
  MantineProvider,
  Modal,
  Skeleton,
  TextInput,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { GiHarborDock } from "react-icons/gi";
import "./App.css";

import NavBar from "./components/NavBar";
import MainContent from "./components/MainContent";
import { useState, useContext, useEffect } from "react";
import { useField } from "@mantine/form";
import { AnnotationsContext } from "./context/AnnotationsContext";
import Legend from "./components/Legend";

function App() {
  const context = useContext(AnnotationsContext);
  const [navBarOpened, { toggle }] = useDisclosure();
  const [modalOpened, { open, close }] = useDisclosure(true);

  const validationFunction = (value) => {
    if (value === "") {
      return false;
    } else {
      return true;
    }
  };

  const userCodeField = useField({
    initialValue: "",
    validate: (value) => (validationFunction(value) ? "Code not valid" : null),
  });

  return (
    <MantineProvider>
      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: "30vw",
          breakpoint: "sm",
          collapsed: { mobile: !navBarOpened },
        }}
        padding="xs"
      >
        <Modal
          opened={modalOpened && context.intervieweeId === ""}
          onClose={close}
          title="Login"
          closeOnClickOutside={false}
          closeOnEscape={false}
          withCloseButton={false}
          trapFocus
        >
          <TextInput
            {...userCodeField.getInputProps()}
            required={true}
            label="User code"
            description="A User Code is required to access the tool. Please enter the User Code provided by the Interviewer."
            mb="md"
          />
          <Button
            disabled={!validationFunction(userCodeField.getValue())}
            onClick={() => {
              context.setIntervieweeId(userCodeField.getValue());
              close();
            }}
          >
            Log in
          </Button>
        </Modal>
        <AppShell.Header>
          <Group h="100%" px="sm">
            <Burger
              opened={navBarOpened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            {/* <GiHarborDock size={30} /> */}
            <Legend />
            <Title order={2}>COMBB Water Quality Monitoring Locations Interview Tool</Title>
          </Group>
        </AppShell.Header>
        <AppShell.Navbar
          p="md"
          style={{
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <NavBar />
        </AppShell.Navbar>
        <AppShell.Main>
          <MainContent />
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}

export default App;
