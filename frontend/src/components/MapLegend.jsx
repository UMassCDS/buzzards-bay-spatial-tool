import { Collapse, Text, Divider, Button, Tooltip, Group } from "@mantine/core";
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
        <Text bg="#222222" size="lg" p="md" style={{ borderRadius: "10px" }}>
          <h2 className="text-xl font-bold" style={{ color: "white" }}>
            Legend
          </h2>
          <Divider color="white" />
          <p style={{ color: "gray", fontWeight: "bold", fontSize: "16px" }}>
            Sensor colors, interpretation of sensor values.
          </p>
          <p style={{ color: "white", fontSize: "16px" }}>
            Whiter markers: Lower sensor value, close to 0
          </p>
          <p style={{ color: "#ff4444", fontSize: "16px" }}>
            Redder markers: Higher sensor value, close to 1
          </p>
          <Divider color="white" />
          <p style={{ color: "gray", fontWeight: "bold", fontSize: "16px" }}>
            Hexagon colors, interpretation of hexagon types.
          </p>
          {Object.entries(TYPES).map(([type, color]) => (
            <p style={{ color: color, fontSize: "16px" }} key={type}>
              {type}
            </p>
          ))}
        </Text>
      </Collapse>
    </>
  );
}

export default MapLegend;
