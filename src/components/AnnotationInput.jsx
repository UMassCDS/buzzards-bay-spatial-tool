import { useForm } from "@mantine/form";
import {
  TextInput,
  Fieldset,
  NativeSelect,
  Textarea,
  Group,
  Box,
  Text,
  Button,
  Flex,
} from "@mantine/core";

function AnnotationInput() {
  return (
    <Fieldset legend="Edit Annotation">
      <NativeSelect
        withAsterisk
        label="Select Annotation Type"
        data={[
          "Area of Interest",
          "Suggested Sensor Location",
          "Comment on Existing Sensors",
        ]}
        mt="md"
      />
      <Textarea
        label="Annotation Notes"
        placeholder="Enter your comments about the selected region"
        mt="md"
      />
      <Group mt="md" justify="center">
        <Button variant="outline" color="green">
          Add Annotation
        </Button>
        <Button variant="light" color="red">
          Clear Annotation
        </Button>
      </Group>
    </Fieldset>
  );
}

export default AnnotationInput;
