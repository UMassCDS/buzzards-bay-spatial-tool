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
import { AnnotationsContext } from "../context/AnnotationsContext";
import { useContext } from "react";

function AnnotationInput() {
  const context = useContext(AnnotationsContext);
  const form = useForm({
    mode: "controlled",
    initialValues: {
      type: "Area of Interest",
      notes: "",
    },
    validate: {
      notes: (value) => (value === "" ? "Please enter notes" : null),
    },
  });

  const handleSubmit = (formValues) => {
    const annotationValues = {
      ...formValues,
      annotationHexes: [],
    };

    console.log(annotationValues);
    context.addToPriorAnnotations(annotationValues);
    form.setFieldValue("notes", "");
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Fieldset legend="Edit Annotation">
        <NativeSelect
          {...form.getInputProps("type")}
          withAsterisk
          label="Select Annotation Type"
          data={[
            "Area of Interest",
            "Suggested Sensor Location",
            "Comment on existing sensor location",
          ]}
          mt="md"
        />
        <Textarea
          {...form.getInputProps("notes")}
          label="Annotation Notes"
          placeholder="Enter your comments about the selected region"
          mt="md"
        />
        <Group mt="md" justify="center">
          <Button type="submit" variant="outline" color="green">
            Add Annotation
          </Button>
          <Button
            type="button"
            variant="light"
            color="red"
            onClick={() => form.reset()}
          >
            Clear Annotation
          </Button>
        </Group>
      </Fieldset>
    </form>
  );
}

export default AnnotationInput;
