import { useDisclosure } from "@mantine/hooks";
import { Drawer, ActionIcon } from "@mantine/core";
import { GiHarborDock } from "react-icons/gi";

function Legend() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Drawer opened={opened} onClose={close} title="How to use this app?">
        <h2>Instructions</h2>
        <p>
          To start an interview, you have to provide an interviewee code,
          defined by the researchers.
        </p>
        <p>
          On the left side you have fields you can fill in. Annotation type
          classifies your annotation. Annotation notes denote information you
          want to share about the selected region. To select a region on the
          map, you can click to place hexagons, and click again to remove a
          hexagon. You can also multiselect a large region. On the top left of
          the map, click on the hexagon symbol, this will allow you to place
          points on a map to draw a polygon. The rectangle symbol draws a
          rectangle and deletes hexagons in the covered region.
        </p>
        <h2>Manual</h2>
        <p>To be filled out...</p>
        <h2>Legend</h2>
        <p>White markers represent low sensor value: 0</p>
        <p>Red markers represent high sensor value: 1</p>
      </Drawer>
      <ActionIcon onClick={open} variant="outline" color="cyan">
        <GiHarborDock size={30} />
      </ActionIcon>
    </>
  );
}

export default Legend;
