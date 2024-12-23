import { useForm } from "@mantine/form";
import {
  Fieldset,
  NativeSelect,
  Textarea,
  Group,
  Button,
  TextInput,
  Stack,
} from "@mantine/core";
import { AnnotationsContext } from "../context/AnnotationsContext";
import { useContext, useEffect } from "react";

function AnnotationInput() {
  const context = useContext(AnnotationsContext);
  const form = useForm({
    mode: "controlled",
    initialValues: {
      type: context.currentNotes.type,
      title: context.currentNotes.title,
      notes: context.currentNotes.notes,
    },
    validate: {
      title: (value) => (value === "" ? "Please enter a title" : null),
      notes: (value) => (value === "" ? "Please enter notes" : null),
    },
  });

  useEffect(() => {
    form.setValues({
      type: context.currentNotes.type,
      title: context.currentNotes.title,
      notes: context.currentNotes.notes,
    });
  }, [context.currentNotes]);

  const handleSubmit = (formValues) => {
    const updatedAnnotation = {
      ...context.currentNotes,
      ...formValues,
      annotationHexes: context.currentHexes,
    };

    context.updatePriorAnnotations(updatedAnnotation);
    context.resetCurrentAnnotation();
    context.setUpdatingAnnotation(false);
  };

  const handleReset = (formValues) => {
    const updatedAnnotation = {
      ...context.currentNotes,
      annotationHexes: context.currentHexes,
    };

    if (context.updatingAnnotation) {
      context.updatePriorAnnotations(updatedAnnotation);
    }

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
        <Stack gap="sm">
          <NativeSelect
            {...form.getInputProps("type")}
            withAsterisk
            label="Select Annotation Type"
            data={Object.keys(context.annotationTypes)}
            onChange={(event) => {
              form.setFieldValue("type", event.currentTarget.value);
              // context.updateCurrentAnnotationType(event.currentTarget.value);
              const updatedNotes = {
                ...context.currentNotes,
                ...form.values,
                type: event.currentTarget.value,
              };

              console.log(updatedNotes);
              context.setCurrentNotes(updatedNotes);
            }}
          />
          <TextInput
            {...form.getInputProps("title")}
            label="Annotation Title"
            placeholder="Enter a title for your annotation"
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
              {context.updatingAnnotation
                ? "Cancel Update"
                : "Clear Annotation"}
            </Button>
          </Group>
        </Stack>
      </Fieldset>
    </form>
  );
}

export default AnnotationInput;

// import { useForm } from "@mantine/form";
// import {
//   Fieldset,
//   NativeSelect,
//   Textarea,
//   Group,
//   Button,
//   TextInput,
//   Stack,
// } from "@mantine/core";
// import { AnnotationsContext } from "../context/AnnotationsContext";
// import { useContext, useEffect, useState } from "react";

// function AnnotationInput() {
//   const context = useContext(AnnotationsContext);
//   // const [annotationTypes, setAnnotationTypes] = useState({});
//   // const [isLoadingTypes, setIsLoadingTypes] = useState(true);

//   // const fetchAnnotationTypes = async () => {
//   //   setIsLoadingTypes(true);
//   //   try {
//   //     console.log("Attempt fetching annotation types.");
//   //     const response = await fetch(
//   //       `${import.meta.env.VITE_BACKEND_IP}/data/annotation_types`,
//   //       {
//   //         method: "GET",
//   //         headers: {
//   //           "Content-Type": "application/json",
//   //         },
//   //       }
//   //     );
//   //     const data = await response.json();
//   //     setAnnotationTypes(data);
//   //     console.log("Fetched types: ", data);
//   //   } catch (error) {
//   //     console.error("Could not load annotation types:", error);
//   //   } finally {
//   //     setIsLoadingTypes(false);
//   //   }
//   // };

//   // useEffect(() => {
//   //   fetchAnnotationTypes();
//   // }, []);

//   const form = useForm({
//     mode: "controlled",
//     initialValues: {
//       // Change this to use the first available type or empty string
//       type: context.currentNotes.type,
//       title: context.currentNotes.title,
//       notes: context.currentNotes.notes,
//     },
//     validate: {
//       type: (value) => (!value ? "Please select a type" : null),
//       title: (value) => (value === "" ? "Please enter a title" : null),
//       notes: (value) => (value === "" ? "Please enter notes" : null),
//     },
//   });
//   // const form = useForm({
//   //   mode: "controlled",
//   //   initialValues: {
//   //     type: context.currentNotes.type,
//   //     title: context.currentNotes.title,
//   //     notes: context.currentNotes.notes,
//   //   },
//   //   validate: {
//   //     title: (value) => (value === "" ? "Please enter a title" : null),
//   //     notes: (value) => (value === "" ? "Please enter notes" : null),
//   //   },
//   // });

//   useEffect(() => {
//     if (Object.keys(context.annotationTypes).length > 0) {
//       form.setFieldValue("type", Object.keys(context.annotationTypes)[0]);
//     }
//   }, [context.annotationTypes]);

//   useEffect(() => {
//     form.setValues({
//       type: context.currentNotes.type,
//       title: context.currentNotes.title,
//       notes: context.currentNotes.notes,
//     });
//   }, [context.currentNotes]);

//   const handleSubmit = (formValues) => {
//     const updatedAnnotation = {
//       ...context.currentNotes,
//       ...formValues,
//       annotationHexes: context.currentHexes,
//     };

//     context.updatePriorAnnotations(updatedAnnotation);
//     context.resetCurrentAnnotation();
//     context.setUpdatingAnnotation(false);
//   };

//   const handleReset = (formValues) => {
//     const updatedAnnotation = {
//       ...context.currentNotes,
//       annotationHexes: context.currentHexes,
//     };

//     if (context.updatingAnnotation) {
//       context.updatePriorAnnotations(updatedAnnotation);
//     }

//     context.resetCurrentAnnotation();
//     form.reset();
//   };

//   return (
//     <form onSubmit={form.onSubmit(handleSubmit)}>
//       <Fieldset
//         legend={
//           context.updatingAnnotation
//             ? "Edit Existing Annotation"
//             : "New Annotation"
//         }
//       >
//         <Stack gap="sm">
//           <NativeSelect
//             {...form.getInputProps("type")}
//             withAsterisk
//             label="Select Annotation Type"
//             data={Object.keys(context.annotationTypes)}
//             disabled={Object.keys(context.annotationTypes).length === 0}
//             // placeholder={
//             //   isLoadingTypes ? "Loading annotation types..." : "Select a type"
//             // }
//             onChange={(event) => {
//               form.setFieldValue("type", event.currentTarget.value);
//               // context.updateCurrentAnnotationType(event.currentTarget.value);
//               const updatedNotes = {
//                 ...context.currentNotes,
//                 ...form.values,
//                 type: event.currentTarget.value,
//               };

//               console.log(updatedNotes);
//               context.setCurrentNotes(updatedNotes);
//             }}
//           />
//           <TextInput
//             {...form.getInputProps("title")}
//             label="Annotation Title"
//             placeholder="Enter a title for your annotation"
//           />
//           <Textarea
//             {...form.getInputProps("notes")}
//             label="Annotation Notes"
//             placeholder="Enter your comments about the selected region"
//           />
//           <Group mt="md">
//             <Button type="submit" variant="outline" color="green">
//               {context.updatingAnnotation
//                 ? "Update Annotation"
//                 : "Add Annotation"}
//             </Button>
//             <Button
//               type="button"
//               variant="light"
//               color="red"
//               onClick={handleReset}
//             >
//               {context.updatingAnnotation
//                 ? "Cancel Update"
//                 : "Clear Annotation"}
//             </Button>
//           </Group>
//         </Stack>
//       </Fieldset>
//     </form>
//   );
// }

// export default AnnotationInput;
