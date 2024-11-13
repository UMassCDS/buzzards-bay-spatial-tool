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
  });

  useEffect(() => {
    form.setValues({
      type: context.currentAnnotation.type,
      notes: context.currentAnnotation.notes,
    });
  }, [context.currentAnnotation]);

  const handleSubmit = (formValues) => {
    context.setUpdatingAnnotation(false);
    const updatedAnnotation = {
      ...context.currentAnnotation,
      ...formValues,
    };

    if (context.updatingAnnotation) {
      context.updatePriorAnnotations(updatedAnnotation);
    } else {
      context.addToPriorAnnotations(updatedAnnotation);
    }
    context.resetCurrentAnnotation();
  };

  const handleReset = (formValues) => {
    context.resetCurrentAnnotation();
    form.reset();
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Fieldset
        legend={
          context.updatingAnnotation
            ? "Edit Existing Annotation"
            : "New Annotation"
        }
      >
        <NativeSelect
          {...form.getInputProps("type")}
          withAsterisk
          label="Select Annotation Type"
          data={[
            "Area of Interest",
            "Suggested Sensor Location",
            "Comment on existing sensor location",
          ]}
          onChange={(event) => {
            form.setFieldValue("type", event.currentTarget.value);
            context.updateCurrentAnnotationType(event.currentTarget.value);
          }}
        />
        <Textarea
          {...form.getInputProps("notes")}
          label="Annotation Notes"
          placeholder="Enter your comments about the selected region"
        />
        <Group mt="md">
          <Button type="submit" variant="outline" color="green">
            {context.updatingAnnotation
              ? "Update Annotation"
              : "Add Annotation"}
          </Button>
          <Button
            type="button"
            variant="light"
            color="red"
            onClick={handleReset}
          >
            {context.updatingAnnotation ? "Cancel Update" : "Clear Annotation"}
          </Button>
        </Group>
      </Fieldset>
    </form>
  );
}

export default AnnotationInput;
