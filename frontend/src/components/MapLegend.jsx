import {
  Collapse,
  Divider,
  Button,
  Tooltip,
  Group,
  Stack,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import TYPES from "../context/AnnotationTypes";

function MapLegend() {
  const [opened, { toggle }] = useDisclosure(false);

  return (
    <>
      <Group justify="center">
        <Tooltip label="Toggle displaying the legend">
          <Button onClick={toggle} variant="outline" color="grey" radius="md">
            Legend | {opened ? "Hide" : "Show"}
          </Button>
        </Tooltip>
      </Group>
      <Collapse in={opened}>
        <Stack bg="#000000" p="md" style={{ borderRadius: "10px" }}>
          <h2 className="text-xl font-bold" style={{ color: "white" }}>
            Legend
          </h2>
          <Divider color="white" />
          <div style={{ color: "gray", fontWeight: "bold", fontSize: "16px" }}>
            Sensor colors, interpretation of sensor values.
          </div>
          <div style={{ color: "white", fontSize: "16px" }}>
            Whiter markers: Lower sensor value, close to 0
          </div>
          <div style={{ color: "#ff4444", fontSize: "16px" }}>
            Redder markers: Higher sensor value, close to 1
          </div>
          <div style={{ color: "purple", fontSize: "16px" }}>
            Purple markers: No value, just displays the location of the sensor
          </div>
          <Divider color="white" />
          <div style={{ color: "gray", fontWeight: "bold", fontSize: "16px" }}>
            Hexagon colors, interpretation of hexagon types.
          </div>
          {Object.entries(TYPES).map(([type, color]) => (
            <div style={{ color: color, fontSize: "16px" }} key={type}>
              {type}
            </div>
          ))}
        </Stack>
      </Collapse>
    </>
  );
}

export default MapLegend;
