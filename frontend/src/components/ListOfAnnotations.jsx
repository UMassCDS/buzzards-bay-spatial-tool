import { useContext } from "react";
import { AnnotationsContext } from "../context/AnnotationsContext.jsx";
import { Stack, Text, Collapse, Group, Button } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

function ListOfAnnotations() {
  const [opened, { toggle }] = useDisclosure(false);
  const context = useContext(AnnotationsContext);
  const label = "Area of Interest";

  return (
    <div>
      <Group justify="center" mb="md">
        <Button onClick={toggle} variant="outline" color="grey" radius="md">
          List of Area of Interests | {opened ? "Hide" : "Show"}
        </Button>
      </Group>
      <Collapse in={opened}>
        <Stack gap="sm">
          {context.priorAnnotations
            .filter((item) => item.type === label)
            .map((item, index) => (
              <Text size="md" key={index} c="dark.4" px="sm">
                {item.title}
              </Text>
            ))}
        </Stack>
      </Collapse>
    </div>
  );
}

export default ListOfAnnotations;
