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
import { useContext, useEffect } from "react";

function AnnotationInput() {
  const context = useContext(AnnotationsContext);
  const form = useForm({
    mode: "controlled",
    initialValues: {
      type: context.currentAnnotation.type,
      notes: context.currentAnnotation.notes,
    },
    validate: {
      notes: (value) => (value === "" ? "Please enter notes" : null),
    },
    // onValuesChange: (values) => {
    //   const updatedCurrentAnnotation = { ...context.currentAnnotation };
    //   updatedCurrentAnnotation.type = values.type;
    //   updatedCurrentAnnotation.notes = values.notes;

    //   context.setCurrentAnnotation(updatedCurrentAnnotation);
    // },
  });

  useEffect(() => {
    const { type, notes } = context.currentAnnotation;

    if (form.values.type !== type || form.values.notes !== notes) {
      form.setValues({
        type: type,
        notes: notes,
      });
    }
  }, [context.currentAnnotation]);

  const handleSubmit = (formValues) => {
    const updatedCurrentAnnotation = { ...context.currentAnnotation };
    updatedCurrentAnnotation.type = formValues.type;
    updatedCurrentAnnotation.notes = formValues.notes;

    if (updatedCurrentAnnotation !== undefined) {
      context.updatePriorAnnotations(updatedCurrentAnnotation);
    } else {
      context.addToPriorAnnotations(updatedCurrentAnnotation);
    }

    context.setCurrentAnnotation({
      type: form.values.type,
      notes: "",
      annotationHexes: [],
      createdAt: new Date(),
      modifiedAt: new Date(),
    });
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
            Add/Update Annotation
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
