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
          <p style={{ color: "gray", fontWeight: "bold" }}>
            Sensor colors, interpretation of sensor values.
          </p>
          <p style={{ color: "white" }}>White markers: Low sensor value (0)</p>
          <p style={{ color: "#ff4444" }}>Red markers: High sensor value (1)</p>
          <Divider color="white" />
          <p style={{ color: "gray", fontWeight: "bold" }}>
            Hexagon colors, interpretation of hexagon types.
          </p>
          {Object.entries(TYPES).map(([type, color]) => (
            <p style={{ color: color }} key={type}>
              {type}
            </p>
          ))}
        </Text>
      </Collapse>
    </>
  );
}

export default MapLegend;
