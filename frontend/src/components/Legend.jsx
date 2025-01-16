import { useContext } from "react";
import { useDisclosure } from "@mantine/hooks";
import {
  Drawer,
  ActionIcon,
  Stack,
  Text,
  Divider,
  Button,
} from "@mantine/core";
import { GiHarborDock } from "react-icons/gi";
import { AnnotationsContext } from "../context/AnnotationsContext";

function Legend() {
  const [opened, { open, close }] = useDisclosure(false);
  const context = useContext(AnnotationsContext);

  return (
    <>
      <Drawer
        opened={opened}
        onClose={close}
        title="How to use this app?"
        styles={{
          drawer: {
            backgroundColor: "#000000",
            color: "#ffffff",
          },
          header: {
            backgroundColor: "#000000",
            color: "#ffffff",
          },
        }}
        position="right"
      >
        <Stack gap="xs" className="text-white">
          <h2 className="text-xl font-bold">Instructions</h2>
          <p>
            To begin an interview, enter the interviewee code provided by the
            researchers.
          </p>
          <p>The left panel contains fields for entering information.</p>
          <p>
            <strong>Annotation type</strong>: Classify the annotation.
          </p>
          <p>
            <strong>Annotation title</strong>: Short description of the
            annotation and its region.
          </p>
          <p>
            <strong>Annotation notes</strong>: Add details about the selected
            region.
          </p>
          <p>To select a region on the map:</p>
          <ul style={{ marginLeft: "20px" }}>
            <li>Click individual hexagons to select/deselect them</li>
            <li>Use multi-select mode to quickly highlight larger areas</li>
            <li>
              Click the hexagon icon in the top-left to draw custom polygons by
              placing points on the map
            </li>
            <li>
              Use the rectangle tool to erase multiple hexagons at once by
              drawing a rectangle
            </li>
          </ul>
          <Divider my="md" color="black" />
          <Text>
            If there is an error with the application, or you want to start the
            interview from the beginning. Warning, this action cannot be
            reversed!
          </Text>
          <Button
            onClick={context.resetInterview}
            variant="outline"
            color="red"
          >
            Clear current interview
          </Button>
        </Stack>
      </Drawer>
      <ActionIcon onClick={open} variant="outline" color="cyan">
        <GiHarborDock size={30} />
      </ActionIcon>
    </>
  );
}

export default Legend;
