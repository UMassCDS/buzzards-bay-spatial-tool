import React, { useContext } from "react";
import { useDisclosure } from "@mantine/hooks";
import {
  Drawer,
  ActionIcon,
  Stack,
  Text,
  Divider,
  Button,
} from "@mantine/core";
import {
  IconQuestionMark,
  IconArrowsMove,
  IconHandFinger,
} from "@tabler/icons-react";
import { IoMdCloseCircleOutline } from "react-icons/io";

import { AnnotationsContext } from "../context/AnnotationsContext";
import PropTypes from "prop-types";
import "../styles/Help.css";

function Legend({ externalTrigger = null }) {
  const [opened, { open, close }] = useDisclosure(false);
  const context = useContext(AnnotationsContext);

  // Listen for external trigger
  React.useEffect(() => {
    if (externalTrigger) {
      externalTrigger.current = open;
    }
  }, [externalTrigger, open]);

  return (
    <>
      <Drawer
        opened={opened}
        onClose={close}
        title="How to use this app?"
        styles={{
          drawer: {
            backgroundColor: "#000000",
            color: "#ffffff",
          },
          header: {
            backgroundColor: "#000000",
            color: "#ffffff",
          },
        }}
        closeButtonProps={{
          icon: <IoMdCloseCircleOutline size={20} stroke={1.5} />,
        }}
        position="right"
      >
        <Stack gap="xs" className="text-white">
          <h2 className="text-xl font-bold">Instructions</h2>
          <p>
            To begin an interview, enter the interviewee code provided by the
            researchers.
          </p>
          <p>
            The Data Panel at the left of the screen allows the user to input
            data. Users should only enter data at the direction of the
            interviewer.
          </p>
          <p>
            <strong>Select Type of Information</strong>: This dropdown menu is
            used to select the map layer to which the data input will be added.
          </p>
          <p>
            <strong>Data Title</strong>: Input a short title relevant to the
            data being entered. The interviewer will provide guidance on what to
            write.
          </p>
          <p>
            <strong>Location Rating</strong>: If prompted by the interviewer,
            select the appropriate rating response to the question asked.
            Otherwise leave as N/A.
          </p>
          <p>
            <strong>Explanation</strong>: Type in 2-3 sentences providing an
            answer/explanation to the interviewer&apos;s question.
          </p>
          <p>
            <strong>Save/Clear</strong>: Annotations will only be stored in the
            database if the save button is pushed. Reset will clear out all
            information typed before saving.
          </p>
          <p>
            <strong>Map modes</strong>: Use the toggle buttons on the left side
            of the map to switch between:
          </p>
          <ul>
            <li>
              <IconArrowsMove size={16} color="black" />
              <span>
                <strong> Pan mode</strong>: Move and navigate around the map
              </span>
            </li>
            <li>
              <IconHandFinger size={16} color="black" />
              <span>
                <strong> Select mode</strong>: Click hexagons to select/deselect
                them for annotations
              </span>
            </li>
          </ul>
          <p>To select a region on the map:</p>
          <ul>
            <li>
              Switch to Select mode, then click individual hexagons to
              select/deselect them
            </li>
            <li>Use multi-select mode to quickly highlight larger areas</li>
            <li>
              Click the hexagon icon in the top-left to draw custom polygons by
              placing points on the map
            </li>
            <li>
              Use the rectangle tool to erase multiple hexagons at once by
              drawing a rectangle
            </li>
          </ul>
          {context.intervieweeId && (
            <>
              <Divider my="md" color="black" />
              <Text>
                If there is an error with the application, or you want to start
                the interview from the beginning.{" "}
                <strong>
                  <i>Warning:</i>
                </strong>{" "}
                This action cannot be reversed!
              </Text>
              <Button
                onClick={context.resetInterview}
                variant="outline"
                color="red"
              >
                Clear current interview
              </Button>
            </>
          )}
        </Stack>
      </Drawer>
      <ActionIcon
        onClick={open}
        variant="filled"
        color="blue"
        size="lg"
        className="help-button"
      >
        <IconQuestionMark size={20} />
      </ActionIcon>
    </>
  );
}
Legend.propTypes = {
  externalTrigger: PropTypes.shape({
    current: PropTypes.any,
  }),
};

export default Legend;
