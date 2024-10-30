import "@mantine/core/styles.css";

import {
  AppShell,
  Burger,
  Divider,
  Group,
  MantineProvider,
  Skeleton,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { GiHarborDock } from "react-icons/gi";
import "./App.css";

import NavBar from "./components/NavBar";
import MainContent from "./components/MainContent";

function App() {
  const [navBarOpened, { toggle }] = useDisclosure();

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
        <AppShell.Header>
          <Group h="100%" px="sm">
            <Burger
              opened={navBarOpened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <GiHarborDock size={30} />
            <Title order={2}>Buzzards Bay Interview Tool</Title>
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
